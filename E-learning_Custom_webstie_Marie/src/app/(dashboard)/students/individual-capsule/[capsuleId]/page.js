'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import CapsuleJourneyExperience from '@/Components/Students/CapsuleJourney/CapsuleJourneyExperience';

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const capsuleId = params.capsuleId;
  const journeyId = searchParams.get('journeyId');
  const stepParam = searchParams.get('step');

  return (
    <CapsuleJourneyExperience
      capsuleId={capsuleId}
      journeyId={journeyId}
      initialStep={stepParam || 1}
    />
  );
}
