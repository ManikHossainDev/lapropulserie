'use client';

import React from 'react';
import Link from 'next/link';
import RecommendationPanel from '@/Components/Students/Recommendations/RecommendationPanel';
import { useGetAllCapsulesCategoryQuery } from '@/redux/fetures/capsules/capsules';

export default function DiscoverIndexPage() {
  const { data, isLoading } = useGetAllCapsulesCategoryQuery();
  // sendResponse flattens paginateResults → data is the array
  const categories = Array.isArray(data?.data)
    ? data.data
    : data?.data?.results || [];
  const discoverCategories = categories.filter((cat) => {
    if (cat?.sellIndividually === false) return false;
    const title = (cat?.title || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    return !title.includes('apprendre a se connaitre');
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#2d2a71] mb-2">Découvrir les capsules</h1>
      <p className="text-gray-600 mb-6">Explorez les expériences d&apos;apprentissage La Propulserie.</p>
      {isLoading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {discoverCategories.map((cat) => {
            const id = cat.id || cat._id;
            return (
              <Link
                key={id}
                href={`/students/discover/${id}`}
                className="block border rounded-xl overflow-hidden bg-white shadow hover:shadow-md transition"
              >
                {cat.thumbnail && (
                  <img src={cat.thumbnail} alt="" className="h-36 w-full object-contain object-center bg-gray-50" />
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-[#2d2a71]">{cat.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{cat.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <RecommendationPanel context="discover" className="mt-8" />
    </div>
  );
}
