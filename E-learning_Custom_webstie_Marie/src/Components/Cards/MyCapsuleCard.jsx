'use client';

import Link from 'next/link';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { HiStar } from 'react-icons/hi2';
import { usePurchasedCapsuleMutation } from '@/redux/fetures/capsules/capsules';
import { toast } from 'react-toastify';

const MyCapsuleCard = ({ item }) => {
    const [purchaseCapsule, { isLoading }] = usePurchasedCapsuleMutation();

    const capsuleId = item?.capsuleId || item?.id || item?._id;
    const isOwned = item?.isPurchased || item?.accessType === 'purchased' || item?.accessType === 'gifted';
    const rating = item?.avgRating ?? item?.averageRating ?? 0;
    const reviewCount = item?.totalReviewCount ?? 0;

    const learnHref = item?.journeyId
        ? `/students/individual-capsule/${capsuleId}?journeyId=${item.journeyId}`
        : `/students/individual-capsule/${capsuleId}`;

    const expeditionHref = item?.journeyId
        ? `/students/exploration-journey/${item.journeyId}`
        : '/students/exploration-journey/capsule-journey';

    const handlePurchase = async () => {
        try {
            const res = await purchaseCapsule(capsuleId).unwrap();
            toast.success('Redirecting to payment...');
            if (res?.data?.url) {
                window.open(res.data.url, '_blank');
            }
        } catch (error) {
            toast.error(error?.data?.message || 'Purchase failed. Please try again.');
        }
    };

    return (
        <div className="border rounded-xl h-full flex flex-col bg-white">
            <img
                className="rounded-t-xl h-60 object-cover w-full bg-gray-100"
                src={item?.thumbnail || '/Images/StudentsDash/page_bg.png'}
                alt={item?.title || 'Capsule'}
            />

            <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {item?.purchaseSource === 'expedition' && (
                            <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                Expedition
                            </span>
                        )}
                        {item?.accessType === 'gifted' && (
                            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Gift
                            </span>
                        )}
                        {item?.category && (
                            <span className="text-xs text-gray-500">{item.category}</span>
                        )}
                    </div>

                    <span className="flex items-center gap-2 text-sm">
                        <HiStar className="text-orange-500 text-xl" />
                        {rating} ({reviewCount})
                    </span>

                    <h3 className="my-3 text-xl font-semibold text-primary line-clamp-2">
                        {item?.title}
                    </h3>

                    <p className="text-gray-500 text-sm line-clamp-3">{item?.description}</p>
                </div>

                <div className="mt-4">
                    <hr className="my-3" />
                    {isOwned ? (
                        <div className="space-y-2">
                            <Link
                                href={learnHref}
                                className="w-full flex items-center justify-between text-[#2d2a71] font-semibold hover:opacity-80"
                            >
                                <span>Continue learning</span>
                                <FaArrowRight />
                            </Link>
                            {item?.purchaseSource === 'expedition' && (
                                <Link
                                    href={expeditionHref}
                                    className="block text-sm text-gray-500 hover:text-[#2d2a71]"
                                >
                                    View in Expedition Journey →
                                </Link>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handlePurchase}
                            disabled={isLoading}
                            className="w-full flex items-center justify-between disabled:opacity-60"
                        >
                            <span className="text-xl font-semibold">
                                {item?.price != null ? `${item.price}€` : 'Buy'}
                            </span>
                            <FaArrowRight className="text-2xl text-primary" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyCapsuleCard;
