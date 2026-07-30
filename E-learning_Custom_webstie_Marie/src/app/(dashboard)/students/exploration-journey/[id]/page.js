'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useGetAllCapsulesCategoryFullDataQuery } from '@/redux/fetures/capsules/capsules';
import ExpeditionCapsuleList from '@/Components/Students/ExpeditionJourney/ExpeditionCapsuleList';

export default function ExpeditionJourneyDetailPage() {
  const params = useParams();
  const journeyId = params?.id;

  const { data, isLoading, isError } = useGetAllCapsulesCategoryFullDataQuery(
    { journeyId },
    { skip: !journeyId },
  );

  if (isLoading) {
    return <p className="text-center py-10 text-gray-500">Chargement de l&apos;expédition...</p>;
  }

  if (isError || !data?.data) {
    return <p className="text-center text-red-500 py-10">Impossible de charger l&apos;expédition.</p>;
  }

  const { journey, capsules = [], isPurchased } = data.data;

  return (
    <ExpeditionCapsuleList
      journeyId={journeyId}
      journey={journey}
      capsules={capsules}
      isPurchased={isPurchased}
    />
  );
}
