'use client';

import React, { useState } from 'react';
import { Modal, Rate, Avatar, Progress, Input } from 'antd';
import 'antd/dist/reset.css';
import { useReviewMantorMutation } from '@/redux/fetures/Mentors/Mentors';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';

const { TextArea } = Input;

const demoReviews = [
    {
        name: 'Jennie Yun',
        rating: 5,
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        time: '2 months',
        message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quae.'
    },
    {
        name: 'Michael Chen',
        rating: 4,
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        time: '3 months',
        message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quae.'
    },
    {
        name: 'Sophia Park',
        rating: 5,
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        time: '1 month',
        message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quae.'
    },
];

const ratingDistribution = [
    { star: 5, percent: 80 },
    { star: 4, percent: 12 },
    { star: 3, percent: 5 },
    { star: 2, percent: 2 },
    { star: 1, percent: 1 },
];

const averageRating = 4.8;

export default function MentorProfileRateing() {
    const params = useParams();
    const mentorId = params?.id;

    const [giveReview] = useReviewMantorMutation(); // ✅ important 


    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');

    const submitRating = async () => {

        // 👉 send to backend here
        const body = {
            mentorId: mentorId, // replace with actual mentor ID
            rating,
            review: reviewText,
        };

        try {
            const res = await giveReview({ mentorId, body }).unwrap();

            if (res?.code === 200) {
                toast.success("Review submitted successfully!");
                setOpen(false);
                setRating(0);
                setReviewText('');
            } else {
                toast.error(res?.message || "Failed to submit review");
            }
            // Optionally show success message or update UI
        }
        catch (error) {
            console.error("Failed to submit review:", error);
            // Optionally show error message to user
        }


    };

    return (
        <div className="bg-white rounded-2xl shadow border p-8 space-y-8">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-indigo-900">
                    Testimonials
                </h2>

                <button
                    onClick={() => setOpen(true)}
                    className="px-6 py-3 rounded-lg customSignUpButton text-white font-medium"
                >
                    Rate Mentor
                </button>
            </div>

            {/* SUMMARY */}
            <div className="flex gap-10 flex-wrap justify-between">
                <div className="text-center">
                    <h3 className="text-5xl font-bold text-gray-800">
                        {averageRating}
                    </h3>
                    <Rate disabled defaultValue={averageRating} allowHalf />
                    <p className="text-gray-500 text-sm mt-1">
                        Based on {demoReviews.length} reviews
                    </p>
                </div>

                <div className="flex-1 max-w-md space-y-2">
                    {ratingDistribution.map(item => (
                        <div key={item.star} className="flex items-center gap-3">
                            <span className="w-6 text-sm">{item.star}</span>
                            <Progress strokeWidth={10} percent={item.percent} showInfo={false} />
                        </div>
                    ))}
                </div>
            </div>

            {/* REVIEW LIST */}
            <div className="space-y-5">
                {demoReviews.map((review, index) => (
                    <div key={index} className="flex gap-4 items-start w-full border-b pb-4">
                        <Avatar src={review.avatar} size={48} />
                        <div className='w-full'>
                            <div className="flex items-center justify-between w-full gap-3">
                                <h4 className="font-semibold text-gray-800">
                                    {review.name}
                                </h4>
                                <h3 className="text-sm text-gray-400">
                                    {review.time} ago
                                </h3>
                            </div>
                            <Rate disabled defaultValue={review.rating} />
                            <p className="text-gray-400 text-[14px] mt-2">{review.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={submitRating}
                okText="Submit Rating"
                centered
            >
                <div className="py-4 space-y-6">

                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4">
                            Rate Your Mentor
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
                        className=''
                        placeholder="Write your feedback (optional)"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />

                </div>
            </Modal>

        </div>
    );
}