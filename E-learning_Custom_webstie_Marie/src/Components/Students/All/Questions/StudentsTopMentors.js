'use client';
import Capsules from '@/Components/Cards/Capsules';
import CategoryCarosal from '@/Components/Cards/CategoryCarosal';
import Mentors from '@/Components/Cards/Mentors';
import IsLoading from '@/Components/IsLoading';
import { useGetTopMentorsQuery } from '@/redux/fetures/Mentors/Mentors';
import React from 'react';

const StudentsTopMentors = () => { 

    const { data, isLoading } = useGetTopMentorsQuery();
    const fullData = data?.data?.results ?? [];



    return (
        <div className='bg-white max-w-6xl mx-auto rounded-2xl lg:p-10 p-5 mt-10'>

            <div>
                {/* <CategoryCarosal /> */}
                <h2 className='text-center text-4xl font-semibold text-primary  mb-10'>Top Mentors</h2>
            </div>
            <div>
                {
                    isLoading && <IsLoading row={10} />
                }
            </div>
            <div className='grid lg:grid-cols-3 gap-3'>
                {
                    fullData?.map((item, index) => <Mentors key={index} item={item} />)
                }
            </div>

        </div>
    );
}

export default StudentsTopMentors;
