'use client';
import AlignmentFramework from '@/Components/Home/AlignmentFramework';
import ChooseYourMission from '@/Components/Home/ChooseYourMission';
import CosmicEcosystem from '@/Components/Home/CosmicEcosystem';
import DashboardCheck from '@/Components/Home/DashboardCheck';
import ExpertGuideMentor from '@/Components/Home/ExpertGuideMentor';
import ExploreOurCapsules from '@/Components/Home/ExploreOurCapsules';
import ForMentors from '@/Components/Home/ForMentors';
import Hero from '@/Components/Home/Hero';
import HomeTestimonial from '@/Components/Home/HomeTestimonial';
import Knowsomeone from '@/Components/Home/Knowsomeone';
import Mostcompanies from '@/Components/Home/Mostcompanies';
import Theirprofessionallife from '@/Components/Home/Theirprofessionallife';
import WhatExplorersSay from '@/Components/Home/WhatExplorersSay';
import YourExploration from '@/Components/Home/YourExploration';
import YourPathThrough from '@/Components/Home/YourPathThrough';
import React from 'react';

const Page = () => {
    return (
        <div className=''>
            <section id="hero">
                <Hero />
            </section>
            <div className='container mx-auto'>
                <section id="approach">
                    <Theirprofessionallife />
                </section>
                <section id="how-it-works">
                    <DashboardCheck />
                </section>
                <section id="alignment">
                    <AlignmentFramework />
                </section>
                <section id="path">
                    <YourPathThrough />
                </section>
                <section id="mission">
                    <ChooseYourMission />
                </section>
                <section id="ecosystem">
                    <CosmicEcosystem />
                </section>
                <section id="exploration">
                    <YourExploration />
                </section>
                <section id="testimonials">
                    <WhatExplorersSay />
                </section>
                <section id="for-mentors">
                    <ForMentors />
                </section>
                <section id="know-someone">
                    <Knowsomeone />
                </section>
                <section id="for-companies">
                    <Mostcompanies />
                </section>
                {/* <section id="capsules">
                    <ExploreOurCapsules />
                </section>
                <section id="guide-mentor">
                    <ExpertGuideMentor />
                </section>
                <section id="testimonial">
                    <HomeTestimonial />
                </section> */}
            </div>
        </div>
    );
}

export default Page;
