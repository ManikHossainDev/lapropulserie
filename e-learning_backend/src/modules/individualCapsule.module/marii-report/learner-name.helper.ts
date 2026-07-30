import mongoose from 'mongoose';
import { StudentAnswer } from '../../question.module/studentAnswer/studentAnswer.model';
import { Question } from '../../question.module/question/question.model';
import { User } from '../../user.module/user/user.model';

/**
 * The free questionnaire asks for the preferred first name with playful wording
 * ("Qui embarque aujourd'hui pour cette mission ?"), so the helper text — which
 * always mentions "prénom" — is the reliable signal.
 */
const FIRST_NAME_HELPER = /pr[eé]nom|first name|preferred name/i;
const FIRST_NAME_TITLE = /what should we call you|qui embarque|comment (?:dois-je|doit-on|peut-on) t/i;
const EMAIL_HINT = /e-?mail|courriel|adresse/i;

const cleanName = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const first = value.trim().split(/\s+/)[0] || '';
  // Reject values that are clearly not a name (emails, numbers, placeholders)
  if (!first || first.length < 2 || first.includes('@') || /^\d+$/.test(first)) return '';
  return first.charAt(0).toUpperCase() + first.slice(1);
};

/**
 * Learner's first name as THEY wrote it in the questionnaire, falling back to the
 * account name. Client feedback #34: never show the account label (e.g. "Demo").
 */
export const resolveLearnerFirstName = async (studentId: string): Promise<string> => {
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  try {
    const nameQuestions = await Question.find({ isDeleted: false })
      .select('_id title helperText')
      .lean();

    const matchingIds = nameQuestions
      .filter((q) => {
        const title = q.title || '';
        const helper = (q as any).helperText || '';
        if (EMAIL_HINT.test(title) || EMAIL_HINT.test(helper)) return false;
        return FIRST_NAME_HELPER.test(helper) || FIRST_NAME_TITLE.test(title);
      })
      .map((q) => q._id);

    if (matchingIds.length) {
      const answers = await StudentAnswer.find({
        studentId: studentObjectId,
        questionId: { $in: matchingIds },
        isDeleted: false,
      })
        .sort({ updatedAt: -1 })
        .lean();

      for (const answer of answers) {
        const fromQuestionnaire = cleanName(answer.answer);
        if (fromQuestionnaire) return fromQuestionnaire;
      }
    }
  } catch {
    // Questionnaire lookup is best-effort — fall through to the account name
  }

  const user = await User.findById(studentObjectId).select('name').lean();
  return cleanName(user?.name) || 'à toi';
};
