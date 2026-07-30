import YourPersonalizedSummary from '@/Components/Students/All/Questions/YourPersonalizedSummary';
import React from 'react';

const Page = () => {
    return (
        <div className="relative min-h-screen p-10 ">
            <div className="absolute inset-0 z-0  bg-[url('/Images/StudentsDash/page_bg.png')] bg-cover opacity-60" />
            <div className='z-10'>
                <YourPersonalizedSummary />
            </div>
        </div>
    );
}

export default Page;
