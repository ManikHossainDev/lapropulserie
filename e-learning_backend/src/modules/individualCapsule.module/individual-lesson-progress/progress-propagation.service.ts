import mongoose from 'mongoose';
import { LessonProgress } from './individual-lesson-progress.model';
import { IndividualModuleProgress } from '../individual-module-progress/individual-module-progress.model';
import { PurchasedIndividualCapsule } from '../purchased-individual-capsule/purchased-individual-capsule.model';
import { TIndividualModuleProgress } from '../individual-module-progress/individual-module-progress.constant';
import { TPurchasedIndividualCapsuleStatus } from '../purchased-individual-capsule/purchased-individual-capsule.constant';

export class ProgressPropagationService {
  static async propagateIndividualCapsuleCompletion(studentId: string, lessonId: string) {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

    const lessonProgress = await LessonProgress.findOne({
      studentId: studentObjectId,
      lessonId: lessonObjectId,
    });
    if (!lessonProgress) return;

    const { moduleId, capsuleId } = lessonProgress;

    const allLessonsInModule = await LessonProgress.find({
      studentId: studentObjectId,
      moduleId,
      isDeleted: false,
    });
    const completedLessonsInModule = allLessonsInModule.filter((l) => l.isCompleted);

    if (allLessonsInModule.length === completedLessonsInModule.length) {
      await IndividualModuleProgress.findOneAndUpdate(
        { studentId: studentObjectId, moduleId },
        { status: TIndividualModuleProgress.completed, completedAt: new Date() },
        { upsert: true },
      );

      const allModulesInCapsule = await IndividualModuleProgress.find({
        studentId: studentObjectId,
        capsuleId,
        isDeleted: false,
      });
      const completedModulesInCapsule = allModulesInCapsule.filter(
        (m) => m.status === TIndividualModuleProgress.completed,
      );

      if (allModulesInCapsule.length === completedModulesInCapsule.length) {
        await PurchasedIndividualCapsule.findOneAndUpdate(
          { studentId: studentObjectId, capsuleId },
          { status: TPurchasedIndividualCapsuleStatus.complete, completionDate: new Date() },
        );
      }
    }
  }
}
