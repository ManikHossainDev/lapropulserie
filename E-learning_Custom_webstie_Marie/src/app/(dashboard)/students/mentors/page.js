import BookSessionAgain from '@/Components/Students/Mentors/BookSessionAgain';
import RecommendedMentors from '@/Components/Students/Mentors/RecommendedMentors';
import Topmentors from '@/Components/Students/Mentors/Topmentors';
import React from 'react';

const Page = () => {
    return (
        <div>
            <BookSessionAgain />
            <RecommendedMentors />
            <Topmentors />

        </div>
    );
}

export default Page;
