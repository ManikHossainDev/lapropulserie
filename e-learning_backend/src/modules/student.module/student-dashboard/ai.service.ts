import { openai, isOpenAiConfigured, OPENAI_MODEL } from '../../../config/openai';
import {
  BuiltQuestionnaireSummary,
  QuestionnaireSummarySection,
} from './questionnaire-summary.utils';
import {
  MARII_QUESTIONNAIRE_SECTION_TITLES,
  MARII_QUESTIONNAIRE_SYSTEM_PROMPT,
  buildMariiQuestionnaireUserPrompt,
} from './marii-questionnaire.prompt';

interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface GeneratedQuestionnaireSummary {
  title: string;
  texts: string[];
  summary: string;
  sections: QuestionnaireSummarySection[];
  source: 'ai' | 'template';
}

const asStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0)
    : [];

/**
 * Keep the 8 mandatory Marii sections, in the prescribed order, dropping any
 * section the model returned empty.
 */
const normalizeSections = (raw: unknown): QuestionnaireSummarySection[] => {
  if (!Array.isArray(raw)) return [];

  const byTitle = new Map<string, QuestionnaireSummarySection>();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const title = typeof (entry as any).title === 'string' ? (entry as any).title.trim() : '';
    const brief = typeof (entry as any).brief === 'string' ? (entry as any).brief.trim() : '';
    const items = asStringList((entry as any).items);
    if (!title || (!brief && !items.length)) continue;
    byTitle.set(title.replace(/^[^\p{L}]+/u, '').toLowerCase(), { title, brief, items });
  }

  const ordered: QuestionnaireSummarySection[] = [];
  for (const expected of MARII_QUESTIONNAIRE_SECTION_TITLES) {
    const key = expected.replace(/^[^\p{L}]+/u, '').toLowerCase();
    const found = byTitle.get(key);
    if (found) {
      ordered.push({ ...found, title: expected });
      byTitle.delete(key);
    }
  }
  // Anything unexpected but non-empty still gets shown after the known sections
  ordered.push(...byTitle.values());

  return ordered;
};

export const AIService = {
  async generateSummary(
    questionaryTitle: string,
    questionsAndAnswers: QuestionAnswer[],
    templateFallback?: BuiltQuestionnaireSummary,
    learnerFirstName?: string,
  ): Promise<GeneratedQuestionnaireSummary> {
    if (!isOpenAiConfigured() || !openai) {
      if (templateFallback) {
        return { ...templateFallback, source: 'template' };
      }
      throw new Error('OpenAI is not configured');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: MARII_QUESTIONNAIRE_SYSTEM_PROMPT },
          {
            role: 'user',
            content: buildMariiQuestionnaireUserPrompt({
              questionaryTitle,
              learnerFirstName,
              questionsAndAnswers,
            }),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Failed to generate summary from AI');
      }

      let jsonString = content.trim();
      const jsonMatch = jsonString.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      }

      const result = JSON.parse(jsonString);
      const sections = normalizeSections(result.sections);

      if (!sections.length) {
        throw new Error('AI returned no usable Marii sections');
      }

      // `texts` stays populated for older clients that only render the key points
      const texts = asStringList(result.texts).length
        ? asStringList(result.texts).slice(0, 4)
        : sections.slice(0, 4).map((section) => section.brief || section.items[0] || section.title);

      return {
        title: result.title || questionaryTitle,
        texts,
        summary: typeof result.summary === 'string' ? result.summary.trim() : '',
        sections,
        source: 'ai',
      };
    } catch (error) {
      console.error('[Questionnaire AI] OpenAI failed, using template:', error);
      if (templateFallback) {
        return { ...templateFallback, source: 'template' };
      }
      throw error;
    }
  },

  async recommendMentors(
    studentAnswers: QuestionAnswer[],
    summary: { title: string; texts: string[]; summary: string },
  ): Promise<string[]> {
    if (!isOpenAiConfigured() || !openai) {
      const keywords = studentAnswers
        .flatMap(qa =>
          qa.answer
            .split(/[,;]/)
            .map(part => part.trim())
            .filter(part => part.length > 2),
        )
        .slice(0, 12);
      return keywords;
    }

    const answersText = studentAnswers
      .map(qa => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join('\n\n');

    const prompt = `Based on the student's questionnaire answers and profile summary, recommend the most suitable mentor characteristics for this student.

Student Profile:
- Title: ${summary.title}
- Key Points: ${summary.texts.join(', ')}
- Summary: ${summary.summary}

Answers:
${answersText}

Based on the student's learning goals, interests, and background, recommend:
1. Preferred teaching methodologies (e.g., hands-on, theory-based, project-based, etc.)
2. Preferred core values in a mentor (e.g., patience, expertise, empathy, etc.)
3. Preferred specialties/areas of expertise for the mentor
4. Any other relevant preferences

Respond in JSON format:
{
  "preferredMethodologies": ["...", "..."],
  "preferredCoreValues": ["...", "..."],
  "preferredSpecialties": ["...", "..."],
  "otherPreferences": "..."
}`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at matching students with suitable mentors based on their learning needs and preferences.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    // Handle potential markdown code blocks
    let jsonString = content.trim();
    const jsonMatch = jsonString.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }

    const result = JSON.parse(jsonString);

    return [
      ...(result.preferredMethodologies || []),
      ...(result.preferredCoreValues || []),
      ...(result.preferredSpecialties || []),
    ];
  },
};
