import { StatusCodes } from 'http-status-codes';
import { IndividualModuleProgress } from './individual-module-progress.model';
import { IIndividualModuleProgress } from './individual-module-progress.interface';
import { GenericService } from '../../_generic-module/generic.services';
import mongoose from 'mongoose';
import { IndividualLesson } from '../individual-lesson/individual-lesson.model';
import { LessonProgress } from '../individual-lesson-progress/individual-lesson-progress.model';
import { TLessonProgress } from '../individual-lesson-progress/individual-lesson-progress.constant';
import { PurchasedIndividualCapsule } from '../purchased-individual-capsule/purchased-individual-capsule.model';
import { TPurchasedIndividualCapsuleStatus } from '../purchased-individual-capsule/purchased-individual-capsule.constant';
import { IndividualModule } from '../individual-module/individual-module.model';
import { TIndividualModuleProgress } from './individual-module-progress.constant';

export class IndividualModuleProgressService extends GenericService<
  typeof IndividualModuleProgress,
  IIndividualModuleProgress
> {
  constructor() {
    super(IndividualModuleProgress);
  }

  async getModuleProgressByCapsule(capsuleId: string, studentId: string) {
    return await IndividualModuleProgress.aggregate([
      {
        $match: {
          capsuleId: new mongoose.Types.ObjectId(capsuleId),
          studentId: new mongoose.Types.ObjectId(studentId),
        },
      },
      {
        $lookup: {
          from: 'purchasedadmincapsules',
          let: { capsuleId: new mongoose.Types.ObjectId(capsuleId) },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$capsuleId', '$$capsuleId'] },
                    { $eq: ['$studentId', new mongoose.Types.ObjectId(studentId)] },
                  ],
                },
              },
            },
          ],
          as: 'purchaseInfo',
        },
      },
      {
        $unwind: {
          path: '$purchaseInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'individualmodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'moduleInfo',
        },
      },
      { $unwind: '$moduleInfo' },
      {
        $lookup: {
          from: 'individuallessonprogresses',
          let: { moduleId: '$moduleId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$moduleId', '$$moduleId'] },
                    { $eq: ['$studentId', new mongoose.Types.ObjectId(studentId)] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'individuallessons',
                localField: 'lessonId',
                foreignField: '_id',
                as: 'lessonInfo',
              },
            },
            { $unwind: '$lessonInfo' },
            { $sort: { 'lessonInfo.orderNumber': 1 } },
            {
              $project: {
                _id: 1,
                lessonId: 1,
                status: 1,
                lastWatchTime: 1,
                completedAt: 1,
                title: '$lessonInfo.title',
                estimatedTime: '$lessonInfo.estimatedTime',
                orderNumber: '$lessonInfo.orderNumber',
              },
            },
          ],
          as: 'lessons',
        },
      },
      { $sort: { 'moduleInfo.orderNumber': 1 } },
      {
        $project: {
          _id: 1,
          moduleId: 1,
          status: 1,
          completedLessonsCount: 1,
          totalLessons: 1,
          title: '$moduleInfo.title',
          orderNumber: '$moduleInfo.orderNumber',
          lessons: 1,
          purchase: {
            status: '$purchaseInfo.status',
            paymentStatus: '$purchaseInfo.paymentStatus',
            progressPercent: '$purchaseInfo.progressPercent',
            completedModules: '$purchaseInfo.completedModules',
            totalModules: '$purchaseInfo.totalModules',
            totalLessons: '$purchaseInfo.totalLessons',
            completedLessons: '$purchaseInfo.completedLessons',
            isCertificateUploaded: '$purchaseInfo.isCertificateUploaded',
            isGifted: '$purchaseInfo.isGifted',
          },
        },
      },
    ]);
  }

  async getResumePoint(capsuleId: string, studentId: string) {
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const lastViewed = await LessonProgress.findOne({
      capsuleId: capsuleObjectId,
      studentId: studentObjectId,
      status: { $in: [TLessonProgress.inProgress, TLessonProgress.unlocked] },
    })
      .sort({ updatedAt: -1 })
      .populate('lessonId', 'title orderNumber estimatedTime')
      .populate('moduleId', 'title orderNumber')
      .lean();

    if (lastViewed) {
      return {
        lessonProgressId: lastViewed._id,
        lessonId: lastViewed.lessonId,
        moduleId: lastViewed.moduleId,
        status: lastViewed.status,
        lastWatchTime: lastViewed.lastWatchTime || 0,
      };
    }

    const firstUnlocked = await LessonProgress.findOne({
      capsuleId: capsuleObjectId,
      studentId: studentObjectId,
      status: TLessonProgress.unlocked,
    })
      .sort({ createdAt: 1 })
      .populate('lessonId', 'title orderNumber estimatedTime')
      .populate('moduleId', 'title orderNumber')
      .lean();

    if (firstUnlocked) {
      return {
        lessonProgressId: firstUnlocked._id,
        lessonId: firstUnlocked.lessonId,
        moduleId: firstUnlocked.moduleId,
        status: firstUnlocked.status,
        lastWatchTime: 0,
      };
    }

    return null;
  }

  async completeIndividualLesson(
    lessonProgressId: string,
    lessonId: string,
    studentId: string,
    capsuleId: string,
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
      const lessonProgressObjectId = new mongoose.Types.ObjectId(lessonProgressId);
      const studentObjectId = new mongoose.Types.ObjectId(studentId);
      const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);

      const lesson: any = await IndividualLesson.findById(lessonObjectId)
        .session(session)
        .lean();

      if (!lesson) throw new Error('Lesson not found');

      const updatedLessonProgress: any = await LessonProgress.findOneAndUpdate(
        {
          _id: lessonProgressObjectId,
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,
          status: { $ne: TLessonProgress.completed },
        },
        {
          $set: {
            status: TLessonProgress.completed,
            isCompleted: true,
            completedAt: new Date(),
          },
        },
        { new: true, session },
      );

      if (!updatedLessonProgress) {
        await session.commitTransaction();
        session.endSession();
        return { message: 'Lesson already completed (idempotent)' };
      }

      const updatedPurchase: any = await PurchasedIndividualCapsule.findOneAndUpdate(
        {
          capsuleId: capsuleObjectId,
          studentId: studentObjectId,
        },
        { $inc: { completedLessons: 1 } },
        { new: true, session },
      );

      if (updatedPurchase && updatedPurchase.totalLessons > 0) {
        const progressPercent = Math.round(
          (updatedPurchase.completedLessons / updatedPurchase.totalLessons) * 100,
        );
        await PurchasedIndividualCapsule.updateOne(
          { _id: updatedPurchase._id },
          {
            $set: {
              progressPercent,
              status: TPurchasedIndividualCapsuleStatus.inProgress,
            },
          },
          { session },
        );
      }

      await IndividualModuleProgress.updateOne(
        {
          moduleId: updatedLessonProgress.moduleId,
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,
        },
        {
          $inc: { completedLessonsCount: 1 },
          $set: { status: TIndividualModuleProgress.inProgress },
        },
        { session },
      );

      const nextLesson: any = await IndividualLesson.findOne({
        moduleId: updatedLessonProgress.moduleId,
        orderNumber: { $gt: lesson.orderNumber },
      })
        .sort({ orderNumber: 1 })
        .session(session);

      if (nextLesson) {
        await LessonProgress.findOneAndUpdate(
          {
            capsuleId: capsuleObjectId,
            studentId: studentObjectId,
            lessonId: nextLesson._id,
          },
          { $set: { status: TLessonProgress.unlocked } },
          { session, upsert: true, new: true },
        );

        await session.commitTransaction();
        session.endSession();
        return {
          message: 'Lesson completed, next lesson unlocked',
          nextLessonId: nextLesson._id,
        };
      }

      await IndividualModuleProgress.updateOne(
        {
          moduleId: lesson.moduleId,
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,
        },
        { $set: { status: TIndividualModuleProgress.completed, completedAt: new Date() } },
        { session },
      );

      await PurchasedIndividualCapsule.updateOne(
        {
          capsuleId: capsuleObjectId,
          studentId: studentObjectId,
        },
        { $inc: { completedModules: 1 } },
        { session },
      );

      const currentModule: any = await IndividualModule.findById(lesson.moduleId)
        .session(session)
        .lean();

      if (!currentModule) throw new Error('Module not found');

      const nextModule: any = await IndividualModule.findOne({
        capsuleId: currentModule.capsuleId,
        orderNumber: { $gt: currentModule.orderNumber },
      })
        .sort({ orderNumber: 1 })
        .session(session);

      if (nextModule) {
        await IndividualModuleProgress.updateOne(
          {
            moduleId: nextModule._id,
            studentId: studentObjectId,
            capsuleId: capsuleObjectId,
          },
          {
            $set: {
              status: TIndividualModuleProgress.inProgress,
              createdAt: new Date(),
            },
          },
          { session, upsert: true },
        );

        const firstLesson: any = await IndividualLesson.findOne({
          moduleId: nextModule._id,
        })
          .sort({ orderNumber: 1 })
          .session(session);

        if (firstLesson) {
          await LessonProgress.updateOne(
            {
              capsuleId: capsuleObjectId,
              studentId: studentObjectId,
              lessonId: firstLesson._id,
            },
            {
              $setOnInsert: {
                status: TLessonProgress.unlocked,
                moduleId: firstLesson.moduleId,
                orderNumber: firstLesson.orderNumber,
                createdAt: new Date(),
              },
            },
            { session, upsert: true },
          );
        }

        await session.commitTransaction();
        session.endSession();
        return {
          message: 'Module completed, next module unlocked',
          nextModuleId: nextModule._id,
          firstLessonId: firstLesson?._id,
        };
      }

      await PurchasedIndividualCapsule.updateOne(
        {
          capsuleId: capsuleObjectId,
          studentId: studentObjectId,
        },
        {
          $set: {
            status: TPurchasedIndividualCapsuleStatus.complete,
            progressPercent: 100,
            completionDate: new Date(),
          },
        },
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return {
        message: 'Capsule completed',
        capsuleId: capsuleObjectId,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
