export const getQuestionKey = (question, index) =>
    question?.id ?? question?._id ?? `question-${index}`;

/** Backend expects option `sl` for select answers; resume may store sl or label text. */
export const normalizeSingleSelectAnswer = (question, savedAnswer) => {
    if (savedAnswer === '' || savedAnswer == null) return '';

    // Legacy: question was Multiple Select → answer may be an array; keep first pick.
    const value = Array.isArray(savedAnswer) ? savedAnswer[0] : savedAnswer;
    if (value === '' || value == null) return '';

    const options = question?.options || [];
    const bySl = options.find(
        (opt) => opt.sl === value || opt.sl === Number(value)
    );
    if (bySl) return bySl.sl;

    const byDetails = options.find((opt) => opt.details === value);
    return byDetails?.sl ?? value;
};

const EN_VALUE_ALIASES = {
    autonomy: 'autonomie',
    creativity: 'créativité',
    creativite: 'créativité',
    kindness: 'bienveillance',
    benevolence: 'bienveillance',
    ambition: 'ambition',
    balance: 'équilibre',
    equilibre: 'équilibre',
    collaboration: 'collaboration',
    rigor: 'rigueur',
    rigour: 'rigueur',
    impact: 'impact',
    curiosity: 'curiosité',
    curiosite: 'curiosité',
    recognition: 'reconnaissance',
    stability: 'stabilité',
    stabilite: 'stabilité',
    freedom: 'liberté',
    liberte: 'liberté',
    transmission: 'transmission',
    resilience: 'résilience',
    resiliency: 'résilience',
};

const optionMatchesLabel = (opt, label) => {
    if (label == null || label === '') return false;
    const raw = String(label).trim().toLowerCase();
    if (!raw) return false;
    const normalized = EN_VALUE_ALIASES[raw] || raw;

    const details = String(opt?.details || '').toLowerCase();
    if (details === raw || details === normalized) return true;

    // Saved answers sometimes store English short labels ("Autonomy") while
    // options are French emoji lines ("🎭 Autonomie – …").
    const afterEmoji = details.replace(
        /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u,
        ''
    );
    const head = afterEmoji.split(/[–—\-:|]/)[0]?.trim() || '';
    if (
        head &&
        (head === raw ||
            head === normalized ||
            head.startsWith(raw) ||
            head.startsWith(normalized) ||
            raw.startsWith(head) ||
            normalized.startsWith(head))
    ) {
        return true;
    }

    return details.includes(raw) || details.includes(normalized);
};

export const normalizeMultiSelectAnswer = (question, savedAnswer) => {
    if (!Array.isArray(savedAnswer)) return [];

    const options = question?.options || [];
    const resolved = [];

    for (const entry of savedAnswer) {
        if (entry === '' || entry == null) continue;

        const bySl = options.find(
            (opt) => opt.sl === entry || opt.sl === Number(entry)
        );
        if (bySl) {
            if (!resolved.some((sl) => sl === bySl.sl)) resolved.push(bySl.sl);
            continue;
        }

        const byLabel = options.find((opt) => optionMatchesLabel(opt, entry));
        if (byLabel && !resolved.some((sl) => sl === byLabel.sl)) {
            resolved.push(byLabel.sl);
        }
        // Drop unknown orphans — they inflate length and block further picks.
    }

    return resolved;
};

/**
 * Max selections for Multiple Select — trust DB type; parse N from helper/title.
 * Do NOT force 4 when optionCount ≥ 4 (that broke Phase 4/6/7 max-2 questions).
 */
export const getMaxSelection = (question) => {
    if (question?.type !== 'Multiple Select') return 1;

    const text = `${question?.helperText || ''} ${question?.title || ''}`;
    const optionCount = Array.isArray(question?.options) ? question.options.length : 0;

    const match =
        text.match(/(?:up to|jusqu['']à)\s*(\d+)/i) ||
        text.match(/select\s+up\s+to\s*(\d+)/i) ||
        text.match(/\((\d+)\s*choix/i) ||
        text.match(/(\d+)\s*(?:choix|réponses?|reponses?)\s*(?:max\.?|maximum)?/i) ||
        text.match(/(\d+)\s*réponses?\s*maximum/i) ||
        text.match(/(?:max\.?|maximum)\s*[:(]?\s*(\d+)/i);

    if (match?.[1]) {
        const n = Number.parseInt(match[1], 10);
        if (!Number.isNaN(n) && n > 0) {
            return optionCount > 0 ? Math.min(n, optionCount) : n;
        }
    }

    // Multi with no explicit N in copy — cap at option count (or 1).
    return Math.max(1, optionCount || 1);
};

/** Trust DB `type`. Only remap empty-option selects → text (CMS mis-type). */
export const resolveQuestionUiType = (question) => {
    const type = question?.type;
    const optionCount = Array.isArray(question?.options) ? question.options.length : 0;

    if (
        (type === 'Single Select' || type === 'Multiple Select') &&
        optionCount === 0
    ) {
        return 'Text Input';
    }

    return type || 'Text Input';
};

export const isOptionSelected = (value, optionSl) =>
    value === optionSl || value === Number(optionSl);

export const isMultiOptionSelected = (selectedList, optionSl) =>
    (selectedList || []).some(
        (entry) => entry === optionSl || entry === Number(optionSl)
    );

export const buildInitialAnswers = (questions, resumeAnswers) => {
    const initial = {};

    questions.forEach((question, index) => {
        const questionKey = getQuestionKey(question, index);
        const saved = resumeAnswers?.find(
            (answer) =>
                answer.questionId === question.id ||
                answer.questionId === question._id ||
                answer.questionId === questionKey
        );

        const uiType = resolveQuestionUiType(question);

        if (uiType === 'Multiple Select') {
            initial[questionKey] = normalizeMultiSelectAnswer(
                question,
                saved?.answer || []
            );
        } else if (uiType === 'Single Select') {
            initial[questionKey] = normalizeSingleSelectAnswer(
                question,
                saved?.answer
            );
        } else {
            initial[questionKey] = saved?.answer || '';
        }
    });

    return initial;
};

export const formatAnswersForApi = (questions, answers) =>
    questions.map((question, index) => {
        const questionKey = getQuestionKey(question, index);
        return {
            questionId: question.id ?? question._id ?? questionKey,
            answer: answers[questionKey],
        };
    });

export const allAnswersFilled = (answers) =>
    Object.values(answers).every((value) =>
        Array.isArray(value)
            ? value.length > 0
            : value !== '' && value !== null && value !== undefined
    );
