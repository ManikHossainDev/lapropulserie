'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useGetAllCapsulesCategoryFullDataQuery,
  usePurchasedCapsuleJourneyMutation,
} from '@/redux/fetures/capsules/capsules';
import ExpeditionCapsuleList from '@/Components/Students/ExpeditionJourney/ExpeditionCapsuleList';
import { useGetStudentOnboardingStatusQuery } from '@/redux/fetures/auth/onboardingStatus';
import { toast } from 'react-toastify';

export default function ExpeditionJourneyDetailPage() {
  const params = useParams();
  const journeyId = params?.id;

  const { data: onboardingRes, isLoading: onboardingLoading } =
    useGetStudentOnboardingStatusQuery();
  const bilanDone = Boolean(
    onboardingRes?.data?.hasCompletedQuestionnaire ||
      onboardingRes?.data?.isCompleted,
  );

  const { data, isLoading, isError, refetch } = useGetAllCapsulesCategoryFullDataQuery(
    { journeyId },
    { skip: !journeyId || !bilanDone },
  );

  const [purchaseJourney, { isLoading: isPurchasing }] = usePurchasedCapsuleJourneyMutation();

  if (onboardingLoading || (bilanDone && isLoading)) {
    return <p className="text-center py-10 text-gray-500">Chargement de l&apos;expédition...</p>;
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

  if (isError || !data?.data) {
    return <p className="text-center text-red-500 py-10">Impossible de charger l&apos;expédition.</p>;
  }

  const { journey, capsules = [], isPurchased } = data.data;

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
      showPurchaseCta={!isPurchased}
      onPurchase={handlePurchase}
      purchasePrice={journey?.price}
      isPurchasing={isPurchasing}
    />
  );
}
