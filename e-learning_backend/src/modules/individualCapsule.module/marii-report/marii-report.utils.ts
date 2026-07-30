import {
  IMariiReportContent,
  IMariiReportResources,
} from './marii-report.interface';
import {
  IPropulserieResourceTheme,
  PROPULSERIE_RESOURCE_LIBRARY,
} from './marii-report.resource-library';

export interface IWeightedTheme {
  theme: IPropulserieResourceTheme;
  /** Normalized share 0–1 (70/20/10 when 3 themes detected) */
  share: number;
  role: 'primary' | 'secondary' | 'complementary';
}

function collectAnswerText(answers: { orderNumber: number; answer: string }[]): string {
  return answers.map((a) => a.answer).join(' ').toLowerCase();
}

/** Score themes by keyword matches in learner answers. */
export function scoreThemes(answerText: string): IPropulserieResourceTheme[] {
  const weighted = scoreThemesWithWeights(answerText);
  return weighted.map((w) => w.theme);
}

/**
 * 70/20/10 prioritization (Marie PDF):
 * - Primary theme → 70% of resource slots
 * - Secondary → 20%
 * - Complementary → 10%
 */
export function scoreThemesWithWeights(answerText: string): IWeightedTheme[] {
  const scored = PROPULSERIE_RESOURCE_LIBRARY.map((theme) => {
    const score = theme.keywords.reduce(
      (sum, keyword) => sum + (answerText.includes(keyword.toLowerCase()) ? 1 : 0),
      0,
    );
    return { theme, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const ranked =
    scored.length > 0
      ? scored.map((s) => s.theme)
      : [PROPULSERIE_RESOURCE_LIBRARY[0]!, PROPULSERIE_RESOURCE_LIBRARY[4]!];

  const roles: IWeightedTheme['role'][] = ['primary', 'secondary', 'complementary'];
  const defaultShares = [0.7, 0.2, 0.1];

  return ranked.slice(0, 3).map((theme, index) => ({
    theme,
    share: defaultShares[index] ?? 0.1,
    role: roles[index] ?? 'complementary',
  }));
}

function pickFromTheme(
  theme: IPropulserieResourceTheme,
  getter: (t: IPropulserieResourceTheme) => string[],
  count: number,
  used: Set<string>,
): string[] {
  const picked: string[] = [];
  for (const item of getter(theme)) {
    if (used.has(item)) continue;
    picked.push(item);
    used.add(item);
    if (picked.length >= count) break;
  }
  return picked;
}

/** Build resource recommendations using 70/20/10 slot allocation. */
export function buildResourcesWeighted(weightedThemes: IWeightedTheme[]): IMariiReportResources {
  const used = new Set<string>();
  const primary = weightedThemes.find((w) => w.role === 'primary') ?? weightedThemes[0];
  const secondary = weightedThemes.find((w) => w.role === 'secondary');
  const complementary = weightedThemes.find((w) => w.role === 'complementary');

  const books: string[] = [];
  const podcasts: string[] = [];
  const exercises: string[] = [];
  const capsules: string[] = [];
  const mentors: string[] = [];

  if (primary) {
    books.push(...pickFromTheme(primary.theme, (t) => t.books, 2, used));
    podcasts.push(...pickFromTheme(primary.theme, (t) => t.podcasts, 1, used));
    exercises.push(...pickFromTheme(primary.theme, (t) => t.exercises, 1, used));
    mentors.push(...pickFromTheme(primary.theme, (t) => t.mentors, 1, used));
    capsules.push(...pickFromTheme(primary.theme, (t) => t.capsules, 1, used));
  }
  if (secondary) {
    books.push(...pickFromTheme(secondary.theme, (t) => t.books, 1, used));
    podcasts.push(...pickFromTheme(secondary.theme, (t) => t.podcasts, 1, used));
    exercises.push(...pickFromTheme(secondary.theme, (t) => t.exercises, 1, used));
    mentors.push(...pickFromTheme(secondary.theme, (t) => t.mentors, 1, used));
  }
  if (complementary) {
    books.push(...pickFromTheme(complementary.theme, (t) => t.books, 1, used));
    capsules.push(...pickFromTheme(complementary.theme, (t) => t.capsules, 1, used));
  }

  return { books, podcasts, exercises, capsules, mentors };
}

const HTML_STYLES = {
  wrapper:
    'font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;max-width:680px;margin:0 auto;line-height:1.7;',
  h1: 'color:#2d2a71;font-size:24px;margin:0 0 16px;',
  section:
    'margin:0 0 28px;padding:20px 22px;background:#f8f8fc;border-radius:14px;border:1px solid #eceaf6;',
  h2: 'color:#2d2a71;font-size:17px;margin:0 0 12px;',
  p: 'margin:0 0 12px;',
  list: 'margin:0;padding-left:22px;',
  li: 'margin:0 0 10px;',
};

function section(title: string, body: string): string {
  return `<div style="${HTML_STYLES.section}"><h2 style="${HTML_STYLES.h2}">${title}</h2>${body}</div>`;
}

function bullets(items: string[], ordered = false): string {
  if (!items.length) return `<p style="${HTML_STYLES.p}">—</p>`;
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} style="${HTML_STYLES.list}">${items
    .map((item) => `<li style="${HTML_STYLES.li}">${item}</li>`)
    .join('')}</${tag}>`;
}

export function buildReportHtml(report: IMariiReportContent, capsuleTitle: string): string {
  const { resources } = report;
  const resourceLines = [
    ['Livres', resources.books],
    ['Podcasts', resources.podcasts],
    ['Exercices', resources.exercises],
    ['Capsules', resources.capsules],
  ]
    .filter(([, items]) => (items as string[]).length)
    .map(
      ([label, items]) =>
        `<p style="${HTML_STYLES.p}"><strong>${label} :</strong> ${(items as string[]).join(' • ')}</p>`,
    )
    .join('');

  // Client #34: only the main theme is shown (no secondary themes)
  return `
    <div style="${HTML_STYLES.wrapper}">
      <h1 style="${HTML_STYLES.h1}">🤖 Rapport de Marii</h1>
      <p style="${HTML_STYLES.p}">${report.greeting}</p>
      <p style="margin:0 0 28px;">Merci d'avoir complété <strong>${capsuleTitle}</strong>.</p>
      ${section('🎯 Thème principal', `<p style="${HTML_STYLES.p}">${report.mainTheme}</p>`)}
      ${section('💡 Ce que j\'observe', `<p style="${HTML_STYLES.p}">${report.observations}</p>`)}
      ${section('🌟 Tes forces', bullets(report.strengths))}
      ${section('⚠️ Points de vigilance', bullets(report.vigilancePoints))}
      ${section('❓ Questions à explorer', bullets(report.reflectionQuestions, true))}
      ${section('🚀 Prochaines étapes', bullets(report.recommendations))}
      ${section('📚 Ressources recommandées', resourceLines || `<p style="${HTML_STYLES.p}">—</p>`)}
      ${report.mentorSuggestion ? section('🤝 Mentorat', `<p style="${HTML_STYLES.p}">${report.mentorSuggestion}</p>`) : ''}
      ${section('✨ Message final', `<p style="${HTML_STYLES.p}">${report.closingMessage}</p>`)}
    </div>
  `;
}

export function buildTemplateReport(
  studentName: string,
  capsuleTitle: string,
  reflectionAnswers: { orderNumber: number; answer: string }[],
  exerciseAnswers: { orderNumber: number; answer: string }[],
): { report: IMariiReportContent; reportHtml: string } {
  const allText = `${collectAnswerText(reflectionAnswers)} ${collectAnswerText(exerciseAnswers)}`;
  const weightedThemes = scoreThemesWithWeights(allText);
  const mainTheme = weightedThemes[0]!.theme;
  const secondaryThemes = weightedThemes.slice(1).map((w) => w.theme.theme);
  const resources = buildResourcesWeighted(weightedThemes);

  const answeredReflection = reflectionAnswers.filter((a) => a.answer.trim());
  const answeredExercises = exerciseAnswers.filter((a) => a.answer.trim());

  const strengths = [
    answeredReflection.length >= 2
      ? 'Tu as pris le temps de réfléchir en profondeur à plusieurs questions clés.'
      : 'Tu as commencé à explorer tes réponses avec honnêteté.',
    answeredExercises.length >= 1
      ? 'Tu as traduit ta réflexion en actions concrètes.'
      : 'Tu montres une volonté d\'avancer étape par étape.',
    'Tu as mené ce parcours jusqu\'au bout — c\'est déjà une ressource importante.',
  ];

  const report: IMariiReportContent = {
    greeting: `Bonjour ${studentName},`,
    mainTheme: mainTheme.theme,
    secondaryThemes,
    observations:
      `En parcourant tes réponses dans « ${capsuleTitle} », Marii observe un fil conducteur autour de « ${mainTheme.theme} ». ` +
      'Tes réflexions montrent une recherche de clarté, d\'alignement et de passages concrets vers l\'action.',
    strengths,
    vigilancePoints: [
      'Une tendance à vouloir tout comprendre avant d\'agir.',
      'Des attentes élevées envers toi-même.',
      'Parfois, la peur de faire le « mauvais » choix peut freiner l\'expérimentation.',
    ],
    reflectionQuestions: [
      'Qu\'est-ce qui compte vraiment pour toi dans la prochaine étape de ton parcours ?',
      'Quelles activités te donnent de l\'énergie, quel que soit le contexte ?',
      'Quelle petite expérience pourrais-tu tester dans les 30 prochains jours ?',
    ],
    recommendations: [
      'Identifie trois activités qui génèrent de l\'énergie et de la motivation.',
      'Planifie une conversation avec une personne dont le parcours t\'inspire.',
      'Choisis une action simple à tester cette semaine, sans viser la perfection.',
    ],
    resources,
    mentorSuggestion:
      `Un mentor spécialisé en ${mainTheme.mentors.join(', ')} pourrait t'aider à approfondir ta réflexion avec un regard extérieur bienveillant.`,
    closingMessage:
      'Tu n\'as pas besoin d\'avoir toutes les réponses aujourd\'hui. Chaque prise de conscience compte. Continue d\'explorer — Marii',
  };

  return { report, reportHtml: buildReportHtml(report, capsuleTitle) };
}

/** Merge AI resources with library — only keep items that exist in official library. */
export function sanitizeResourcesFromLibrary(
  aiResources: Partial<IMariiReportResources> | undefined,
  fallback: IMariiReportResources,
): IMariiReportResources {
  if (!aiResources) return fallback;

  const allBooks = new Set(PROPULSERIE_RESOURCE_LIBRARY.flatMap((t) => t.books));
  const allPodcasts = new Set(PROPULSERIE_RESOURCE_LIBRARY.flatMap((t) => t.podcasts));
  const allExercises = new Set(PROPULSERIE_RESOURCE_LIBRARY.flatMap((t) => t.exercises));
  const allCapsules = new Set(PROPULSERIE_RESOURCE_LIBRARY.flatMap((t) => t.capsules));
  const allMentors = new Set(PROPULSERIE_RESOURCE_LIBRARY.flatMap((t) => t.mentors));

  const filter = (items: string[] | undefined, allowed: Set<string>, fb: string[]) => {
    const valid = (items || []).filter((i) => allowed.has(i));
    return valid.length ? valid : fb;
  };

  return {
    books: filter(aiResources.books, allBooks, fallback.books),
    podcasts: filter(aiResources.podcasts, allPodcasts, fallback.podcasts),
    exercises: filter(aiResources.exercises, allExercises, fallback.exercises),
    capsules: filter(aiResources.capsules, allCapsules, fallback.capsules),
    mentors: filter(aiResources.mentors, allMentors, fallback.mentors),
  };
}

export function parseAiReportJson(raw: string): Partial<IMariiReportContent> {
  let jsonString = raw.trim();
  const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch?.[1]) jsonString = jsonMatch[1];
  return JSON.parse(jsonString) as Partial<IMariiReportContent>;
}
