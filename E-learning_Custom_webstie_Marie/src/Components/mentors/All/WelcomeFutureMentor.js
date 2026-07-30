'use client';
import React from 'react';

const WelcomeFutureMentor = () => {
    return (
        <div className=" flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">

                {/* Icon */}
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-indigo-900 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Welcome, Future Mentor!
                </h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                    You're One Step Away From Joining Our Mentorship Program
                </p>

                {/* Steps Card */}
                <div className="border border-primary rounded-2xl p-5 mb-6">
                    <p className="text-sm text-gray-600 text-center mb-5">
                        To Complete Your Mentor Onboarding, Please:
                    </p>

                    <div className="space-y-4">
                        {/* Step 1 */}
                        <div className="flex gap-4 border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                1
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">
                                    Connect Your Calendly Account
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Link your Calendly account to our system so we can seamlessly schedule your onboarding interview
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4 border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-indigo-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                2
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">
                                    Book Your Interview Schedule
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Once connected, choose a convenient time slot for your mentor onboarding interview with our team
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-indigo-900 hover:bg-indigo-800 transition text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-medium text-sm mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Connect Calendly & Schedule Interview
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </button>

                {/* Footer Note */}
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                    <span className="text-yellow-500">⚡</span>{' '}
                    <span className="font-semibold text-gray-700">What happens next?</span>{' '}
                    After you connect and schedule, our team will review your application and meet with you at your chosen time.
                </p>

            </div>
        </div>
    );
};

export default WelcomeFutureMentor;