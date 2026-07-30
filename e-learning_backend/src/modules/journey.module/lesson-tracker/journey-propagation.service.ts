import mongoose from 'mongoose';
import { LessonTracker } from './lesson-tracker.model';
import { JourneyLesson } from '../journey-lesson/journey-lesson.model';
import { JourneyModule } from '../journey-module/journey-module.model';
import { StudentModuleTracker } from '../student-module-tracker/student-module-tracker.model';
import { StudentCapsuleTracker } from '../student-capsule-tracker/student-capsule-tracker.model';
import { TStudentModuleTrackerStatus } from '../student-module-tracker/student-module-tracker.constant';
import { TLessonTrackerStatus } from './lesson-tracker.constant';
import { TTrackerStatus } from '../student-capsule-tracker/student-capsule-tracker.constant';

export class JourneyPropagationService {
  static async propagateJourneyCompletion(studentId: string, lessonId: string) {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

    const tracker = await LessonTracker.findOne({ studentId: studentObjectId, lessonId: lessonObjectId });
    if (!tracker) return;

    const { moduleId, capsuleId, journeyId } = tracker;

    const lessonsInModule = await LessonTracker.find({
      studentId: studentObjectId,
      moduleId,
      isDeleted: false,
    });

    if (lessonsInModule.every(l => l.isCompleted)) {
      await StudentModuleTracker.findOneAndUpdate(
        { studentId: studentObjectId, moduleId },
        { status: TStudentModuleTrackerStatus.completed },
        { upsert: true }
      );

      const currentModule = await JourneyModule.findById(moduleId)
        .select('capsuleId orderNumber')
        .lean();

      if (currentModule) {
        const nextModule = await JourneyModule.findOne({
          capsuleId: currentModule.capsuleId,
          orderNumber: { $gt: currentModule.orderNumber },
          isDeleted: false,
        })
          .sort({ orderNumber: 1 })
          .lean();

        if (nextModule) {
          await StudentModuleTracker.findOneAndUpdate(
            {
              studentId: studentObjectId,
              capsuleId,
              moduleId: nextModule._id,
            },
            {
              $set: { status: TStudentModuleTrackerStatus.unlocked },
              $setOnInsert: {
                studentId: studentObjectId,
                capsuleId,
                moduleId: nextModule._id,
              },
            },
            { upsert: true },
          );

          const firstLesson = await JourneyLesson.findOne({
            moduleId: nextModule._id,
            isDeleted: false,
          })
            .sort({ orderNumber: 1, createdAt: 1 })
            .lean();

          if (firstLesson) {
            await LessonTracker.findOneAndUpdate(
              {
                studentId: studentObjectId,
                journeyId,
                capsuleId,
                moduleId: nextModule._id,
                lessonId: firstLesson._id,
              },
              {
                $set: { status: TLessonTrackerStatus.unlocked, isDeleted: false },
                $setOnInsert: {
                  studentId: studentObjectId,
                  journeyId,
                  capsuleId,
                  moduleId: nextModule._id,
                  lessonId: firstLesson._id,
                  lastWatchTime: 0,
                  isCompleted: false,
                },
              },
              { upsert: true },
            );
          }
        }
      }

      const modulesInCapsule = await StudentModuleTracker.find({
        studentId: studentObjectId,
        capsuleId,
        isDeleted: false,
      });

      if (modulesInCapsule.every(m => m.status === TStudentModuleTrackerStatus.completed)) {
        await StudentCapsuleTracker.findOneAndUpdate(
          { studentId: studentObjectId, capsuleId },
          { overallStatus: TTrackerStatus.completed },
          { upsert: true }
        );
      }
    }
  }
}
