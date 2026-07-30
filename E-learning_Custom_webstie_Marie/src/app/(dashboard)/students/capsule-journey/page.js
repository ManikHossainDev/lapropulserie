'use client';

import React from 'react';
import {
  useGetCapsuleJourneyQuery,
  useGetAllCapsulesCategoryFullDataQuery,
} from '@/redux/fetures/capsules/capsules';
import ExpeditionCapsuleList from '@/Components/Students/ExpeditionJourney/ExpeditionCapsuleList';
import Link from 'next/link';

export default function PurchasedCapsuleJourneyPage() {
  const { data: capsuleJourney, isLoading: journeysLoading } = useGetCapsuleJourneyQuery();
  const journeyId = capsuleJourney?.data?.results?.[0]?.id;

  const { data: capsuleData, isLoading: capsulesLoading } = useGetAllCapsulesCategoryFullDataQuery(
    { journeyId },
    { skip: !journeyId },
  );

  if (journeysLoading || capsulesLoading) {
    return <p className="text-center py-10 text-gray-500">Chargement...</p>;
  }

  if (!journeyId) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500">Aucune expédition trouvée.</p>
        <Link href="/students/exploration-journey" className="text-[#2d2a71] underline">
          Découvrir les expéditions
        </Link>
      </div>
    );
  }

  const { journey, capsules = [], isPurchased } = capsuleData?.data || {};

  return (
    <ExpeditionCapsuleList
      journeyId={journeyId}
      journey={journey}
      capsules={capsules}
      isPurchased={isPurchased}
    />
  );
}
