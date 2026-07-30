'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetCapsuleJourneyQuery,
  useGetAllCapsulesCategoryFullDataQuery,
  usePurchasedCapsuleJourneyMutation,
} from '@/redux/fetures/capsules/capsules';
import ExpeditionCapsuleList from '@/Components/Students/ExpeditionJourney/ExpeditionCapsuleList';
import { toast } from 'react-toastify';

export default function ExplorationJourneyPurchasePage() {
  const router = useRouter();
  const { data: capsuleJourney, isLoading: journeysLoading } = useGetCapsuleJourneyQuery();
  const journeyId = capsuleJourney?.data?.results?.[0]?.id;

  const {
    data: capsuleData,
    isLoading: capsulesLoading,
    refetch,
  } = useGetAllCapsulesCategoryFullDataQuery({ journeyId }, { skip: !journeyId });

  const [purchaseJourney, { isLoading: isPurchasing }] = usePurchasedCapsuleJourneyMutation();

  const journey = capsuleData?.data?.journey;
  const capsules = capsuleData?.data?.capsules || [];
  const isPurchased = capsuleData?.data?.isPurchased;

  useEffect(() => {
    if (isPurchased && journeyId) {
      router.replace(`/students/exploration-journey/${journeyId}`);
    }
  }, [isPurchased, journeyId, router]);

  if (journeysLoading || capsulesLoading) {
    return <p className="text-center py-10 text-gray-500">Chargement...</p>;
  }

  if (!journeyId) {
    return <p className="text-center py-10 text-gray-500">Aucune expédition disponible.</p>;
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
      purchasePrice={journey?.price ?? capsuleJourney?.data?.results?.[0]?.price}
      isPurchasing={isPurchasing}
    />
  );
}
