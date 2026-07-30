'use client';

import MentorDashboardFullDetails from '@/Components/mentors/All/MentorDashboardFullDetails';
import WelcomeFutureMentor from '@/Components/mentors/All/WelcomeFutureMentor';
import BeginQuestionnaire from '@/Components/Students/All/Questions/BeginQuestionnaire';
import LearningCapsules from '@/Components/Students/All/Questions/LearningCapsules';
import StudentsTopMentors from '@/Components/Students/All/Questions/StudentsTopMentors';
import ShowCatonEachPage from '@/Components/Students/Common/ShowCatonEachPage';
import React from 'react';

const Page = () => {
    const catroonUrl = '/Images/Cartoon/no1.png';

    return (
        <div className="relative min-h-screen w-full p-10 z-0">
            <div className="absolute inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover bg-no-repeat opacity-60" />

            <div className="relative z-10">
                {/* <WelcomeFutureMentor /> */}
                <MentorDashboardFullDetails />
            </div>
        </div>

    );
}

export default Page;
