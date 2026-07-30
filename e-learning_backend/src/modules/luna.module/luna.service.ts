import { openai, isOpenAiConfigured, OPENAI_MODEL } from '../../config/openai';

const LUNA_SYSTEM_PROMPT = `Tu es Luna, l'assistante bienveillante de La Propulserie.
Tu accompagnes l'apprenant pendant sa capsule d'exploration (Introduction, Inspiration, Réflexion, Exercices, Science, Rapport Marii).

Règles :
- Réponses courtes (2–4 phrases max), en français, chaleureuses et pratiques.
- Aide à comprendre une question, un exercice ou un concept — sans faire le travail à la place de l'apprenant.
- Tu n'es pas thérapeute ni coach certifié ; oriente vers Marii ou un mentor si besoin de synthèse profonde.
- Ne invente pas de contenu absent de la capsule.`;

const LUNA_FALLBACKS: Record<number, string[]> = {
  1: [
    'Bienvenue ! Prends le temps de regarder la vidéo d\'introduction. Qu\'est-ce qui te parle le plus ?',
    'Cette étape pose le cadre du parcours. Note une idée qui t\'inspire avant de continuer.',
  ],
  2: [
    'L\'inspiration ouvre de nouvelles perspectives. Quelle idée du video résonne avec ta situation ?',
    'Observe ce qui te surprend ou te challenge dans cette vidéo.',
  ],
  3: [
    'Il n\'y a pas de mauvaise réponse en réflexion. Écris librement — plus c\'est honnête, plus Marii pourra t\'aider.',
    'Si une question te bloque, reformule-la avec tes propres mots.',
  ],
  4: [
    'Les exercices sont faits pour expérimenter, pas pour être parfaits. Décris ce que tu as fait ou ce que tu pourrais faire.',
    'Une petite action vaut mieux qu\'une grande intention jamais commencée.',
  ],
  5: [
    'Cette section explique le « pourquoi » derrière tes ressentis. Relie ce que tu lis à ton expérience.',
    'Quel concept ici éclaire une situation que tu vis actuellement ?',
  ],
  6: [
    'Marii va synthétiser tes réponses des parties 3 et 4. Assure-toi d\'avoir bien complété ces sections.',
    'Ton rapport personnalisé t\'attend — c\'est le fruit de tout ton parcours.',
  ],
};

function fallbackReply(step: number): string {
  const pool = LUNA_FALLBACKS[step] || LUNA_FALLBACKS[1]!;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export async function chatWithLuna(input: {
  message: string;
  step: number;
  stepLabel: string;
  capsuleTitle: string;
  capsuleContext?: string;
}): Promise<{ reply: string; source: 'ai' | 'fallback' }> {
  if (!input.message.trim()) {
    return { reply: fallbackReply(input.step), source: 'fallback' };
  }

  if (!isOpenAiConfigured() || !openai) {
    return {
      reply:
        `${fallbackReply(input.step)} ` +
        `(Connectez OPENAI_API_KEY pour des réponses personnalisées à votre question.)`,
      source: 'fallback',
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: LUNA_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Capsule: "${input.capsuleTitle}"
Partie actuelle: ${input.step} — ${input.stepLabel}
${input.capsuleContext ? `Contexte: ${input.capsuleContext.slice(0, 800)}` : ''}

Message de l'apprenant: ${input.message}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (reply) return { reply, source: 'ai' };
  } catch (error) {
    console.error('[Luna] OpenAI call failed:', error);
  }

  return { reply: fallbackReply(input.step), source: 'fallback' };
}
