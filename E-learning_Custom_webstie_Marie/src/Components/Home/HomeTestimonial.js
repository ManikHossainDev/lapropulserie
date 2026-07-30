import React from 'react';
import TestimonialCard from '../Cards/TestimonialCard';

const HomeTestimonial = () => {

    const data = [
        {
            userName: 'Jean Dupont',
            userImg: '/Images/Home/Testimonial/user.png',
            userDesignation: 'PDG, Propulsaria',
            feedback: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.',
            rating: 5
        },
        {
            userName: 'Jean Dupont',
            userImg: '/Images/Home/Testimonial/user.png',
            userDesignation: 'PDG, Propulsaria',
            feedback: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.',
            rating: 4
        },
        {
            userName: 'Jean Dupont',
            userImg: '/Images/Home/Testimonial/user.png',
            userDesignation: 'PDG, Propulsaria',
            feedback: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo.',
            rating: 4
        },
    ]

    return (
        <div className='my-20 lg:my-32 px-4'>
            <div className='text-center max-w-3xl mx-auto'>
                <h2 className="text-2xl lg:text-3xl font-semibold text-primary">
                    Pour les mentors : partagez votre lumière stellaire
                </h2>
                <p className="mt-4 text-gray-700 ">
                    Une progression douce et guidée vers la clarté professionnelle
                </p>
            </div>

            <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 '>
                {
                    data.map((item, index) =>
                        <TestimonialCard item={item} key={index} />
                    )
                }
            </div>

        </div>
    );
}

export default HomeTestimonial;

