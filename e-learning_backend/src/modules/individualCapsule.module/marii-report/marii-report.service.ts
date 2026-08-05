import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { MariiReport } from './marii-report.model';
import { JourneyMariiReport } from './journey-marii-report.model';
import { IMariiReport } from './marii-report.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { LearnerAnswer } from '../learner-answer/learner-answer.model';
import { IndividualCapsule } from '../individual-capsule/individual-capsule.model';
import { User } from '../../user.module/user/user.model';
import { assertStudentCapsuleAccess } from '../shared/capsule-access.helper';
import { resolveLearnerFirstName } from './learner-name.helper';
import { emitEmailJob } from '../../../helpers/emailEventEmitter';
import { generateMariiReportContent, generateExpeditionSynthesisContent } from './marii-ai.service';
import { buildMariiReportPdf } from './marii-report.pdf';
import { Journey } from '../../journey.module/journey/journey.model';
import { JourneyCapsule } from '../../journey.module/journey-capsule/journey-capsule.model';
import { PurchasedJourney } from '../../journey.module/purchased-journey/purchased-journey.model';

export class MariiReportService extends GenericService<typeof MariiReport, IMariiReport> {
  constructor() {
    super(MariiReport);
  }

  private async loadGenerationContext(
    studentId: string,
    capsuleId: string,
    options?: { journeyId?: string },
  ) {
    await assertStudentCapsuleAccess(studentId, capsuleId, {
      journeyId: options?.journeyId,
    });

    const learnerAnswers = await LearnerAnswer.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      capsuleId: new mongoose.Types.ObjectId(capsuleId),
      isDeleted: false,
    }).lean();

    const reflectionAnswers = learnerAnswers?.reflectionAnswers || [];
    const exerciseAnswers = learnerAnswers?.exerciseAnswers || [];

    if (!reflectionAnswers.length && !exerciseAnswers.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Complete Parts 3 and 4 before generating your Marii report',
      );
    }

    const capsule = await IndividualCapsule.findById(capsuleId)
      .select('title reflection practicalExercises')
      .lean();

    if (!capsule) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
    }

    const student = await User.findById(studentId).select('name email').lean();
    const studentName = await resolveLearnerFirstName(studentId);

    return {
      student,
      studentName,
      capsule,
      reflectionAnswers,
      exerciseAnswers,
    };
  }

  async generateReport(
    studentId: string,
    capsuleId: string,
    options?: { journeyId?: string; skipEmail?: boolean },
  ): Promise<IMariiReport> {
    const ctx = await this.loadGenerationContext(studentId, capsuleId, options);

    let expeditionContext: string | undefined;
    if (options?.journeyId) {
      const journey = await Journey.findById(options.journeyId).select('title').lean();
      if (journey) expeditionContext = `Expédition: ${journey.title}`;
    }

    const { report, reportHtml, source } = await generateMariiReportContent({
      studentName: ctx.studentName,
      capsuleTitle: ctx.capsule.title,
      reflectionAnswers: ctx.reflectionAnswers,
      exerciseAnswers: ctx.exerciseAnswers,
      reflectionQuestions: ctx.capsule.reflection?.questions || [],
      exercises: ctx.capsule.practicalExercises?.exercises || [],
      expeditionContext,
    });

    const saved = await MariiReport.findOneAndUpdate(
      {
        studentId: new mongoose.Types.ObjectId(studentId),
        capsuleId: new mongoose.Types.ObjectId(capsuleId),
        isDeleted: false,
      },
      {
        studentId: new mongoose.Types.ObjectId(studentId),
        capsuleId: new mongoose.Types.ObjectId(capsuleId),
        report,
        reportHtml,
        source,
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    if (!options?.skipEmail && ctx.student?.email) {
      emitEmailJob({
        to: ctx.student.email,
        subject: `Votre rapport Marii — ${ctx.capsule.title}`,
        html: reportHtml,
      });
    }

    if (options?.journeyId) {
      await this.tryGenerateExpeditionSynthesis(studentId, options.journeyId);
    }

    return saved as IMariiReport;
  }

  /** Auto-generate when learner reaches Part 6 — regenerates if answers were updated after the report. */
  async generateReportIfMissing(
    studentId: string,
    capsuleId: string,
    journeyId?: string,
  ): Promise<IMariiReport | null> {
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);

    const existing = await MariiReport.findOne({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      isDeleted: false,
    }).lean();

    if (existing) {
      const answers = await LearnerAnswer.findOne({
        studentId: studentObjectId,
        capsuleId: capsuleObjectId,
        isDeleted: false,
      })
        .select('updatedAt')
        .lean();

      const reportUpdated = existing.updatedAt
        ? new Date(existing.updatedAt as Date).getTime()
        : 0;
      const answersUpdated = answers?.updatedAt
        ? new Date(answers.updatedAt as Date).getTime()
        : 0;

      // Keep existing report unless learner answers changed after it was generated.
      if (!answers || answersUpdated <= reportUpdated) {
        return existing as IMariiReport;
      }
    }

    try {
      return await this.generateReport(studentId, capsuleId, { journeyId });
    } catch (error) {
      if (error instanceof ApiError && error.code === StatusCodes.BAD_REQUEST) {
        return null;
      }
      throw error;
    }
  }

  async tryGenerateExpeditionSynthesis(studentId: string, journeyId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const purchase = await PurchasedJourney.findOne({
      journeyId: journeyObjectId,
      studentId: studentObjectId,
      paymentStatus: 'completed',
      isDeleted: false,
    }).lean();

    if (!purchase) return null;

    const journeyCapsules = await JourneyCapsule.find({
      journeyId: journeyObjectId,
      isDeleted: false,
      individualCapsuleId: { $exists: true, $ne: null },
    })
      .sort({ capsuleNumber: 1 })
      .lean();

    const individualIds = journeyCapsules
      .map((c) => c.individualCapsuleId)
      .filter(Boolean) as mongoose.Types.ObjectId[];

    if (!individualIds.length) return null;

    const reports = await MariiReport.find({
      studentId: studentObjectId,
      capsuleId: { $in: individualIds },
      isDeleted: false,
    }).lean();

    if (reports.length < individualIds.length) return null;

    return this.generateExpeditionReport(studentId, journeyId);
  }

  async generateExpeditionReport(studentId: string, journeyId: string) {
    const journeyObjectId = new mongoose.Types.ObjectId(journeyId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const journey = await Journey.findById(journeyObjectId).select('title').lean();
    if (!journey) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Journey not found');
    }

    const journeyCapsules = await JourneyCapsule.find({
      journeyId: journeyObjectId,
      isDeleted: false,
      individualCapsuleId: { $exists: true, $ne: null },
    })
      .sort({ capsuleNumber: 1 })
      .lean();

    const individualIds = journeyCapsules
      .map((c) => c.individualCapsuleId)
      .filter(Boolean) as mongoose.Types.ObjectId[];

    const reports = await MariiReport.find({
      studentId: studentObjectId,
      capsuleId: { $in: individualIds },
      isDeleted: false,
    })
      .populate('capsuleId', 'title')
      .lean();

    if (reports.length < individualIds.length) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Complete all capsules in this expedition before generating the final synthesis',
      );
    }

    const student = await User.findById(studentId).select('name email').lean();
    const studentName = await resolveLearnerFirstName(studentId);

    const reportByCapsuleId = new Map(
      reports.map((r) => {
        const populated = r.capsuleId as { _id?: mongoose.Types.ObjectId; id?: string } | mongoose.Types.ObjectId;
        const id =
          populated && typeof populated === 'object' && '_id' in populated && populated._id
            ? String(populated._id)
            : String(r.capsuleId);
        return [id, r] as const;
      }),
    );

    const learnerAnswerDocs = await LearnerAnswer.find({
      studentId: studentObjectId,
      capsuleId: { $in: individualIds },
      isDeleted: false,
    }).lean();

    const answersByCapsuleId = new Map(
      learnerAnswerDocs.map((doc) => [String(doc.capsuleId), doc] as const),
    );

    const formatAnswersExcerpt = (doc: (typeof learnerAnswerDocs)[number] | undefined) => {
      if (!doc) return '';
      const reflection = (doc.reflectionAnswers || [])
        .map((item) => String(item?.answer || '').trim())
        .filter(Boolean);
      const exercises = (doc.exerciseAnswers || [])
        .map((item) => String(item?.answer || '').trim())
        .filter(Boolean);

      const chunks: string[] = [];
      if (reflection.length) {
        chunks.push(`Partie 3 (réflexion): ${reflection.join(' // ')}`);
      }
      if (exercises.length) {
        chunks.push(`Partie 4 (exercices): ${exercises.join(' // ')}`);
      }
      if (!chunks.length) return '';

      const text = chunks.join(' | ');
      // Keep enough of late journey capsules (4–5) for the final synthèse.
      return text.length > 2500 ? `${text.slice(0, 2500)}…` : text;
    };

    // Preserve journey order (capsules 1→5) and pull raw Parts 3–4 answers into the synthèse.
    const capsuleSummaries = journeyCapsules.map((jc, index) => {
      const id = String(jc.individualCapsuleId);
      const reportDoc = reportByCapsuleId.get(id);
      const populatedTitle = (reportDoc?.capsuleId as { title?: string } | undefined)?.title;
      return {
        title: populatedTitle || jc.title || `Capsule ${index + 1}`,
        mainTheme: reportDoc?.report?.mainTheme || '',
        observations: reportDoc?.report?.observations || '',
        learnerAnswersExcerpt: formatAnswersExcerpt(answersByCapsuleId.get(id)),
      };
    });

    const { report, reportHtml, source } = await generateExpeditionSynthesisContent({
      studentName,
      journeyTitle: journey.title,
      capsuleSummaries,
    });

    const saved = await JourneyMariiReport.findOneAndUpdate(
      { studentId: studentObjectId, journeyId: journeyObjectId, isDeleted: false },
      {
        studentId: studentObjectId,
        journeyId: journeyObjectId,
        report,
        reportHtml,
        source,
      },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    if (student?.email) {
      emitEmailJob({
        to: student.email,
        subject: `Synthèse finale Marii — ${journey.title}`,
        html: reportHtml,
      });
    }

    return saved;
  }

  async getExpeditionReport(studentId: string, journeyId: string) {
    return JourneyMariiReport.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      journeyId: new mongoose.Types.ObjectId(journeyId),
      isDeleted: false,
    }).lean();
  }

  async getReportPdf(studentId: string, capsuleId: string): Promise<Buffer> {
    const report = await this.getByCapsuleId(studentId, capsuleId);
    if (!report) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Marii report not found');
    }

    const capsule = await IndividualCapsule.findById(capsuleId).select('title').lean();
    return buildMariiReportPdf(report.report, capsule?.title || 'Capsule');
  }

  async getByCapsuleId(studentId: string, capsuleId: string) {
    await assertStudentCapsuleAccess(studentId, capsuleId);

    const report = await MariiReport.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      capsuleId: new mongoose.Types.ObjectId(capsuleId),
      isDeleted: false,
    }).lean();

    return report;
  }

  async listForStudent(studentId: string) {
    return MariiReport.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      isDeleted: false,
    })
      .populate('capsuleId', 'title thumbnail')
      .sort({ updatedAt: -1 })
      .lean();
  }
}
