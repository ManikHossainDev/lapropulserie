/**
 * French Marii system prompt — based on Marie's PDF specification.
 * AI must return structured JSON; resources must come from the official library only.
 */
export const MARII_SYSTEM_PROMPT = `Tu es Marii, l'assistante IA de synthèse de La Propulserie.
Tu interviens à la fin d'un parcours d'exploration ou d'une capsule individuelle.

Ton rôle n'est PAS de résumer mécaniquement les réponses. Tu aides les personnes à :
- prendre du recul ;
- identifier leurs ressources ;
- mieux comprendre leurs mécanismes ;
- faire émerger des prises de conscience ;
- clarifier leurs réflexions ;
- transformer leurs idées en pistes d'action concrètes.

Tu es structurée, bienveillante, encourageante, professionnelle.
Tu ne juges jamais. Tu n'es ni psychologue, ni thérapeute, ni médecin.
Tu ne poses aucun diagnostic. Tu ne fournis jamais de conseil médical, juridique ou financier.
Tu ne fais aucune supposition qui ne repose pas sur les réponses de l'utilisateur.

OBJECTIF :
1. Identifier les thèmes dominants.
2. Faire émerger les prises de conscience.
3. Mettre en lumière les ressources.
4. Identifier les éventuels freins.
5. Prioriser les sujets importants.
6. Fournir des pistes d'action.
7. Recommander des ressources pertinentes (UNIQUEMENT depuis la bibliothèque fournie).
8. Suggérer un mentor lorsque cela est pertinent.

RÈGLE RESSOURCES :
- Ne JAMAIS inventer de livres, podcasts, exercices, capsules ou mentors.
- Utiliser UNIQUEMENT les ressources de la bibliothèque Propulserie fournie dans le message utilisateur.
- Appliquer la priorisation 70% thème principal, 20% secondaire, 10% complémentaire.

STYLE : français simple, chaleureux, professionnel.
TUTOIEMENT OBLIGATOIRE : adresse-toi toujours directement à la personne en la tutoyant (« tu », « ton », « tes »).
N'utilise JAMAIS le vouvoiement (« vous », « votre », « vos »).

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown.`;

export function buildMariiUserPrompt(input: {
  studentName: string;
  capsuleTitle: string;
  reflectionItems: Array<{ question: string; answer: string }>;
  exerciseItems: Array<{ exercise: string; answer: string }>;
  resourceLibraryJson: string;
  expeditionContext?: string;
}): string {
  const reflectionBlock = input.reflectionItems
    .map((item, i) => `Q${i + 1}: ${item.question}\nR: ${item.answer || '(non répondu)'}`)
    .join('\n\n');

  const exerciseBlock = input.exerciseItems
    .map((item, i) => `Ex${i + 1}: ${item.exercise}\nR: ${item.answer || '(non répondu)'}`)
    .join('\n\n');

  return `Capsule : "${input.capsuleTitle}"
Prénom de l'apprenant : ${input.studentName}
${input.expeditionContext ? `\nContexte expédition : ${input.expeditionContext}\n` : ''}

=== PARTIE 3 — RÉFLEXION ===
${reflectionBlock || '(aucune réponse)'}

=== PARTIE 4 — EXERCICES PRATIQUES ===
${exerciseBlock || '(aucune réponse)'}

=== BIBLIOTHÈQUE OFFICIELLE PROPULSERIE (seules ressources autorisées) ===
${input.resourceLibraryJson}

Génère le rapport JSON avec exactement cette structure :
{
  "greeting": "Bonjour [prénom],",
  "mainTheme": "Thématique principale",
  "secondaryThemes": ["thème 2", "thème 3"],
  "observations": "300 mots max — synthèse personnalisée",
  "strengths": ["minimum 3 forces avec explication courte"],
  "vigilancePoints": ["freins bienveillants, formulations douces"],
  "reflectionQuestions": ["3 à 5 questions personnalisées"],
  "recommendations": ["3 à 7 actions concrètes"],
  "resources": {
    "books": ["depuis bibliothèque uniquement"],
    "podcasts": [],
    "exercises": [],
    "capsules": [],
    "mentors": []
  },
  "mentorSuggestion": "contextualisé ou vide si non pertinent",
  "closingMessage": "message positif de clôture signé Marii"
}`;
}

export function buildExpeditionSynthesisPrompt(input: {
  studentName: string;
  journeyTitle: string;
  capsuleSummaries: Array<{
    title: string;
    mainTheme: string;
    observations: string;
    learnerAnswersExcerpt?: string;
  }>;
  resourceLibraryJson: string;
}): string {
  const capsulesBlock = input.capsuleSummaries
    .map((c, i) => {
      const answers =
        c.learnerAnswersExcerpt?.trim() ||
        '(aucune réponse enregistrée pour les parties 3–4)';
      return (
        `Capsule ${i + 1} — ${c.title}\n` +
        `Thème: ${c.mainTheme}\n` +
        `Synthèse: ${c.observations}\n` +
        `Réponses de l'apprenant (parties 3–4): ${answers}`
      );
    })
    .join('\n\n');

  return `SYNTHÈSE FINALE D'EXPÉDITION
Expédition : "${input.journeyTitle}"
Apprenant : ${input.studentName}

L'apprenant a complété toutes les capsules. Voici les rapports individuels
ET les réponses brutes (y compris capsules 4 et 5) — utilise les deux :

${capsulesBlock}

=== BIBLIOTHÈQUE OFFICIELLE ===
${input.resourceLibraryJson}

Produis une synthèse globale JSON (même structure que rapport capsule) qui :
- Identifie le fil conducteur de TOUTE l'expédition
- Intègre les réponses des capsules (surtout les étapes finales)
- Croise les thèmes des capsules
- Propose des recommandations pour la suite du parcours
- Utilise UNIQUEMENT la bibliothèque pour les ressources`;
}
