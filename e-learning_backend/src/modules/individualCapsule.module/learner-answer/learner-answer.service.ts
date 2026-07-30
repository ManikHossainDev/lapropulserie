import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { LearnerAnswer } from './learner-answer.model';
import {
  IExerciseAnswerItem,
  ILearnerAnswer,
  IReflectionAnswerItem,
  ISaveLearnerAnswersPayload,
} from './learner-answer.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { IndividualCapsule } from '../individual-capsule/individual-capsule.model';
import ApiError from '../../../errors/ApiError';
import { assertStudentCapsuleAccess } from '../shared/capsule-access.helper';

function mergeAnswerItems<T extends { orderNumber: number; answer: string }>(
  existing: T[],
  incoming: T[],
): T[] {
  const map = new Map<number, T>();
  for (const item of existing) {
    map.set(item.orderNumber, item);
  }
  for (const item of incoming) {
    map.set(item.orderNumber, item);
  }
  return [...map.values()].sort((a, b) => a.orderNumber - b.orderNumber);
}

export class LearnerAnswerService extends GenericService<
  typeof LearnerAnswer,
  ILearnerAnswer
> {
  constructor() {
    super(LearnerAnswer);
  }

  async assertCapsuleAccess(
    studentId: string,
    capsuleId: string,
    options?: { journeyId?: string },
  ) {
    return assertStudentCapsuleAccess(studentId, capsuleId, options);
  }

  private async validateAnswerOrderNumbers(
    capsuleId: string,
    reflectionAnswers: IReflectionAnswerItem[] = [],
    exerciseAnswers: IExerciseAnswerItem[] = [],
  ) {
    const capsule = await IndividualCapsule.findOne({
      _id: capsuleId,
      isDeleted: false,
    })
      .select('reflection practicalExercises')
      .lean();

    if (!capsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const validReflectionOrders = new Set(
      (capsule.reflection?.questions || []).map((q) => q.orderNumber),
    );
    const validExerciseOrders = new Set(
      (capsule.practicalExercises?.exercises || []).map((e) => e.orderNumber),
    );

    for (const item of reflectionAnswers) {
      if (validReflectionOrders.size && !validReflectionOrders.has(item.orderNumber)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Invalid reflection question orderNumber: ${item.orderNumber}`,
        );
      }
    }

    for (const item of exerciseAnswers) {
      if (validExerciseOrders.size && !validExerciseOrders.has(item.orderNumber)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Invalid exercise orderNumber: ${item.orderNumber}`,
        );
      }
    }

    if (reflectionAnswers.length > 10) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Reflection answers cannot exceed 10');
    }
  }

  async saveAnswers(
    studentId: string,
    payload: ISaveLearnerAnswersPayload,
  ): Promise<ILearnerAnswer> {
    const { capsuleId } = payload;
    const reflectionAnswers = payload.reflectionAnswers || [];
    const exerciseAnswers = payload.exerciseAnswers || [];

    await this.assertCapsuleAccess(studentId, capsuleId, {
      journeyId: payload.journeyId,
    });
    await this.validateAnswerOrderNumbers(capsuleId, reflectionAnswers, exerciseAnswers);

    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);

    const existing = await LearnerAnswer.findOne({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      isDeleted: false,
    });

    if (existing) {
      const updated = await LearnerAnswer.findByIdAndUpdate(
        existing._id,
        {
          reflectionAnswers: reflectionAnswers.length
            ? mergeAnswerItems(existing.reflectionAnswers, reflectionAnswers)
            : existing.reflectionAnswers,
          exerciseAnswers: exerciseAnswers.length
            ? mergeAnswerItems(existing.exerciseAnswers, exerciseAnswers)
            : existing.exerciseAnswers,
        },
        { new: true, runValidators: true },
      ).lean();

      return updated as ILearnerAnswer;
    }

    const created = await LearnerAnswer.create({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      reflectionAnswers,
      exerciseAnswers,
    });

    return created.toObject() as ILearnerAnswer;
  }

  async getByCapsuleId(
    studentId: string,
    capsuleId: string,
    options?: { journeyId?: string },
  ): Promise<ILearnerAnswer | null> {
    await this.assertCapsuleAccess(studentId, capsuleId, options);

    const capsule = await IndividualCapsule.findOne({
      _id: capsuleId,
      isDeleted: false,
    }).select('_id title');

    if (!capsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const answers = await LearnerAnswer.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      capsuleId: new mongoose.Types.ObjectId(capsuleId),
      isDeleted: false,
    }).lean();

    if (!answers) {
      return {
        studentId: new mongoose.Types.ObjectId(studentId),
        capsuleId: new mongoose.Types.ObjectId(capsuleId),
        reflectionAnswers: [],
        exerciseAnswers: [],
      } as ILearnerAnswer;
    }

    return answers;
  }
}
