import { openai, isOpenAiConfigured, OPENAI_MODEL } from '../../../config/openai';
import { IMariiReportContent } from './marii-report.interface';
import {
  MARII_SYSTEM_PROMPT,
  buildMariiUserPrompt,
  buildExpeditionSynthesisPrompt,
} from './marii-report.prompt';
import { PROPULSERIE_RESOURCE_LIBRARY } from './marii-report.resource-library';
import {
  buildReportHtml,
  buildResourcesWeighted,
  buildTemplateReport,
  parseAiReportJson,
  sanitizeResourcesFromLibrary,
  scoreThemesWithWeights,
} from './marii-report.utils';

export type MariiGenerationResult = {
  report: IMariiReportContent;
  reportHtml: string;
  source: 'template' | 'ai';
};

function libraryJson(): string {
  return JSON.stringify(
    PROPULSERIE_RESOURCE_LIBRARY.map((t) => ({
      theme: t.theme,
      books: t.books,
      podcasts: t.podcasts,
      exercises: t.exercises,
      capsules: t.capsules,
      mentors: t.mentors,
    })),
  );
}

function mergeAiIntoReport(
  partial: Partial<IMariiReportContent>,
  fallback: IMariiReportContent,
): IMariiReportContent {
  return {
    greeting: partial.greeting || fallback.greeting,
    mainTheme: partial.mainTheme || fallback.mainTheme,
    secondaryThemes: partial.secondaryThemes?.length
      ? partial.secondaryThemes
      : fallback.secondaryThemes,
    observations: partial.observations || fallback.observations,
    strengths: partial.strengths?.length ? partial.strengths : fallback.strengths,
    vigilancePoints: partial.vigilancePoints?.length
      ? partial.vigilancePoints
      : fallback.vigilancePoints,
    reflectionQuestions: partial.reflectionQuestions?.length
      ? partial.reflectionQuestions
      : fallback.reflectionQuestions,
    recommendations: partial.recommendations?.length
      ? partial.recommendations
      : fallback.recommendations,
    resources: sanitizeResourcesFromLibrary(partial.resources, fallback.resources),
    mentorSuggestion: partial.mentorSuggestion ?? fallback.mentorSuggestion,
    closingMessage: partial.closingMessage || fallback.closingMessage,
  };
}

async function callMariiAi(
  userPrompt: string,
): Promise<Partial<IMariiReportContent> | null> {
  if (!isOpenAiConfigured() || !openai) return null;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: MARII_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;
    return parseAiReportJson(content);
  } catch (error) {
    console.error('[Marii AI] OpenAI call failed, falling back to template:', error);
    return null;
  }
}

/** Match Q/A by orderNumber with Number() coerce (avoids string/number drift). */
function findAnswerByOrder(
  answers: { orderNumber: number; answer: string }[],
  orderNumber: number,
): string {
  const target = Number(orderNumber);
  const hit = answers.find((a) => Number(a.orderNumber) === target);
  return hit?.answer || '';
}

export async function generateMariiReportContent(input: {
  studentName: string;
  capsuleTitle: string;
  reflectionAnswers: { orderNumber: number; answer: string }[];
  exerciseAnswers: { orderNumber: number; answer: string }[];
  reflectionQuestions: { orderNumber: number; question: string }[];
  exercises: { orderNumber: number; exercise: string }[];
  expeditionContext?: string;
}): Promise<MariiGenerationResult> {
  const { report: templateReport, reportHtml: templateHtml } = buildTemplateReport(
    input.studentName,
    input.capsuleTitle,
    input.reflectionAnswers,
    input.exerciseAnswers,
  );

  const reflectionItems = input.reflectionQuestions.map((q) => ({
    question: q.question,
    answer: findAnswerByOrder(input.reflectionAnswers, q.orderNumber),
  }));

  const exerciseItems = input.exercises.map((ex) => ({
    exercise: ex.exercise,
    answer: findAnswerByOrder(input.exerciseAnswers, ex.orderNumber),
  }));

  const aiPartial = await callMariiAi(
    buildMariiUserPrompt({
      studentName: input.studentName,
      capsuleTitle: input.capsuleTitle,
      reflectionItems,
      exerciseItems,
      resourceLibraryJson: libraryJson(),
      expeditionContext: input.expeditionContext,
    }),
  );

  if (!aiPartial) {
    return { report: templateReport, reportHtml: templateHtml, source: 'template' };
  }

  const report = mergeAiIntoReport(aiPartial, templateReport);
  return {
    report,
    reportHtml: buildReportHtml(report, input.capsuleTitle),
    source: 'ai',
  };
}

export async function generateExpeditionSynthesisContent(input: {
  studentName: string;
  journeyTitle: string;
  capsuleSummaries: Array<{
    title: string;
    mainTheme: string;
    observations: string;
    learnerAnswersExcerpt?: string;
  }>;
}): Promise<MariiGenerationResult> {
  const allText = input.capsuleSummaries
    .map((c) => `${c.mainTheme} ${c.observations} ${c.learnerAnswersExcerpt || ''}`)
    .join(' ');
  const weighted = scoreThemesWithWeights(allText.toLowerCase());
  const resources = buildResourcesWeighted(weighted);

  const templateReport: IMariiReportContent = {
    greeting: `Bonjour ${input.studentName},`,
    mainTheme: weighted[0]?.theme.theme || 'Parcours d\'exploration',
    secondaryThemes: weighted.slice(1).map((w) => w.theme.theme),
    observations:
      `Tu as complété l'expédition « ${input.journeyTitle} » en parcourant ${input.capsuleSummaries.length} capsules. ` +
      'Les thèmes récurrents montrent une progression cohérente dans ta réflexion personnelle et professionnelle.',
    strengths: [
      'Persévérance à travers plusieurs étapes d\'exploration.',
      'Capacité à approfondir ta réflexion capsule après capsule.',
      'Engagement dans un parcours structuré jusqu\'au bout.',
    ],
    vigilancePoints: [
      'La clarté peut prendre du temps à émerger après un parcours aussi riche.',
      'Évite de vouloir intégrer toutes les insights d\'un coup.',
    ],
    reflectionQuestions: [
      'Quel est le fil rouge entre toutes tes réponses ?',
      'Quelle capsule t\'a le plus marqué(e) et pourquoi ?',
      'Quelle est la prochaine étape concrète que tu choisis ?',
    ],
    recommendations: [
      'Relis tes rapports individuels et note 3 insights communs.',
      'Choisis une action prioritaire pour les 30 prochains jours.',
      'Envisage un échange avec un mentor aligné sur ton thème principal.',
    ],
    resources,
    mentorSuggestion: `Un mentor en ${weighted[0]?.theme.mentors[0] || 'développement personnel'} pourrait t'aider à consolider cette expédition.`,
    closingMessage:
      'Cette expédition est une étape — pas une destination finale. Continue d\'explorer avec bienveillance. — Marii',
  };

  const templateHtml = buildReportHtml(templateReport, input.journeyTitle);

  const aiPartial = await callMariiAi(
    buildExpeditionSynthesisPrompt({
      studentName: input.studentName,
      journeyTitle: input.journeyTitle,
      capsuleSummaries: input.capsuleSummaries,
      resourceLibraryJson: libraryJson(),
    }),
  );

  if (!aiPartial) {
    return { report: templateReport, reportHtml: templateHtml, source: 'template' };
  }

  const report = mergeAiIntoReport(aiPartial, templateReport);
  return {
    report,
    reportHtml: buildReportHtml(report, input.journeyTitle),
    source: 'ai',
  };
}

export { isOpenAiConfigured };
