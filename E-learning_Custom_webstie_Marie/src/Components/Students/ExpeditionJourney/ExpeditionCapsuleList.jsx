'use client';

import Link from 'next/link';
import RecommendationPanel from '@/Components/Students/Recommendations/RecommendationPanel';
import DownloadCertificate from '@/Components/others/DownloadCertificate';
import {
  useGenerateExpeditionMariiReportMutation,
  useGetExpeditionMariiReportQuery,
} from '@/redux/fetures/capsuleJourney/capsuleJourney';

function resolveCapsuleHref(capsule, journeyId) {
  const journeyCapsuleId = capsule.id || capsule._id;
  const individualCapsuleId = capsule.individualCapsuleId;

  if (individualCapsuleId) {
    const params = new URLSearchParams({ journeyId });
    return `/students/individual-capsule/${individualCapsuleId}?${params.toString()}`;
  }

  return `/students/exploration-journey/after-purchas-capsul?capsuleId=${journeyCapsuleId}&journeyId=${journeyId}`;
}

export default function ExpeditionCapsuleList({
  journeyId,
  journey,
  capsules = [],
  isPurchased = false,
  showPurchaseCta = false,
  onPurchase,
  purchasePrice,
  isPurchasing = false,
}) {
  const allCompleted =
    capsules.length > 0 && capsules.every((c) => c.isCompleted && c.hasSixPartContent);
  const { data: expeditionReportRes, refetch: refetchExpeditionReport } =
    useGetExpeditionMariiReportQuery(journeyId, {
      skip: !journeyId || !allCompleted || !isPurchased,
    });
  const [generateExpedition, { isLoading: generatingExpedition }] =
    useGenerateExpeditionMariiReportMutation();

  const expeditionReport = expeditionReportRes?.data;

  const handleExpeditionSynthesis = async () => {
    await generateExpedition({ journeyId }).unwrap();
    refetchExpeditionReport();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-5xl bg-white/95 rounded-2xl shadow-lg border p-6 md:p-8 space-y-8">
        <div className="space-y-3">
          {journey?.thumbnail && (
            <img
              src={journey.thumbnail}
              alt=""
              className="w-full h-48 object-cover rounded-2xl"
            />
          )}
          <h1 className="text-3xl font-bold text-[#2d2a71]">
            {journey?.title || 'Exploration Journey'}
          </h1>
          {journey?.description && (
            <p className="text-gray-600">{journey.description}</p>
          )}
          {journey?.roadMapBrief && (
            <p className="text-sm text-[#2d2a71] font-medium">{journey.roadMapBrief}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-500 max-w-xl">
            {isPurchased
              ? 'Progressez capsule par capsule. Terminez chaque parcours pour débloquer la suivante.'
              : "Découvre le Parcours Exploration. Débloque l'expédition pour accéder aux 5 capsules."}
          </p>
          {showPurchaseCta && !isPurchased && (
            <button
              type="button"
              onClick={onPurchase}
              disabled={isPurchasing}
              className="bg-[#2d2a71] text-white text-sm px-5 py-3 rounded-xl disabled:opacity-60"
            >
              {isPurchasing
                ? 'Chargement...'
                : `Débloquer l'expédition${purchasePrice != null ? ` — ${purchasePrice}€` : ''}`}
            </button>
          )}
          {isPurchased && !allCompleted && (
            <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              ✓ Expédition débloquée
            </span>
          )}
          {isPurchased && allCompleted && (
            <span className="text-sm font-semibold text-green-800 bg-green-100 px-3 py-1.5 rounded-full">
              ✓ Parcours terminé
            </span>
          )}
        </div>

        {!isPurchased && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Les capsules sont verrouillées tant que l&apos;expédition n&apos;est pas débloquée.
            {showPurchaseCta
              ? " Utilise le bouton « Débloquer l'expédition » pour continuer."
              : ''}
          </div>
        )}

        {isPurchased && allCompleted && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#2d2a71]">
              Félicitations, tu as terminé le Parcours Exploration !
            </h2>
            <p className="text-gray-700">
              Bravo pour le chemin parcouru. Tu as pris le temps d&apos;explorer ce qui
              t&apos;anime, ce qui te freine et ce que tu souhaites construire pour la suite.
            </p>
            <p className="text-gray-700">
              Ton certificat de réussite est maintenant disponible.
            </p>
            <DownloadCertificate
              programTitle="Parcours Exploration"
              fileName="certificat-parcours-exploration.pdf"
              buttonClassName="bg-[#2d2a71] hover:opacity-90 text-white px-5 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2"
            />
          </div>
        )}

        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-indigo-200" />
          <div className="space-y-6">
            {capsules.length === 0 ? (
              <p className="text-gray-400 text-sm pl-12">Aucune capsule dans cette expédition.</p>
            ) : (
              capsules.map((item) => {
                const journeyCapsuleId = item.id || item._id;
                const isLocked = item.isLocked;
                const isCompleted = item.isCompleted;
                const href = !isLocked ? resolveCapsuleHref(item, journeyId) : null;

                const cardInner = (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm text-[#2d2a71] font-medium mb-1">
                        Capsule {item.capsuleNumber}
                        {isCompleted && (
                          <span className="ml-2 text-green-600 text-xs">✓ Terminée</span>
                        )}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                      {item.roadMapBrief && (
                        <p className="text-sm text-gray-500 mt-2">{item.roadMapBrief}</p>
                      )}
                      {isLocked && (
                        <p className="text-sm text-amber-600 mt-2">
                          {isPurchased
                            ? '🔒 Termine la capsule précédente pour débloquer'
                            : "🔒 Débloque l'expédition pour accéder"}
                        </p>
                      )}
                      {!isLocked && item.hasSixPartContent && (
                        <p className="text-xs text-gray-400 mt-2">Parcours en 6 étapes</p>
                      )}
                    </div>
                    {item.estimatedTime && (
                      <div className="text-right text-sm text-gray-500 shrink-0">
                        ⏱ {item.estimatedTime}
                      </div>
                    )}
                  </div>
                );

                return (
                  <div key={journeyCapsuleId} className="relative flex items-start gap-6">
                    <div className="relative z-10">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full border bg-white text-lg">
                        {isCompleted ? '✓' : isLocked ? '🔒' : '⭐'}
                      </div>
                    </div>
                    <div
                      className={`flex-1 border rounded-xl p-6 transition ${
                        isLocked
                          ? 'bg-gray-100 opacity-60 cursor-not-allowed'
                          : 'bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      {href ? (
                        <Link href={href} className="block">
                          {cardInner}
                        </Link>
                      ) : (
                        cardInner
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {isPurchased && allCompleted && (
          <div className="border-t pt-8 space-y-4">
            <h2 className="text-xl font-bold text-[#2d2a71]">🤖 Synthèse finale Marii</h2>
            {!expeditionReport ? (
              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  Félicitations ! Tu as terminé toutes les capsules. Marii peut maintenant
                  produire une synthèse globale de ton expédition.
                </p>
                <button
                  type="button"
                  onClick={handleExpeditionSynthesis}
                  disabled={generatingExpedition}
                  className="px-5 py-2.5 bg-[#2d2a71] text-white rounded-xl text-sm disabled:opacity-60"
                >
                  {generatingExpedition ? 'Génération...' : 'Générer la synthèse finale'}
                </button>
              </div>
            ) : (
              <div
                className="prose max-w-none border rounded-xl p-6 bg-white"
                dangerouslySetInnerHTML={{ __html: expeditionReport.reportHtml }}
              />
            )}
            {expeditionReport && (
              <RecommendationPanel
                context="journey_complete"
                journeyId={journeyId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
