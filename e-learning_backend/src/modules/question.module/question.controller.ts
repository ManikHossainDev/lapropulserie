import httpStatus from 'http-status';
import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { QuestionService } from './question.service';

const getUserId = (req: Request): string => {
  const user = req.user as any;
  const id = user?._id || user?.userId;
  return id ? String(id) : '';
};

// -------------------------------------------------------------
// Admin: Unified Questionary Controllers
// -------------------------------------------------------------
const createQuestionary = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.createQuestionary(req.body);
  sendResponse(res, {
    code: httpStatus.CREATED,
    success: true,
    message: 'Questionnaire created successfully',
    data: result,
  });
});

const updateQuestionary = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.updateQuestionary(
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Questionnaire updated successfully',
    data: result,
  });
});

const deleteQuestionary = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.deleteQuestionary(
    req.params.id as string,
  );
  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Questionnaire deleted successfully',
    data: result,
  });
});

const getAllQuestionnaires = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.getAllQuestionnaires(req.query);
  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Questionnaires fetched successfully',
    data: result,
  });
});

const getQuestionaryByIdAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await QuestionService.getQuestionaryByIdAdmin(
      req.params.id as string,
    );
    sendResponse(res, {
      code: httpStatus.OK,
      success: true,
      message: 'Questionnaire details fetched successfully',
      data: result,
    });
  },
);

// -------------------------------------------------------------
// Student: Controllers
// -------------------------------------------------------------
const getStudentQuestionnairesByCategory = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = getUserId(req);
    const category = req.params.category as string;
    const sort = (req.query.sort as string) || 'asc';
    const result = await QuestionService.getStudentQuestionnairesByCategory(
      category as any,
      studentId,
      sort,
    );
    sendResponse(res, {
      code: httpStatus.OK,
      success: true,
      message: 'Questionnaires by category fetched successfully',
      data: result,
    });
  },
);

const getStudentQuestionaryDetails = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = getUserId(req);
    const questionaryId = req.params.questionaryId as string;
    const result = await QuestionService.getStudentQuestionaryDetails(
      questionaryId,
      studentId,
    );
    sendResponse(res, {
      code: httpStatus.OK,
      success: true,
      message: 'Student questionnaire fetched successfully',
      data: result,
    });
  },
);

const getStudentResumeState = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = getUserId(req);
    const result = await QuestionService.getStudentResumeState(studentId);
    sendResponse(res, {
      code: httpStatus.OK,
      success: true,
      message: 'Resume state fetched successfully',
      data: result,
    });
  },
);

const submitStudentAnswer = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const questionId = req.params.questionId as string;
  const questionaryId = req.params.questionaryId as string;
  const { answer, capsuleId } = req.body;

  const result = await QuestionService.submitStudentAnswer(
    studentId,
    questionaryId,
    questionId,
    answer,
    capsuleId,
  );
  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Answer submitted successfully',
    data: result,
  });
});

const submitBulkAnswers = catchAsync(async (req: Request, res: Response) => {
  const studentId = getUserId(req);
  const questionaryId = req.params.questionaryId as string;
  const { answers } = req.body;

  const result = await QuestionService.submitBulkAnswers(
    studentId,
    questionaryId,
    answers,
  );
  sendResponse(res, {
    code: httpStatus.OK,
    success: true,
    message: 'Bulk answers submitted successfully',
    data: result,
  });
});

export const QuestionController = {
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
