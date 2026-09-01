'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import url from '@/redux/api/baseUrl';
import {
  useAutoGenerateMariiReportMutation,
  useGenerateMariiReportMutation,
  useGetCapsuleJourneyByIdQuery,
  useGetLearnerAnswersQuery,
  useGetMariiReportQuery,
  useLunaChatMutation,
  useSaveLearnerAnswersMutation,
} from '@/redux/fetures/capsuleJourney/capsuleJourney';
import RecommendationPanel from '@/Components/Students/Recommendations/RecommendationPanel';

const PARTS = [
  { id: 1, label: 'Introduction' },
  { id: 2, label: 'Inspiration' },
  { id: 3, label: 'Réflexion' },
  { id: 4, label: 'Exercices' },
  { id: 5, label: 'Science' },
  { id: 6, label: 'Rapport Marii' },
];

const PART_GUIDANCE = {
  1: {
    subtitle: 'Un message de La Propulserie',
    tip: 'Prenez le temps de regarder la vidéo avant de continuer. Cette étape pose le cadre de votre exploration.',
  },
  2: {
    subtitle: 'Réflexion & inspiration',
    tip: 'Laissez-vous inspirer. Notez ce qui résonne, vous surprend ou ouvre une nouvelle perspective.',
  },
  3: {
    subtitle: 'Il n\'y a pas de mauvaise réponse',
    tip: 'Répondez avec honnêteté — plus vos réponses sont détaillées, plus votre rapport Marii sera précieux.',
  },
  4: {
    subtitle: 'L\'action crée le changement',
    tip: 'Les exercices sont faits pour expérimenter, pas pour être parfaits. Une petite action vaut mieux qu\'une grande intention.',
  },
  5: {
    subtitle: 'Comprendre pour avancer',
    tip: 'Reliez ce que vous lisez à votre expérience. Quel concept éclaire une situation que vous vivez ?',
  },
};

function StepGuidance({ step }) {
  const guide = PART_GUIDANCE[step];
  if (!guide) return null;
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-gray-700 space-y-1 mb-4">
      {guide.subtitle && <p className="font-semibold text-[#2d2a71]">{guide.subtitle}</p>}
      <p>{guide.tip}</p>
      <p className="text-xs text-gray-500 pt-1">🐱 Luna est disponible à chaque étape si vous avez besoin d&apos;aide.</p>
    </div>
  );
}

import CapsuleVideoPlayer from './CapsuleVideoPlayer';
function LunaWidget({ capsuleId, step, capsuleTitle }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'luna',
      text: 'Bonjour ! Je suis Luna. Posez-moi une question sur cette étape du parcours.',
    },
  ]);
  const [lunaChat, { isLoading }] = useLunaChatMutation();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');

    try {
      const res = await lunaChat({ capsuleId, step, message: text }).unwrap();
      setMessages((prev) => [...prev, { role: 'luna', text: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'luna', text: 'Désolée, je ne peux pas répondre pour le moment. Réessayez dans un instant.' },
      ]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#2d2a71] text-white shadow-lg overflow-hidden flex items-center justify-center p-1"
        title="Luna"
      >
        <img
          src="/Images/StudentsDash/explorationJourney_cartoon.png"
          alt="Luna"
          className="w-full h-full object-contain"
        />
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border flex flex-col max-h-[420px]">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/Images/StudentsDash/explorationJourney_cartoon.png"
                alt="Luna"
                className="w-10 h-10 rounded-full object-contain bg-indigo-50"
              />
              <div className="min-w-0">
                <h4 className="font-semibold text-[#2d2a71]">Luna</h4>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{capsuleTitle}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-[#2d2a71] text-white ml-6'
                    : 'bg-gray-100 text-gray-700 mr-6'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && <p className="text-gray-400 text-xs">Luna réfléchit...</p>}
            <div ref={scrollRef} />
          </div>
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-2 bg-[#2d2a71] text-white rounded-lg text-sm disabled:opacity-50"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  );
}

async function downloadMariiPdf(capsuleId) {
  const token = JSON.parse(localStorage.getItem('token'));
  const res = await fetch(`${url}/api/v1/marii-report/${capsuleId}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('PDF download failed');
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `marii-report-${capsuleId}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function CapsuleJourneyExperience({ capsuleId, journeyId = null, initialStep = 1 }) {
  const [step, setStep] = useState(() => {
    const n = Number(initialStep);
    return Number.isFinite(n) && n >= 1 && n <= 6 ? n : 1;
  });
  const { data: capsuleRes, isLoading, isError: capsuleError } =
    useGetCapsuleJourneyByIdQuery(
      { id: capsuleId, journeyId: journeyId || undefined },
      { skip: !capsuleId },
    );
  const { data: answersRes, refetch: refetchAnswers } =
    useGetLearnerAnswersQuery(
      { capsuleId, journeyId: journeyId || undefined },
      { skip: !capsuleId },
    );
  const { data: reportRes, refetch: refetchReport, isFetching: reportLoading } = useGetMariiReportQuery(
    capsuleId,
    { skip: step < 6 },
  );
  const [saveAnswers] = useSaveLearnerAnswersMutation();
  const [generateReport, { isLoading: generating }] = useGenerateMariiReportMutation();
  const [autoGenerate, { isLoading: autoGenerating }] = useAutoGenerateMariiReportMutation();
  const autoTriggered = useRef(false);

  const capsule = capsuleRes?.data;
  const savedAnswers = answersRes?.data;
  const report = reportRes?.data;

  useEffect(() => {
    if (!capsule) return;
    // eslint-disable-next-line no-console
    console.log('[VIDEO DEBUG] capsule loaded', {
      capsuleId,
      step,
      founderVideo: capsule.introduction?.founderVideo,
      inspirationVideo: capsule.inspiration?.inspirationVideo,
      scienceVideo: capsule.science?.optionalVideo,
    });
  }, [capsule, capsuleId, step]);

  const [reflectionDraft, setReflectionDraft] = useState({});
  const [exerciseDraft, setExerciseDraft] = useState({});
  const [pdfLoading, setPdfLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  // Hydrate drafts once per capsule — refetch after blur must not wipe in-progress typing.
  const draftsHydratedForCapsule = useRef(null);

  useEffect(() => {
    draftsHydratedForCapsule.current = null;
    setReflectionDraft({});
    setExerciseDraft({});
  }, [capsuleId]);

  useEffect(() => {
    if (!savedAnswers || !capsuleId) return;
    if (draftsHydratedForCapsule.current === capsuleId) return;
    draftsHydratedForCapsule.current = capsuleId;
    const r = {};
    (savedAnswers.reflectionAnswers || []).forEach((a) => {
      r[a.orderNumber] = a.answer;
    });
    setReflectionDraft(r);
    const e = {};
    (savedAnswers.exerciseAnswers || []).forEach((a) => {
      e[a.orderNumber] = a.answer;
    });
    setExerciseDraft(e);
  }, [savedAnswers, capsuleId]);

  const persistReflection = async (orderNumber, answer) => {
    try {
      await saveAnswers({
        capsuleId,
        journeyId: journeyId || undefined,
        reflectionAnswers: [{ orderNumber, answer }],
      });
      // Do not await refetch into drafts — hydrate-once prevents wipe; background sync is enough.
      refetchAnswers();
    } catch (error) {
      console.error('Failed to save reflection answer:', error);
    }
  };

  const persistExercise = async (orderNumber, answer) => {
    try {
      await saveAnswers({
        capsuleId,
        journeyId: journeyId || undefined,
        exerciseAnswers: [{ orderNumber, answer }],
      });
      refetchAnswers();
    } catch (error) {
      console.error('Failed to save exercise answer:', error);
    }
  };

  /** Flush in-memory drafts so Parts 3–4 / synthèse never miss unblurred answers. */
  const flushDraftAnswers = async () => {
    const reflectionAnswers = Object.entries(reflectionDraft)
      .filter(([, answer]) => answer != null && String(answer).trim().length > 0)
      .map(([orderNumber, answer]) => ({
        orderNumber: Number(orderNumber),
        answer: String(answer),
      }));
    const exerciseAnswers = Object.entries(exerciseDraft)
      .filter(([, answer]) => answer != null && String(answer).trim().length > 0)
      .map(([orderNumber, answer]) => ({
        orderNumber: Number(orderNumber),
        answer: String(answer),
      }));

    if (!reflectionAnswers.length && !exerciseAnswers.length) return;

    await saveAnswers({
      capsuleId,
      journeyId: journeyId || undefined,
      ...(reflectionAnswers.length ? { reflectionAnswers } : {}),
      ...(exerciseAnswers.length ? { exerciseAnswers } : {}),
    });
    await refetchAnswers();
  };

  /** Change step immediately; persist drafts in background so Précédent/Suivant never freeze. */
  const navigateToStep = (nextStep) => {
    const target = Number(nextStep);
    if (!Number.isFinite(target) || target < 1 || target > 6 || target === step) return;
    const leavingAnswerStep = step === 3 || step === 4;
    setStep(target);
    if (leavingAnswerStep) {
      flushDraftAnswers().catch((error) => {
        console.error('Failed to save answers before navigation:', error);
      });
    }
  };

  useEffect(() => {
    if (step !== 6 || report || autoTriggered.current) return;
    autoTriggered.current = true;
    setReportError('');
    (async () => {
      try {
        await flushDraftAnswers();
        await autoGenerate({ capsuleId, journeyId: journeyId || undefined }).unwrap();
        await refetchReport();
      } catch (error) {
        autoTriggered.current = false;
        const msg =
          error?.data?.message ||
          error?.data?.errors?.[0]?.message ||
          '';
        if (msg) setReportError(msg);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, capsuleId, journeyId, report, autoGenerate, refetchReport]);

  const handleGenerateReport = async () => {
    setReportError('');
    try {
      await flushDraftAnswers();
      await generateReport({ capsuleId, journeyId: journeyId || undefined }).unwrap();
      await refetchReport();
    } catch (error) {
      console.error('Marii report error:', error);
      const apiMsg = error?.data?.message || error?.data?.errors?.[0]?.message;
      const status = error?.status || error?.data?.code;
      let message =
        'Impossible de générer le rapport. Complétez les parties 3 et 4, puis réessayez.';
      if (status === 403) {
        message =
          apiMsg ||
          "Accès refusé : cette capsule nécessite un parcours Exploration acheté ou réclamé.";
      } else if (status === 400) {
        message =
          apiMsg ||
          'Complétez d’abord les parties 3 (Réflexion) et 4 (Exercices) avant de générer le rapport.';
      } else if (apiMsg) {
        message = apiMsg;
      }
      setReportError(message);
      alert(message);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      await downloadMariiPdf(capsuleId);
    } finally {
      setPdfLoading(false);
    }
  };

  const goNext = () => {
    if (step < 6) navigateToStep(step + 1);
  };

  const content = useMemo(() => {
    if (!capsule) return null;

    if (step === 1) {
      const intro = capsule.introduction || {};
      return (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2d2a71]">🌟 {intro.title || capsule.title}</h2>
          <StepGuidance step={1} />
          {intro.founderVideo && (
            <CapsuleVideoPlayer video={intro.founderVideo} cacheKey={capsule.updatedAt} />
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{intro.text}</p>
        </section>
      );
    }

    if (step === 2) {
      const insp = capsule.inspiration || {};
      return (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2d2a71]">💡 {insp.title || 'Inspiration'}</h2>
          <StepGuidance step={2} />
          {insp.inspirationVideo && (
            <CapsuleVideoPlayer video={insp.inspirationVideo} cacheKey={capsule.updatedAt} />
          )}
          <p className="text-gray-700 whitespace-pre-wrap">{insp.text}</p>
        </section>
      );
    }

    if (step === 3) {
      const refl = capsule.reflection || { questions: [] };
      return (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#2d2a71]">📝 {refl.title || 'Auto-réflexion'}</h2>
          <StepGuidance step={3} />
          {refl.instructions && <p className="text-gray-600">{refl.instructions}</p>}
          {(refl.questions || []).map((q) => (
            <div key={q.orderNumber} className="space-y-2">
              <p className="font-medium text-gray-800">Question {q.orderNumber}</p>
              <p className="text-sm text-gray-600">{q.question}</p>
              <textarea
                rows={4}
                className="w-full border rounded-xl p-3 text-sm"
                placeholder="Écrivez votre réponse ici..."
                value={reflectionDraft[q.orderNumber] || ''}
                onChange={(e) =>
                  setReflectionDraft((prev) => ({ ...prev, [q.orderNumber]: e.target.value }))
                }
                onBlur={(e) => persistReflection(q.orderNumber, e.target.value)}
              />
            </div>
          ))}
        </section>
      );
    }

    if (step === 4) {
      const pract = capsule.practicalExercises || { exercises: [] };
      return (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#2d2a71]">🚀 {pract.title || "Passer à l'action"}</h2>
          <StepGuidance step={4} />
          {(pract.exercises || []).map((ex) => (
            <div key={ex.orderNumber} className="space-y-2">
              <p className="font-medium text-gray-800">Exercice {ex.orderNumber}</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{ex.exercise}</p>
              <textarea
                rows={4}
                className="w-full border rounded-xl p-3 text-sm"
                placeholder="Décrivez ce que vous avez découvert..."
                value={exerciseDraft[ex.orderNumber] || ''}
                onChange={(e) =>
                  setExerciseDraft((prev) => ({ ...prev, [ex.orderNumber]: e.target.value }))
                }
                onBlur={(e) => persistExercise(ex.orderNumber, e.target.value)}
              />
            </div>
          ))}
        </section>
      );
    }

    if (step === 5) {
      const sci = capsule.science || {};
      return (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#2d2a71]">🧠 {sci.title || 'Science & compréhension'}</h2>
          <StepGuidance step={5} />
          <p className="text-gray-700 whitespace-pre-wrap">{sci.text}</p>
          {sci.optionalVideo && (
            <CapsuleVideoPlayer video={sci.optionalVideo} cacheKey={capsule.updatedAt} />
          )}
        </section>
      );
    }

    const isGenerating = generating || autoGenerating || (reportLoading && !report);

    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[#2d2a71]">🤖 Rapport de Marii</h2>
        {isGenerating && !report && (
          <p className="text-gray-600">Marii analyse tes réponses et prépare ton rapport personnalisé...</p>
        )}
        {!report && !isGenerating && (
          <div className="space-y-3">
            <p className="text-gray-600">
              Termine les parties 3 et 4, puis génère ton rapport.
            </p>
            {reportError && (
              <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-xl p-3">
                {reportError}
              </p>
            )}
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={generating}
              className="px-6 py-3 bg-[#2d2a71] text-white rounded-xl disabled:opacity-60"
            >
              Générer mon rapport
            </button>
          </div>
        )}
        {report && (
          <>
            {report.source === 'ai' && (
              <span className="inline-block text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                Généré par Marii AI
              </span>
            )}
            <div
              className="prose max-w-none border rounded-xl p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: report.reportHtml }}
            />
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="px-4 py-2 border border-[#2d2a71] text-[#2d2a71] rounded-lg text-sm"
            >
              {pdfLoading ? 'Téléchargement...' : 'Télécharger en PDF'}
            </button>
            <RecommendationPanel
              context="capsule_complete"
              capsuleId={capsuleId}
              journeyId={journeyId || undefined}
            />
          </>
        )}
      </section>
    );
  }, [
    step,
    capsule,
    reflectionDraft,
    exerciseDraft,
    report,
    generating,
    autoGenerating,
    reportLoading,
    pdfLoading,
  ]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement du parcours...</div>;
  }

  if (capsuleError || !capsule) {
    return (
      <div className="p-8 text-center text-red-500 space-y-3">
        <p>
          Capsule introuvable, inaccessible, ou verrouillée (achat / expédition
          requis).
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/students/discover"
            className="inline-block text-[#2d2a71] underline"
          >
            Retour à Discover
          </Link>
          {journeyId && (
            <Link
              href={`/students/exploration-journey/${journeyId}`}
              className="inline-block text-[#2d2a71] underline"
            >
              Retour à l&apos;expédition
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white/95 rounded-2xl shadow-lg border p-6 md:p-8">
        {journeyId && (
          <Link
            href={`/students/exploration-journey/${journeyId}`}
            className="inline-flex items-center text-sm text-[#2d2a71] mb-4 hover:underline"
          >
            ← Retour à l&apos;expédition
          </Link>
        )}
        <div className="flex flex-wrap gap-2 mb-6">
          {PARTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => navigateToStep(p.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                step === p.id ? 'bg-[#2d2a71] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {p.id}. {p.label}
            </button>
          ))}
        </div>

        {content}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            disabled={step <= 1}
            onClick={() => navigateToStep(step - 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            Précédent
          </button>
          {step < 6 ? (
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2 rounded-lg bg-[#2d2a71] text-white"
            >
              Suivant
            </button>
          ) : journeyId ? (
            <Link
              href={`/students/exploration-journey/${journeyId}`}
              className="px-6 py-2 rounded-lg bg-[#2d2a71] text-white"
            >
              Retour à l&apos;expédition
            </Link>
          ) : (
            <Link
              href="/students/marii-reports"
              className="px-6 py-2 rounded-lg bg-[#2d2a71] text-white"
            >
              Mes rapports
            </Link>
          )}
        </div>
      </div>
      <LunaWidget capsuleId={capsuleId} step={step} capsuleTitle={capsule.title} />
    </div>
  );
}
