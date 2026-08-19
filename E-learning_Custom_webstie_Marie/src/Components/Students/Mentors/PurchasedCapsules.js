"use client";
import React from 'react';
import MyCapsuleCard from '@/Components/Cards/MyCapsuleCard';
import { useGetMySuggestedCapsuleQuery } from '@/redux/fetures/capsules/capsules';

const PurchasedCapsules = () => {
    const { data: capsules, isLoading } = useGetMySuggestedCapsuleQuery('purchased');
    const fullData = capsules?.data?.results ?? [];

    return (
        <div className='max-w-7xl mx-auto my-10 bg-gray-100 rounded-2xl p-5 lg:p-10'>
            <h2 className="text-4xl font-bold text-center text-primary mb-2">🔥 Capsules achetées</h2>
            <p className="text-center text-gray-500 text-sm mb-6">
                Capsules achetées individuellement ou débloquées via une expédition
            </p>

            {isLoading ? (
                <p className="text-center text-gray-500 py-10">Chargement...</p>
            ) : (
                <>
                    <div className='grid lg:grid-cols-3 sm:grid-cols-2 gap-3'>
                        {fullData.map((item) => (
                            <MyCapsuleCard key={item.capsuleId} item={item} />
                        ))}
                    </div>
                    {!fullData.length && (
                        <p className='text-center font-medium text-gray-500 my-10'>
                            Aucune capsule achetée pour le moment. Explorez un parcours ou découvrez les capsules disponibles.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchasedCapsules;
