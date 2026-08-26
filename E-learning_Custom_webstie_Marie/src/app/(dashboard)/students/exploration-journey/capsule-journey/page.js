'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useGetCapsuleJourneyQuery,
  useGetAllCapsulesCategoryFullDataQuery,
  usePurchasedCapsuleJourneyMutation,
} from '@/redux/fetures/capsules/capsules';
import ExpeditionCapsuleList from '@/Components/Students/ExpeditionJourney/ExpeditionCapsuleList';
import { useGetStudentOnboardingStatusQuery } from '@/redux/fetures/auth/onboardingStatus';
import { toast } from 'react-toastify';

export default function ExplorationJourneyPurchasePage() {
  const router = useRouter();
  const { data: onboardingRes, isLoading: onboardingLoading } =
    useGetStudentOnboardingStatusQuery();
  const bilanDone = Boolean(
    onboardingRes?.data?.hasCompletedQuestionnaire ||
      onboardingRes?.data?.isCompleted,
  );

  const { data: capsuleJourney, isLoading: journeysLoading } =
    useGetCapsuleJourneyQuery(undefined, { skip: !bilanDone });
  const journeyId = capsuleJourney?.data?.results?.[0]?.id;

  const {
    data: capsuleData,
    isLoading: capsulesLoading,
    refetch,
  } = useGetAllCapsulesCategoryFullDataQuery(
    { journeyId },
    { skip: !journeyId || !bilanDone },
  );

  const [purchaseJourney, { isLoading: isPurchasing }] =
    usePurchasedCapsuleJourneyMutation();

  const journey = capsuleData?.data?.journey;
  const capsules = capsuleData?.data?.capsules || [];
  const isPurchased = capsuleData?.data?.isPurchased;

  useEffect(() => {
    if (isPurchased && journeyId) {
      router.replace(`/students/exploration-journey/${journeyId}`);
    }
  }, [isPurchased, journeyId, router]);

  if (onboardingLoading || (bilanDone && (journeysLoading || capsulesLoading))) {
    return <p className="text-center py-10 text-gray-500">Chargement...</p>;
  }

  if (!bilanDone) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border text-center space-y-4">
        <p className="text-gray-700">
          Pour accéder au Parcours Exploration, commence par réaliser ton bilan
          professionnel.
        </p>
        <Link
          href="/students/all-questions"
          className="inline-block bg-[#2d2a71] text-white px-6 py-3 rounded-xl text-sm font-medium"
        >
          Faire mon bilan
        </Link>
      </div>
    );
  }

  if (!journeyId) {
    return (
      <p className="text-center py-10 text-gray-500">
        Aucune expédition disponible.
      </p>
    );
  }

  if (isPurchased) {
    return <p className="text-center py-10 text-gray-500">Redirection...</p>;
  }

  const handlePurchase = async () => {
    try {
      const res = await purchaseJourney({ journeyId }).unwrap();
      if (res?.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        toast.success('Expédition débloquée !');
        refetch();
      }
    } catch {
      toast.error("Échec du déblocage de l'expédition");
    }
  };

  return (
    <ExpeditionCapsuleList
      journeyId={journeyId}
      journey={journey}
      capsules={capsules}
      isPurchased={isPurchased}
      showPurchaseCta
      onPurchase={handlePurchase}
      purchasePrice={
        journey?.price ?? capsuleJourney?.data?.results?.[0]?.price
      }
      isPurchasing={isPurchasing}
    />
  );
}
