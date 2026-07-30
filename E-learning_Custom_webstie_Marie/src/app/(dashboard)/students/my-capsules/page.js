import ExpeditionJourneyBanner from '@/Components/Students/Mentors/ExpeditionJourneyBanner';
import PurchasedCapsules from '@/Components/Students/Mentors/PurchasedCapsules';
import PurchasedGiftedCapsules from '@/Components/Students/Mentors/PurchasedGiftedCapsules';
import PurchasedSuggestedCapsules from '@/Components/Students/Mentors/PurchasedSuggestedCapsules';
import React from 'react';

const Page = () => {
    return (
        <div>
            <ExpeditionJourneyBanner />
            <PurchasedCapsules />
            <PurchasedGiftedCapsules />
            <PurchasedSuggestedCapsules />
        </div>
    );
};

export default Page;
