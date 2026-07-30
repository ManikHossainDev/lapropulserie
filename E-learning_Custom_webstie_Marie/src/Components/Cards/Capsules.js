import { usePurchasedCapsuleMutation } from '@/redux/fetures/capsules/capsules';
import Link from 'next/link';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { HiStar } from 'react-icons/hi2';
import { toast } from 'react-toastify';

const Capsules = ({ item }) => {

    const [purchesCapsule] = usePurchasedCapsuleMutation();


    const handlePurches = async (id) => {

        try {
            const res = await purchesCapsule(id).unwrap();
            console.log(res)
            toast.success('Capsule Purchased Successfully!');
            window.open(res?.data?.url, "_blank");
        } catch (error) {
            console.log(error);
            toast.error(error?.data?.message || 'Failed to book mentor. Please try again later.');
        }
    }

    return (
        <div className='border rounded-xl h-full flex flex-col'>
            <img
                className='rounded-t-xl h-60 object-cover w-full'
                src={item?.thumbnail}
                alt=""
            />

            <div className='p-5 flex flex-col justify-between flex-1'>
                <div>
                    <span className='flex items-center gap-2'>
                        <HiStar className='text-orange-500 text-2xl' />
                        {item?.avgRating} ({item.totalReviewCount})
                    </span>

                    <h1 className='my-3 text-2xl font-semibold text-primary'>
                        {item?.title}
                    </h1>

                    <p className='text-gray-500'>{item?.description}</p>
                </div>

                <div>
                    <hr className='my-3' />
                    <button onClick={() => handlePurches(item?.capsuleId)} className='w-full flex items-center justify-between'>
                        <span className='text-xl font-semibold'>
                            ${item?.price}
                        </span>
                        <FaArrowRight className='text-2xl text-primary' />
                    </button>
                </div>
            </div>
        </div>

    );
}

export default Capsules;
