import { TQuestionType } from '../../question.module/question.constant';

interface QuestionDoc {
  _id: { toString(): string };
  title: string;
  type: TQuestionType;
  options?: Array<{ sl: number; details: string }>;
}

interface AnswerDoc {
  questionId: { toString(): string } | string;
  answer: unknown;
}

interface QuestionaryDoc {
  _id: { toString(): string };
  title: string;
  brief?: string;
}

export interface QuestionnaireSummarySection {
  title: string;
  brief: string;
  items: string[];
}

export interface BuiltQuestionnaireSummary {
  title: string;
  texts: string[];
  summary: string;
  sections: QuestionnaireSummarySection[];
}

export const formatAnswerValue = (answer: unknown, question: QuestionDoc): string => {
  if (answer === null || answer === undefined || answer === '') return '';

  if (question.type === TQuestionType.single) {
    const sl = typeof answer === 'number' ? answer : Number(answer);
    const opt = question.options?.find(o => o.sl === sl);
    return opt?.details || String(answer);
  }

  if (question.type === TQuestionType.multi) {
    const values = Array.isArray(answer) ? answer : [answer];
    return values
      .map(sl => {
        const num = typeof sl === 'number' ? sl : Number(sl);
        const opt = question.options?.find(o => o.sl === num);
        return opt?.details || String(sl);
      })
      .filter(Boolean)
      .join(', ');
  }

  return String(answer).trim();
};

export const buildTemplateQuestionnaireSummary = (input: {
  questionaries: QuestionaryDoc[];
  questionsByQuestionary: Map<string, QuestionDoc[]>;
  answersByQuestionary: Map<string, AnswerDoc[]>;
}): BuiltQuestionnaireSummary => {
  const sections: QuestionnaireSummarySection[] = [];

  for (const questionary of input.questionaries) {
    const qId = questionary._id.toString();
    const questions = input.questionsByQuestionary.get(qId) || [];
    const answers = input.answersByQuestionary.get(qId) || [];

    if (answers.length === 0) continue;

    const answerMap = new Map(
      answers.map(a => [
        typeof a.questionId === 'string'
          ? a.questionId
          : a.questionId.toString(),
        a,
      ]),
    );

    const items: string[] = [];
    for (const question of questions) {
      const saved = answerMap.get(question._id.toString());
      if (!saved) continue;
      const formatted = formatAnswerValue(saved.answer, question);
      if (!formatted) continue;
      items.push(`${question.title} — ${formatted}`);
    }

    if (items.length > 0) {
      sections.push({
        title: questionary.title,
        brief: questionary.brief || '',
        items,
      });
    }
  }

  const identification = sections.find(s =>
    /identification/i.test(s.title),
  );
  const nameItem = identification?.items.find(i =>
    /call you|prénom|comment|name|appelle/i.test(i),
  );
  const studentName = nameItem?.split('—')[1]?.trim();

  const title = studentName
    ? `Profil de ${studentName}`
    : 'Ton profil d\'apprentissage';

  const highlightItems = sections
    .flatMap(section => section.items)
    .filter(Boolean)
    .slice(0, 6);

  const texts = sections
    .slice(0, 4)
    .map(section => section.items[0] || section.brief || section.title);

  while (texts.length < 4) {
    texts.push('');
  }

  const themeLabels = sections.map(s => s.title).filter(Boolean);
  const answerSnippets = highlightItems
    .map(item => {
      const parts = item.split('—');
      return (parts[1] || parts[0] || '').trim();
    })
    .filter(Boolean)
    .slice(0, 4);

  let summary =
    'Complète le questionnaire pour obtenir ta synthèse personnalisée.';

  if (sections.length > 0) {
    const who = studentName ? `${studentName}, ` : '';
    const themes =
      themeLabels.length > 0
        ? themeLabels.join(', ')
        : 'ton parcours';
    const fromAnswers =
      answerSnippets.length > 0
        ? ` D’après tes réponses, on retient notamment : ${answerSnippets.join(' · ')}.`
        : '';
    summary =
      `${who}ta synthèse s’appuie sur tes réponses aux étapes « ${themes} ».` +
      fromAnswers +
      ` Ces éléments guideront tes recommandations de capsules, mentors et explorations.`;
  }

  return { title, texts: texts.slice(0, 4), summary, sections };
};
