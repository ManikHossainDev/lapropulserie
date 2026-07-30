import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../../errors/ApiError';
import { Questionary } from './questionary/questionary.model';
import { Question } from './question/question.model';
import { StudentAnswer } from './studentAnswer/studentAnswer.model';
import { StudentQuestionaryTracker } from './tracker/tracker.model';
import { User } from '../user.module/user/user.model';
import { IUser } from '../user.module/user/user.interface';
import {
  TStudentQuestionaryStatus,
  TStudentAnswerStatus,
  TQuestionaryCategory,
} from './question.constant';
import { IQuestionary, IQuestion, IQuestionOption } from './question.interface';
import { JwtPayload } from 'jsonwebtoken';
import { normalizeOptionalObjectId } from './question.utils';

// Utility function to transform lean objects to JSON format (id instead of _id, remove __v)
const transformToJSON = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }

  if (value && typeof value.toHexString === 'function') {
    return value.toHexString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(transformToJSON);
  }

  if (typeof value === 'object') {
    // Handle Mongoose documents
    if (value._doc) {
      return transformToJSON(value._doc);
    }
    const transformed: Record<string, any> = {};
    Object.entries(value).forEach(([key, nestedValue]) => {
      if (
        key === '__v' ||
        key === '$__' ||
        key === '$isNew' ||
        key.startsWith('$')
      ) {
        return;
      }
      if (key === '_id') {
        transformed.id = transformToJSON(nestedValue);
        return;
      }
      transformed[key] = transformToJSON(nestedValue);
    });
    return transformed;
  }

  return value;
};

const omitUndefinedFields = <T extends Record<string, any>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as Partial<T>;

const sanitizeQuestionaryData = <
  T extends {
    referenceId?: unknown;
  },
>(
  payload: T,
) =>
  omitUndefinedFields({
    ...payload,
    referenceId: normalizeOptionalObjectId(payload.referenceId),
  });

// -------------------------------------------------------------
// Admin: Unified Questionary Services
// -------------------------------------------------------------
const createQuestionary = async (
  payload: Partial<IQuestionary> & { questions?: Partial<IQuestion>[] },
) => {
  const { questions, ...questionaryData } = payload;

  const questionary = await Questionary.create(
    sanitizeQuestionaryData(questionaryData),
  );
  const questionaryId = questionary._id;
  if (!questionaryId)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create questionary',
    );

  if (questions && questions.length > 0) {
    const questionDocs = questions.map(q => ({
      ...q,
      questionaryId,
    }));
    await Question.create(questionDocs);
  }

  const result = await Questionary.findById(questionaryId).lean();
  const createdQuestions = await Question.find({
    questionaryId,
    isDeleted: false,
  })
    .select('-options.isCorrect')
    .sort({ sl: 1 })
    .lean();

  return transformToJSON({ ...result, questions: createdQuestions });
};

const updateQuestionary = async (
  id: string,
  payload: {
    title?: string;
    brief?: string;
    category?: TQuestionaryCategory;
    referenceId?: string;
    questions?: {
      create?: Partial<IQuestion>[];
      update?: {
        id?: string;
        sl?: number;
        title?: string;
        type?: string;
        helperText?: string;
        options?: IQuestionOption[];
      }[];
      delete?: string[];
    };
  },
) => {
  const { questions, ...questionaryData } = payload;

  const questionary = await Questionary.findByIdAndUpdate(
    id,
    sanitizeQuestionaryData(questionaryData),
    {
      new: true,
    },
  );
  if (!questionary)
    throw new ApiError(httpStatus.NOT_FOUND, 'Questionary not found');

  if (questions) {
    if (questions.create && questions.create.length > 0) {
      const questionDocs = questions.create.map(q => ({
        ...q,
        questionaryId: id,
      }));
      await Question.create(questionDocs);
    }

    if (questions.update && questions.update.length > 0) {
      for (const q of questions.update) {
        const { id: questionId, ...updateData } = q;
        if (questionId) {
          await Question.findByIdAndUpdate(questionId, updateData, {
            new: true,
          });
        }
      }
    }

    if (questions.delete && questions.delete.length > 0) {
      await Question.updateMany(
        { _id: { $in: questions.delete }, questionaryId: id },
        { isDeleted: true },
      );
    }
  }

  const updatedQuestions = await Question.find({
    questionaryId: id,
    isDeleted: false,
  })
    .select('-options.isCorrect')
    .sort({ sl: 1 })
    .lean();

  return transformToJSON({
    ...questionary.toObject(),
    questions: updatedQuestions,
  });
};

const deleteQuestionary = async (id: string) => {
  const result = await Questionary.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result)
    throw new ApiError(httpStatus.NOT_FOUND, 'Questionary not found');

  await Question.updateMany({ questionaryId: id }, { isDeleted: true });

  return result;
};

const getAllQuestionnaires = async (query: any) => {
  const { category, sort = 'asc', ...filters } = query;
  const where: any = { isDeleted: false, ...filters };
  if (category) where.category = category;
  const sortOrder = sort === 'desc' ? -1 : 1;
  return await Questionary.find(where).sort({ createdAt: sortOrder });
};

const getQuestionaryByIdAdmin = async (id: string) => {
  const questionary = await Questionary.findOne({
    _id: id,
    isDeleted: false,
  }).lean();
  if (!questionary)
    throw new ApiError(httpStatus.NOT_FOUND, 'Questionary not found');

  const questions = await Question.find({ questionaryId: id, isDeleted: false })
    .select('-options.isCorrect')
    .sort({ sl: 1 })
    .lean();
  return transformToJSON({ ...questionary, questions });
};

// -------------------------------------------------------------
// Student: Answer & Progress Services
// -------------------------------------------------------------
const getStudentQuestionnairesByCategory = async (
  category: TQuestionaryCategory,
  studentId: string,
  sort: string = 'asc',
) => {
  const sortOrder = sort === 'desc' ? -1 : 1;
  const questionnaires = await Questionary.find({ category, isDeleted: false })
    .sort({ createdAt: sortOrder })
    .lean();

  const trackers = await StudentQuestionaryTracker.find({
    studentId,
    questionaryId: { $in: questionnaires.map(q => q._id) },
    isDeleted: false,
  }).lean();

  return questionnaires.map(q => {
    const tracker = trackers.find(
      t => t.questionaryId.toString() === q._id.toString(),
    );
    return transformToJSON({
      ...q,
      tracker: tracker || null,
    });
  });
};

const getStudentQuestionaryDetails = async (
  questionaryId: string,
  studentId: string,
) => {
  const questionary = await Questionary.findById(questionaryId).lean();
  if (!questionary)
    throw new ApiError(httpStatus.NOT_FOUND, 'Questionary not found');

  const questions = await Question.find({
    questionaryId: new mongoose.Types.ObjectId(questionaryId),
    isDeleted: false,
  })
    .select('-options.isCorrect')
    .sort({ sl: 1 })
    .lean();

  const tracker = await StudentQuestionaryTracker.findOne({
    questionaryId: new mongoose.Types.ObjectId(questionaryId),
    studentId,
    isDeleted: false,
  }).lean();
  const answers = await StudentAnswer.find({
    questionaryId: new mongoose.Types.ObjectId(questionaryId),
    studentId,
    isDeleted: false,
  })
    .select('-isCorrect')
    .lean();

  return transformToJSON({ questionary, questions, tracker, answers });
};

const getStudentResumeState = async (studentId: string) => {
  const user = await User.findById(studentId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.activeQuestionary?.questionaryId) {
    return {
      hasActiveSession: false,
      hasCompletedQuestionnaire: user.hasCompletedQuestionnaire || false,
    };
  }

  const tracker = await StudentQuestionaryTracker.findOne({
    studentId,
    questionaryId: user.activeQuestionary.questionaryId,
    isDeleted: false,
  }).lean();

  if (!tracker || tracker.status === TStudentQuestionaryStatus.completed) {
    return { hasActiveSession: false, hasCompletedQuestionnaire: true };
  }

  const questionary = await Questionary.findOne({
    _id: user.activeQuestionary.questionaryId,
    isDeleted: false,
  }).lean();

  if (!questionary) {
    return transformToJSON({
      hasActiveSession: false,
      hasCompletedQuestionnaire: user.hasCompletedQuestionnaire || false,
    });
  }

  return transformToJSON({
    hasActiveSession: true,
    questionaryId: tracker.questionaryId,
    lastQuestionId: tracker.lastQuestionId,
    progress: tracker.progress,
    status: tracker.status,
    questionaryTitle: questionary.title,
    hasCompletedQuestionnaire: user.hasCompletedQuestionnaire || false,
  });
};

const submitStudentAnswer = async (
  studentId: string,
  questionaryId: string,
  questionId: string,
  answer: any,
  capsuleId?: string,
) => {
  const question = await Question.findOne({
    _id: questionId,
    questionaryId,
    isDeleted: false,
  });
  if (!question) throw new ApiError(httpStatus.NOT_FOUND, 'Question not found');

  let isCorrect = false;
  if (
    question.type === 'Single Select' ||
    question.type === 'Multiple Select'
  ) {
    const correctOptions = question.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.sl);
    if (Array.isArray(answer)) {
      isCorrect =
        correctOptions.length === answer.length &&
        correctOptions.every(sl => answer.includes(sl));
    } else {
      isCorrect = correctOptions.includes(answer);
    }
  }

  const normalizedCapsuleId = normalizeOptionalObjectId(capsuleId);

  const studentAnswer = await StudentAnswer.findOneAndUpdate(
    { studentId, questionaryId, questionId, isDeleted: false },
    {
      answer,
      questionType: question.type,
      capsuleId: normalizedCapsuleId
        ? new mongoose.Types.ObjectId(String(normalizedCapsuleId))
        : undefined,
      isCorrect,
      status: TStudentAnswerStatus.completed,
    },
    { new: true, upsert: true },
  );

  let tracker = await StudentQuestionaryTracker.findOne({
    studentId,
    questionaryId,
    isDeleted: false,
  });

  const totalQuestions = await Question.countDocuments({
    questionaryId,
    isDeleted: false,
  });
  const answeredCount = await StudentAnswer.countDocuments({
    studentId,
    questionaryId,
    isDeleted: false,
  });
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const status =
    progress === 100
      ? TStudentQuestionaryStatus.completed
      : TStudentQuestionaryStatus.inProgress;

  if (tracker) {
    tracker.lastQuestionId = question._id as any;
    tracker.progress = progress;
    tracker.status = status;
    await tracker.save();
  } else {
    tracker = await StudentQuestionaryTracker.create({
      studentId,
      questionaryId,
      lastQuestionId: question._id,
      progress,
      status,
    });
  }

  await User.findByIdAndUpdate(studentId, {
    activeQuestionary: {
      questionaryId,
      questionId,
    },
    ...(status === TStudentQuestionaryStatus.completed
      ? { hasCompletedQuestionnaire: true }
      : {}),
  });

  return transformToJSON({ studentAnswer, tracker });
};

const submitBulkAnswers = async (
  studentId: string,
  questionaryId: string,
  answers: Array<{ questionId: string; answer: any; capsuleId?: string }>,
) => {
  const questions = await Question.find({
    _id: { $in: answers.map(a => a.questionId) },
    questionaryId,
    isDeleted: false,
  });

  if (questions.length !== answers.length) {
    const foundIds = questions.map(q => q._id.toString());
    const missing = answers
      .filter(a => !foundIds.includes(a.questionId))
      .map(a => a.questionId);
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Questions not found: ${missing.join(', ')}`,
    );
  }

  const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

  const answerResults = await Promise.all(
    answers.map(async ({ questionId, answer, capsuleId }) => {
      const question = questionMap.get(questionId);
      if (!question) {
        return { questionId, success: false, error: 'Question not found' };
      }

      let isCorrect = false;
      if (
        question.type === 'Single Select' ||
        question.type === 'Multiple Select'
      ) {
        const correctOptions = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.sl);
        if (Array.isArray(answer)) {
          isCorrect =
            correctOptions.length === answer.length &&
            correctOptions.every(sl => answer.includes(sl));
        } else {
          isCorrect = correctOptions.includes(answer);
        }
      }

      const normalizedCapsuleId = normalizeOptionalObjectId(capsuleId);

      const studentAnswer = await StudentAnswer.findOneAndUpdate(
        { studentId, questionaryId, questionId, isDeleted: false },
        {
          answer,
          questionType: question.type,
          capsuleId: normalizedCapsuleId
            ? new mongoose.Types.ObjectId(String(normalizedCapsuleId))
            : undefined,
          isCorrect,
          status: TStudentAnswerStatus.completed,
        },
        { new: true, upsert: true },
      );

      return { questionId, success: true, data: studentAnswer };
    }),
  );

  const totalQuestions = await Question.countDocuments({
    questionaryId,
    isDeleted: false,
  });
  const answeredCount = await StudentAnswer.countDocuments({
    studentId,
    questionaryId,
    isDeleted: false,
  });
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const status =
    progress === 100
      ? TStudentQuestionaryStatus.completed
      : TStudentQuestionaryStatus.inProgress;

  let tracker = await StudentQuestionaryTracker.findOne({
    studentId,
    questionaryId,
    isDeleted: false,
  });

  if (tracker) {
    tracker.progress = progress;
    tracker.status = status;
    await tracker.save();
  } else {
    tracker = await StudentQuestionaryTracker.create({
      studentId,
      questionaryId,
      progress,
      status,
    });
  }

  const lastAnswer = answers[answers.length - 1];
  if (lastAnswer) {
    await StudentQuestionaryTracker.findOneAndUpdate(
      { studentId, questionaryId, isDeleted: false },
      { lastQuestionId: new mongoose.Types.ObjectId(lastAnswer.questionId) },
    );
  }

  await User.findByIdAndUpdate(studentId, {
    activeQuestionary: {
      questionaryId,
      questionId: answers[answers.length - 1]?.questionId,
    },
    ...(status === TStudentQuestionaryStatus.completed
      ? { hasCompletedQuestionnaire: true }
      : {}),
  });

  return {
    submitted: answerResults.filter(r => r.success).length,
    failed: answerResults.filter(r => !r.success).length,
    progress,
    status,
  };
};

export const QuestionService = {
  createQuestionary,
  updateQuestionary,
  deleteQuestionary,
  getAllQuestionnaires,
  getQuestionaryByIdAdmin,
  getStudentQuestionnairesByCategory,
  getStudentQuestionaryDetails,
  getStudentResumeState,
  submitStudentAnswer,
  submitBulkAnswers,
};
