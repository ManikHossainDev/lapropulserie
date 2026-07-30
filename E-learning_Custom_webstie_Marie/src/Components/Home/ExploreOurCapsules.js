import React from 'react';
import CategoryCarosal from '../Cards/CategoryCarosal';
import Capsules from '../Cards/Capsules';

const ExploreOurCapsules = () => {

    const data = [
        {
            title: 'Marketing Numérique',
            discription: 'Un doux voyage de lincertitude professionnelle au but aligné, guidé par la sagesse cosmique et la connexion humaine',
            type: 'Niveau Intermédiaire',
            image: '/Images/Cards/card-image.png',
            price: 40,
            totalRatings: 52,
            avgRating: 4.5,

        },
        {
            title: 'Gestion Avancée de la Conception de Produits ',
            discription: 'Un doux voyage de lincertitude professionnelle au but aligné, guidé par la sagesse cosmique et la connexion humaine',
            type: 'Niveau Intermédiaire',
            image: '/Images/Cards/card-image.png',
            price: 45,
            totalRatings: 78,
            avgRating: 4.6,
        },
        {
            title: 'Développement Web et Design',
            discription: 'Un doux voyage de lincertitude professionnelle au but aligné, guidé par la sagesse cosmique et la connexion humaine Un doux voyage de lincertitude professionnelle au but aligné, guidé par la sagesse cosmique et la connexion humaine',
            type: 'Niveau Intermédiaire',
            image: '/Images/Cards/card-image.png',
            price: 60,
            totalRatings: 45,
            avgRating: 4.5,
        },
        {
            title: 'Développement Web et Design',
            discription: 'Un doux voyage de lincertitude professionnelle au but aligné, guidé par la sagesse cosmique et la connexion humaine Un doux voyage de lincertitude professionnelle au but aligné, guidé par la sagesse cosmique et la connexion humaine',
            type: 'Niveau Intermédiaire',
            image: '/Images/Cards/card-image.png',
            price: 150,
            totalRatings: 45,
            avgRating: 4.5,
        }
    ]

    return (
        <div className='my-20 lg:my-32 px-4'>
            <h2 className="text-4xl lg:text-5xl text-center font-semibold text-primary">
                Explorez Nos Capsules
            </h2>
            {/* carosal with lg:grid-cols-8 item show swiper */}
            <div>
                <CategoryCarosal />
            </div>
            <div className='grid lg:grid-cols-4 gap-5'>
                {
                    data.map((item, index) => <Capsules key={index} item={item} />)
                }
            </div>
        </div>
    );
}

export default ExploreOurCapsules;

