'use client';
import React, { useState, useEffect } from 'react';

const ProfileSubscription = ({ data = {}, isLive = false }) => {
    const [isChanging, setIsChanging] = useState(false);
    const [selected, setSelected] = useState(data.subscriptionPlanId || '');
    const [saved, setSaved] = useState(data.subscriptionPlanId || '');

    useEffect(() => {
        if (data?.subscriptionPlanId) {
            setSelected(data.subscriptionPlanId);
            setSaved(data.subscriptionPlanId);
        }
    }, [data]);

    const plans = [
        {
            value: 'galactic',
            name: 'Galactic Guide',
            tagline: 'For serious mentors growing their reach.',
            price: 49,
            badge: selected && isLive ? 'Active' : null,
            features: [
                'Priority Profile Visibility',
                'Unlimited Leads',
                '"Verified Mentor" Badge',
                'Smart AI Matching',
            ],
        },
        {
            value: 'stellar',
            name: 'Stellar Explorer',
            tagline: 'Essential tools new mentors',
            price: 19,
            badge: null,
            features: [
                'Basic profile visibility',
            'Up to 3 leads per month',
            'Standard search listing',
            'Smart AI Matching',
        ],
    },
    {
        value: 'universal',
        name: 'Universal Master',
        tagline: 'Maximum exposure & zero fees.',
        price: 99,
        badge: null,
        features: [
            'Top of Search Results',
            'Featured in Weekly Newsletter',
            'Dedicated Success Manager',
            'Smart AI Matching',
        ],
    },
];

    const handleChangePlan = () => {
        if (isChanging) {
            setSaved(selected);
            setIsChanging(false);
        } else {
            setIsChanging(true);
        }
    };

    const handleCancel = () => {
        setSelected(saved);
        setIsChanging(false);
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg ">
            <div className=" space-y-3">

                {/* Plan Cards */}
                {plans.map((plan) => {
                    const isActive = selected === plan.value;
                    return (
                        <div
                            key={plan.value}
                            onClick={() => isChanging && setSelected(plan.value)}
                            className={`relative border-2 rounded-2xl p-5 bg-white transition-all
                                ${isChanging ? 'cursor-pointer' : 'cursor-default'}
                                ${isActive ? 'border-indigo-400 shadow-md' : 'border-gray-200'}`}
                        >
                            {/* On Going badge */}
                            {plan.badge && (
                                <span className="absolute -top-3 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                                    {plan.badge}
                                </span>
                            )}

                            {/* Selection indicator top-right */}
                            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                ${isActive ? 'border-indigo-800 bg-indigo-800' : 'border-gray-300 bg-white'}`}
                            >
                                {isActive && (
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>

                            <div className="flex gap-6">
                                {/* Left: Plan Info */}
                                <div className="sm:w-36 w-24 flex-shrink-0">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                                        {plan.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                                        {plan.tagline}
                                    </p>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                                        <span className="text-xs text-gray-400">/Month</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-px bg-gray-100 self-stretch" />

                                {/* Right: Features */}
                                <div className="flex-1 min-w-30 space-y-3 pt-1 pr-8">
                                    {plan.features.map((f) => (
                                        <div key={f} className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-indigo-800 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8 15.414l-4.707-4.707a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-xs text-gray-700">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Bottom Buttons */}
                <div className="flex gap-3 pt-1">
                    {isChanging && (
                        <button
                            onClick={handleCancel}
                            className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-3 rounded-xl hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleChangePlan}
                        className="flex-1 bg-indigo-800 hover:bg-indigo-700 text-white text-sm font-medium py-3 rounded-xl transition"
                    >
                        {isChanging ? 'Confirm Plan' : 'Change plan'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ProfileSubscription;