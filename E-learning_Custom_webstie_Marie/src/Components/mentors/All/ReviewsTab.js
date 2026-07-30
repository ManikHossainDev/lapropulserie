'use client';
import React from 'react';
import { Rate } from 'antd';

const ReviewsTab = ({ data = [], isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading reviews...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">⭐</span>
                <h1 className="text-lg font-bold text-indigo-800">Reviews</h1>
            </div>

            {data.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-gray-500 text-sm">No reviews yet</p>
                    <p className="text-gray-400 text-xs mt-1">Your reviews will appear here after students review your sessions.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((review, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
                                        {review.studentName?.[0] || 'S'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {review.studentName || 'Student'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                                        </p>
                                    </div>
                                </div>
                                <Rate disabled defaultValue={review.rating || 0} className="text-xs" />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{review.comment || review.review}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewsTab;