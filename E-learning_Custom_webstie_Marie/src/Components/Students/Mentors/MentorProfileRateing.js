'use client';

import React, { useState } from 'react';
import { Modal, Rate, Avatar, Progress, Input } from 'antd';
import 'antd/dist/reset.css';
import { useReviewMantorMutation } from '@/redux/fetures/Mentors/Mentors';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';

const { TextArea } = Input;

export default function MentorProfileRateing({ mentor }) {
    const params = useParams();
    const mentorId = params?.id;

    const [giveReview] = useReviewMantorMutation();

    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');

    const reviews = (mentor?.recentReviews || []).map((review) => ({
        name: review.reviewerName || 'Anonyme',
        rating: review.rating,
        avatar: review.reviewerAvatarUrl,
        time: review.createdAt
            ? new Date(review.createdAt).toLocaleDateString('fr-FR')
            : '',
        message: review.review,
    }));

    const averageRating = mentor?.avgRating || 0;
    const totalReviews = mentor?.totalRatingCount || reviews.length;
    const breakdown = mentor?.ratingBreakdown || {};
    const ratingDistribution = [
        { star: 5, percent: breakdown.fiveStar || 0 },
        { star: 4, percent: breakdown.fourStar || 0 },
        { star: 3, percent: breakdown.threeStar || 0 },
        { star: 2, percent: breakdown.twoStar || 0 },
        { star: 1, percent: breakdown.oneStar || 0 },
    ];

    const submitRating = async () => {
        try {
            const res = await giveReview({
                mentorId,
                body: { mentorId, rating, review: reviewText },
            }).unwrap();

            if (res?.code === 200) {
                toast.success('Avis envoyé avec succès.');
                setOpen(false);
                setRating(0);
                setReviewText('');
            } else {
                toast.error(res?.message || 'Impossible d’envoyer l’avis.');
            }
        } catch (error) {
            console.error('Failed to submit review:', error);
            toast.error('Impossible d’envoyer l’avis.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow border p-8 space-y-8">

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-indigo-900">
                    Témoignages
                </h2>

                <button
                    onClick={() => setOpen(true)}
                    className="px-6 py-3 rounded-lg customSignUpButton text-white font-medium"
                >
                    Noter le mentor
                </button>
            </div>

            <div className="flex gap-10 flex-wrap justify-between">
                <div className="text-center">
                    <h3 className="text-5xl font-bold text-gray-800">
                        {averageRating}
                    </h3>
                    <Rate disabled defaultValue={averageRating} allowHalf />
                    <p className="text-gray-500 text-sm mt-1">
                        Basé sur {totalReviews} avis
                    </p>
                </div>

                <div className="flex-1 max-w-md space-y-2">
                    {ratingDistribution.map((item) => (
                        <div key={item.star} className="flex items-center gap-3">
                            <span className="w-6 text-sm">{item.star}</span>
                            <Progress strokeWidth={10} percent={item.percent} showInfo={false} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-5">
                {reviews.length > 0 ? reviews.map((review, index) => (
                    <div key={index} className="flex gap-4 items-start w-full border-b pb-4">
                        <Avatar src={review.avatar} size={48} />
                        <div className="w-full">
                            <div className="flex items-center justify-between w-full gap-3">
                                <h4 className="font-semibold text-gray-800">
                                    {review.name}
                                </h4>
                                <h3 className="text-sm text-gray-400">
                                    {review.time}
                                </h3>
                            </div>
                            <Rate disabled defaultValue={review.rating} />
                            <p className="text-gray-400 text-[14px] mt-2">{review.message}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-gray-400">Aucun avis pour le moment.</p>
                )}
            </div>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={submitRating}
                okText="Envoyer"
                cancelText="Annuler"
                centered
            >
                <div className="py-4 space-y-6">
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4">
                            Notez votre mentor
                        </h3>
                        <Rate
                            allowClear={false}
                            value={rating}
                            onChange={setRating}
                            style={{ fontSize: 30 }}
                        />
                    </div>
                    <TextArea
                        rows={4}
                        placeholder="Écrivez votre avis (facultatif)"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                </div>
            </Modal>
        </div>
    );
}
