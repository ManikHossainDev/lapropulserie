'use client';

import Link from 'next/link';
import React from 'react';
import { useGetRecommendationsQuery } from '@/redux/fetures/capsuleJourney/capsuleJourney';

export default function RecommendationPanel({
  context = 'discover',
  capsuleId,
  journeyId,
  className = '',
}) {
  const { data, isLoading } = useGetRecommendationsQuery({
    context,
    capsuleId,
    journeyId,
  });

  const rec = data?.data;
  if (isLoading) {
    return (
      <div className={`rounded-2xl border bg-indigo-50/50 p-6 ${className}`}>
        <p className="text-sm text-gray-500">Chargement des suggestions...</p>
      </div>
    );
  }

  if (!rec) return null;

  const hasContent =
    rec.categories?.length > 0 ||
    rec.capsules?.length > 0 ||
    rec.journeys?.length > 0;

  if (!hasContent) return null;

  return (
    <div className={`rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 space-y-5 ${className}`}>
      <div>
        <h3 className="text-lg font-bold text-[#2d2a71]">✨ Poursuivre votre parcours</h3>
        <p className="text-sm text-gray-600 mt-1">{rec.message}</p>
        {rec.primaryTheme && (
          <p className="text-xs text-[#2d2a71] mt-2 font-medium">
            Thème détecté : {rec.primaryTheme}
          </p>
        )}
      </div>

      {rec.journeys?.length > 0 && (
        <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Parcours Exploration</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {rec.journeys.map((j) => {
              const id = j.id || j._id;
              return (
                <Link
                  key={id}
                  href={`/students/exploration-journey/${id}`}
                  className="block bg-white rounded-xl p-4 border hover:shadow-md transition"
                >
                  <p className="font-semibold text-[#2d2a71]">{j.title}</p>
                  {j.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{j.description}</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {rec.categories?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Catégories suggérées</h4>
          <div className="flex flex-wrap gap-2">
            {rec.categories.map((cat) => {
              const id = cat.id || cat._id;
              return (
                <Link
                  key={id}
                  href={`/students/discover/${id}`}
                  className="px-4 py-2 bg-white border rounded-full text-sm text-[#2d2a71] hover:bg-[#2d2a71] hover:text-white transition"
                >
                  {cat.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {rec.capsules?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Capsules suggérées</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {rec.capsules.map((cap) => {
              const id = cap.id || cap._id;
              const categoryId =
                cap.categoryId ||
                cap.capsuleCategoryId?._id ||
                cap.capsuleCategoryId;
              // Discover category page (purchase/lock UI); deep-link capsule when possible
              const href = categoryId
                ? `/students/discover/${categoryId}${id ? `?highlight=${id}` : ''}`
                : `/students/discover`;
              return (
                <Link
                  key={id}
                  href={href}
                  className="flex gap-3 bg-white rounded-xl p-3 border hover:shadow-md transition"
                >
                  {cap.thumbnail && (
                    <img
                      src={cap.thumbnail}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-[#2d2a71] truncate">{cap.title}</p>
                    {cap.categoryTitle && (
                      <p className="text-xs text-gray-500">{cap.categoryTitle}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <Link
        href="/students/discover"
        className="inline-block text-sm font-semibold text-[#2d2a71] hover:underline"
      >
        Voir tout le catalogue →
      </Link>
    </div>
  );
}
