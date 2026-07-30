'use client';
import React, { useState } from 'react';
import { useGetMentorReviewsQuery, useGetMentorRatingOverviewQuery } from '@/redux/fetures/Mentors/MentorOnboarding';

const Stars = ({ rating, size = 'sm' }) => {
    const sz = size === 'lg' ? 'w-7 h-7' : 'w-4 h-4';
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className={`${sz} ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const Page = () => {
    const [page, setPage] = useState(1);
    const [showAll, setShowAll] = useState(false);

    const { data: reviewsData, isLoading: reviewsLoading } = useGetMentorReviewsQuery({ page, limit: 10 });
    const { data: ratingData, isLoading: ratingLoading } = useGetMentorRatingOverviewQuery();

    const reviews = reviewsData?.data || [];
    const meta = reviewsData?.meta || {};
    const ratingOverview = ratingData?.data || {};
    const ratingBreakdown = ratingOverview.ratingBreakdown || [];

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Aujourd’hui';
        if (diffDays === 1) return 'il y a 1 jour';
        if (diffDays < 7) return `il y a ${diffDays} jours`;
        if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} semaines`;
        if (diffDays < 365) return `il y a ${Math.floor(diffDays / 30)} mois`;
        return `il y a ${Math.floor(diffDays / 365)} ans`;
    };

    const displayed = showAll ? reviews : reviews.slice(0, 3);

    const handleLoadMore = () => {
        if (meta.hasNextPage) {
            setPage(prev => prev + 1);
        }
    };

    if (reviewsLoading && page === 1) {
        return (
            <div className="relative lg:py-10 py-5 w-full px-5 lg:px-0 z-0">
                <div className="absolute -z-10 inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover bg-no-repeat opacity-60" />
                <div className="max-w-6xl bg-gray-100 rounded-lg p-5 my-5 mx-auto text-center">
                    <p className="text-gray-500">Chargement des avis...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative lg:py-10 py-5 w-full px-5 lg:px-0 z-0">
            <div className="absolute -z-10 inset-0 bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover bg-no-repeat opacity-60" />
            <div className=" space-y-4 max-w-6xl bg-gray-100 rounded-lg p-5 my-5 mx-auto">

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-gray-900 mb-4">Aperçu des notes</h2>

                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0 text-center">
                            <p className="text-5xl font-bold text-gray-900 leading-none mb-2">
                                {ratingOverview.averageRating || 0}
                            </p>
                            <Stars rating={Math.round(ratingOverview.averageRating || 0)} size="sm" />
                            <p className="text-xs text-gray-400 mt-2">Par {ratingOverview.totalStudents || 0} utilisateurs</p>
                        </div>

                        <div className="flex-1 space-y-2">
                            {ratingBreakdown.map((row) => (
                                <div key={row.rating} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-3 flex-shrink-0">{row.rating}</span>
                                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-800 rounded-full"
                                            style={{ width: `${row.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-400 w-7 text-right flex-shrink-0">
                                        {String(row.percentage).padStart(2, '0')}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-900">Aperçu des avis</h2>
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            {showAll ? 'Voir moins' : 'Tous les avis'}
                        </button>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-3">📝</div>
                            <p className="text-gray-500 text-sm">Aucun avis pour le moment</p>
                            <p className="text-gray-400 text-xs mt-1">Vos avis apparaîtront ici après que les mentorés auront évalué vos sessions.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {displayed.map((review, index) => (
                                <div key={review._id || index} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={review.student?.avatarUrl || review.avatar || '/Images/default-avatar.png'}
                                                alt={review.student?.name || 'Student'}
                                                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{review.student?.name || 'Student'}</p>
                                                <p className="text-xs text-gray-400">{formatTimeAgo(review.createdAt)}</p>
                                            </div>
                                        </div>
                                        <Stars rating={review.rating || 0} size="sm" />
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed mt-2 pl-14">
                                        {review.comment || review.review || review.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {reviews.length > 0 && meta.hasNextPage && (
                    <div className="flex justify-center mt-4">
                        <button 
                            onClick={handleLoadMore}
                            className="customSignUpButton hover:bg-indigo-700 text-white text-sm font-bold py-3 px-10 rounded-lg transition"
                        >
                            Load More
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Page;