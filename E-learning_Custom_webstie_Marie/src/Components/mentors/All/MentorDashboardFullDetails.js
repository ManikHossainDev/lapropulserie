import Link from 'next/link';
import React from 'react';
import { FaChevronRight, FaStar } from 'react-icons/fa';
import {
    useGetOnboardingStatusQuery,
    useGetMentorDashboardQuery,
    useGetMentorRevenueQuery,
} from '../../../redux/fetures/Mentors/MentorOnboarding';

const MentorDashboardFullDetails = () => {
    const { data: onboardingData, isLoading: onboardingLoading } = useGetOnboardingStatusQuery();
    const { data: dashboardData, isLoading: dashboardLoading } = useGetMentorDashboardQuery();
    const { data: revenueData, isLoading: revenueLoading } = useGetMentorRevenueQuery();

    const isLive = onboardingData?.data?.isLive || false;
    const dashboard = dashboardData?.data || {};
    const revenue = revenueData?.data || {};
    const recentReviews = dashboard?.recentReviews || [];

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    if (onboardingLoading) {
        return (
            <div className="p-4 space-y-4 max-w-5xl mx-auto bg-white rounded-2xl shadow-md">
                <div className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-2xl mb-4"></div>
                    <div className="h-96 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 max-w-5xl mx-auto bg-white rounded-2xl shadow-md">

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 gap-4">

                {/* Average Rating - Left Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">Note moyenne</p>
                        <span className="text-2xl">⭐</span>
                    </div>
                    {dashboardLoading ? (
                        <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-2"></div>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-gray-800 mb-2">
                                {dashboard?.averageRating || '--'}
                            </p>
                            <div className="flex gap-1 mb-2">
                                {renderStars(dashboard?.averageRating || 0)}
                            </div>
                            <p className="text-xs text-gray-400">
                                {dashboard?.averageRating > 0
                                    ? `${dashboard?.ratingGrowthPercentage || 0}% de progression`
                                    : 'Aucune note pour le moment'}
                            </p>
                        </>
                    )}
                </div>

                {/* Revenue Overview - Right Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">Aperçu des revenus</p>
                        <span className="text-2xl">💵</span>
                    </div>
                    {revenueLoading ? (
                        <div className="animate-pulse h-8 w-20 bg-gray-200 rounded mb-2"></div>
                    ) : (
                        <>
                            <p className="text-2xl font-bold text-gray-800 mb-2">
                                ${Number(revenue?.lifetimeEarnings || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400 mt-6">
                                {revenue?.lifetimeEarnings > 0
                                    ? `${revenue?.monthlyGrowthPercentage || 0}% de progression`
                                    : 'Aucun revenu pour le moment'}
                            </p>
                            <p className="text-xs text-gray-400">
                                Ce mois-ci : ${Number(revenue?.thisMonthEarnings || 0).toFixed(2)} ({revenue?.timePeriod || '0 mois'})
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Content Based on isLive Status */}
            {isLive ? (
                <>
                    {/* Live State - Show Reviews from dashboard API */}
                    {recentReviews?.length > 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Avis récents</h3>
                            <div className="space-y-4">
                                {recentReviews.map((review, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={review?.student?.avatarUrl || '/Images/default-avatar.png'}
                                                    alt={review?.student?.name || 'Student'}
                                                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {review?.student?.name || 'Anonymous'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {review?.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {renderStars(review?.rating || 0)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{review?.review || 'Aucun commentaire'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-100 rounded-2xl min-h-[40vh] p-10 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl mb-5">
                                ⭐
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                Aucun avis pour le moment
                            </h2>
                            <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
                                Réalisez des sessions avec vos mentorés pour recevoir votre premier avis. Votre profil est en ligne et visible pour les futurs mentorés !
                            </p>
                        </div>
                    )}
                </>
            ) : (
                /* Not Live - Show Empty State */
                <div className="bg-gray-100 rounded-2xl min-h-[60vh] p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl mb-5">
                        🚀
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Votre première mission commence ici
                    </h2>

                    <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-6">
                        Complétez votre profil pour attirer des mentorés et recevoir des avis. Une fois votre profil visible, vos futurs mentorés vous trouveront ici.
                    </p>

                    <Link href="/mentor/profile-setup" className="bg-primary flex items-center hover:bg-indigo-800 transition text-white text-sm px-6 py-4 rounded-lg font-medium">
                        Compléter mon profil <FaChevronRight className="inline ml-1" />
                    </Link>
                </div>
            )}

        </div>
    );
};

export default MentorDashboardFullDetails;