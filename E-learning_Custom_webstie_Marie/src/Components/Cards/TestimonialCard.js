import React from 'react';
import { HiStar } from 'react-icons/hi2';

const TestimonialCard = ({ item }) => {

    console.log(item)

    return (
        <div className='p-5 shadow-[0_0_5px_#2d2a71] rounded-lg'>
            <div className='flex justify-between'>
                <div className='flex gap-3'>
                    <img className='w-14' src={item.userImg} alt="" />
                    <div>
                        <h3 className='font-semibold'>{item.userName}</h3>
                        <p className='text-sm text-gray-500'>{item.userDesignation}</p>
                    </div>
                </div>
                <img className='w-14' src={'/Images/Home/Testimonial/qutations.png'} alt="" />
            </div>
            <div>
                <ul className='flex items-center '>

                    {[...Array(item.rating)].map((_, index) => (
                        <li><HiStar className='text-xl text-orange-500' /></li>
                    ))}
                </ul>
                <p className='mt-3 text-gray-500'>{item.feedback}</p>
            </div>
        </div>
    );
}

export default TestimonialCard;
