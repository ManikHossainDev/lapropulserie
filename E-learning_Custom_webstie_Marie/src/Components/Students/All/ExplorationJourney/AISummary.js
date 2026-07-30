'use client';
import React from 'react';
import { FaBrain } from 'react-icons/fa';
import { GiDjedPillar } from "react-icons/gi";

import { FaLocationDot } from 'react-icons/fa6';
import Link from 'next/link';

const AISummary = () => {
    return (
        <div className=" text-left  py-12">

            {/* Header */}
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-indigo-900 mb-3">
                    🚀 The Science of Purpose
                </h1>
                <p className="text-gray-600">
                    Preview the psychological framework you’ll be using in the next steps.
                </p>
            </div>

            {/* Section 1 */}
            <div className="mb-10 border border-gray-200 p-5 rounded-lg flex gap-5">
                <div className='h-14 min-w-14 rounded-full bg-yellow-500 text-white border flex items-center justify-center'>
                    <FaBrain className='text-3xl' />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-yellow-800 mb-3">
                        The Brain of Meaning
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        Meaningful work activates high-efficiency dopamine circuits,
                        contrasting with the survival-driven cortisol spikes of high-stress environments.
                    </p>

                    <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                        <h3 className="text-sm font-bold text-yellow-700 mb-1">
                            EMPIRICAL EVIDENCE
                        </h3>
                        <p className="text-gray-700">
                            The Grant/Harvard 2019 study correlates purpose with a
                            <span className="font-semibold text-yellow-700"> 37% increase in productivity.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 2 */}
            <div className="mb-10 border border-gray-200 p-5 rounded-lg flex gap-5">
                <div className='h-14 min-w-14 rounded-full bg-blue-500 text-white border flex items-center justify-center'>
                    <FaLocationDot className='text-3xl' />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-blue-800 mb-3">
                        Values as Emotional GPS
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        Following Antonio Damasio’s theory, values act as biological markers.
                        Think of it as a coherence/misalignment dashboard: when your actions
                        match your values, your internal systems signal “all systems nominal.”
                    </p>

                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                        <h3 className="text-sm font-bold text-blue-700 mb-1">
                            METAPHOR
                        </h3>
                        <p className="text-gray-700">
                            Misalignment creates cognitive “drag” that slows down your career propulsion.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 3 */}
            <div className="mb-10 border border-gray-200 p-5 rounded-lg flex gap-5">
                <div className='h-14 min-w-14 rounded-full bg-purple-500 text-white border flex items-center justify-center'>
                    <GiDjedPillar className='text-3xl' />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-purple-800 mb-3">
                        Psychology Pillars
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        Meaningful work activates high-efficiency dopamine circuits,
                        contrasting with the survival-driven cortisol spikes of high-stress environments.
                    </p>

                    <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                        <h3 className="text-sm font-bold text-purple-700 mb-1">
                            IMPACT STATS
                        </h3>
                        <p className="text-gray-700">
                            The Grant/Harvard 2019 study correlates purpose with a
                            <span className="font-semibold text-purple-700"> 37% increase in productivity.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 4 */}
            <div className='text-center bg-blue-50 p-5 rounded-xl'>
                <h2 className="text-2xl font-semibold text-indigo-800 mb-3">
                    Practical Application
                </h2>
                <p className="text-gray-700 leading-relaxed">
                    Meaningful work activates high-efficiency dopamine circuits,
                    contrasting with the survival-driven cortisol spikes of high-stress environments.
                </p>
            </div>

            <div className='flex items-center justify-center'>
                <Link href="/students/claim-your-gift" className='mt-4 cursor-pointer px-8 py-4 customSignUpButton  font-semibold text-white rounded-md'>Collect Your Credits</Link>
            </div>

        </div>
    );
};

export default AISummary;
