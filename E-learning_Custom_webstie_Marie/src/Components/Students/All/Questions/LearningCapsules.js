'use client';

import Capsules from '@/Components/Cards/Capsules';
import CategoryCarosal from '@/Components/Cards/CategoryCarosal';
import {
    useGetAllCapsulesbyIdQuery,
    useGetAllCapsulesCategoryQuery,
} from '@/redux/fetures/capsules/capsules';
import React, { useEffect, useState } from 'react';

const LearningCapsules = () => {
    const { data: categoriesRes, isLoading: categoriesLoading } = useGetAllCapsulesCategoryQuery();
    // sendResponse flattens paginateResults → data is the array
    const categories = Array.isArray(categoriesRes?.data)
        ? categoriesRes.data
        : categoriesRes?.data?.results || [];

    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    useEffect(() => {
        if (!categories.length) return;
        const firstId = categories[0].id || categories[0]._id;
        setSelectedCategoryId((current) => current || firstId);
    }, [categories]);

    const { data: capsulesRes, isLoading: capsulesLoading } = useGetAllCapsulesbyIdQuery(
        { categoryId: selectedCategoryId },
        { skip: !selectedCategoryId },
    );

    const capsules = Array.isArray(capsulesRes?.data)
        ? capsulesRes.data
        : capsulesRes?.data?.results || [];

    return (
        <div className="bg-white max-w-6xl mx-auto rounded-2xl lg:p-10 p-5 mt-10">
            <h2 className="text-4xl lg:text-5xl text-center font-semibold text-primary">
                Explorez nos capsules
            </h2>

            {categoriesLoading ? (
                <p className="text-center py-5 text-gray-500">Chargement...</p>
            ) : (
                <CategoryCarosal
                    categories={categories}
                    selectedId={selectedCategoryId}
                    onSelect={setSelectedCategoryId}
                />
            )}

            <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-3">
                {capsulesLoading && (
                    <p className="col-span-full text-center text-gray-500 py-6">Chargement des capsules...</p>
                )}
                {!capsulesLoading && capsules.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-6">
                        Aucune capsule dans cette catégorie.
                    </p>
                )}
                {capsules.map((item) => (
                    <Capsules key={item.id || item._id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default LearningCapsules;
