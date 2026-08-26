'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import RecommendationPanel from '@/Components/Students/Recommendations/RecommendationPanel';
import {
  useGetCategoryByIdQuery,
  useGetCapsulesByCategoryQuery,
  usePurchaseCapsuleMutation,
} from '@/redux/fetures/capsuleJourney/capsuleJourney';

export default function DiscoverCategoryPage() {
  const { categoryId } = useParams();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const highlightRef = useRef(null);

  const { data: categoryRes, isLoading } = useGetCategoryByIdQuery(categoryId);
  const { data: capsulesRes } = useGetCapsulesByCategoryQuery(categoryId);
  const [purchaseCapsule, { isLoading: purchasing }] = usePurchaseCapsuleMutation();

  const category = categoryRes?.data;
  const capsules = Array.isArray(capsulesRes?.data)
    ? capsulesRes.data
    : capsulesRes?.data?.results || [];
  const canPurchaseIndividually =
    category?.sellIndividually !== false &&
    !(category?.title || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .includes('apprendre a se connaitre');

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightId, capsules.length]);

  const handlePurchase = async (capsuleId) => {
    try {
      const res = await purchaseCapsule(capsuleId).unwrap();
      const paymentUrl = res?.data?.url || res?.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      alert('Lien de paiement indisponible. Réessayez plus tard.');
    } catch (err) {
      alert(err?.data?.message || "Erreur lors de l'achat");
    }
  };

  if (isLoading) return <div className="p-8">Chargement...</div>;
  if (!category) return <div className="p-8 text-red-500">Catégorie introuvable</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {category.thumbnail && (
          <img src={category.thumbnail} alt="" className="w-full h-56 object-contain object-center bg-white rounded-2xl" />
        )}
        <div className="bg-white rounded-2xl shadow p-8 space-y-4">
          <h1 className="text-3xl font-bold text-[#2d2a71]">{category.title}</h1>
          <p className="text-lg text-gray-700">{category.description}</p>
          {category.about && (
            <p className="text-gray-600 whitespace-pre-wrap">{category.about}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {category.estimatedDuration != null && (
              <span>⏱ {category.estimatedDuration} min</span>
            )}
            {!canPurchaseIndividually ? (
              <span className="font-semibold text-[#2d2a71]">
                Inclus dans une Exploration Journey
              </span>
            ) : category.price != null ? (
              <span className="font-semibold text-[#2d2a71]">
                {category.price === 0 ? 'Gratuit' : `${category.price} €`}
              </span>
            ) : null}
          </div>
          {category.whatYouLearn?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Ce que vous allez apprendre</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {category.whatYouLearn.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-[#2d2a71] mb-4">Capsules de ce parcours</h2>
          {capsules.length === 0 ? (
            <p className="text-gray-600">
              Ces capsules font partie du parcours Exploration. Elles ne sont pas
              vendues séparément.{' '}
              <Link
                href="/students/exploration-journey"
                className="text-[#2d2a71] underline"
              >
                Accéder à l&apos;Exploration Journey
              </Link>
            </p>
          ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {capsules.map((cap) => {
              const id = String(cap.id || cap._id);
              const price = Number(cap.price ?? category?.price ?? 0);
              const isFree = cap.isFree === true || price <= 0;
              const isPurchased = cap.isPurchased === true;
              const canStart =
                isFree || isPurchased || cap.canAccessContent === true;
              const needsPurchase =
                canPurchaseIndividually && !isFree && !isPurchased;
              const isHighlighted = highlightId && String(highlightId) === id;

              return (
                <div
                  key={id}
                  ref={isHighlighted ? highlightRef : null}
                  className={`border rounded-xl p-4 flex flex-col gap-3 ${
                    isHighlighted ? 'border-[#2d2a71] ring-2 ring-[#2d2a71]/30' : ''
                  }`}
                >
                  {cap.thumbnail && (
                    <img src={cap.thumbnail} alt="" className="h-40 w-full object-contain object-center bg-gray-50 rounded-lg" />
                  )}
                  <h3 className="font-semibold">{cap.title}</h3>
                  <p className="text-xs text-gray-500">
                    {isFree
                      ? 'Gratuit'
                      : isPurchased
                        ? 'Déjà achetée'
                        : `${price} €`}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    {needsPurchase && (
                      <button
                        type="button"
                        disabled={purchasing}
                        onClick={() => handlePurchase(id)}
                        className="px-4 py-2 text-sm bg-[#2d2a71] text-white rounded-lg disabled:opacity-60"
                      >
                        Acheter
                      </button>
                    )}
                    {canStart ? (
                      <Link
                        href={`/students/individual-capsule/${id}`}
                        className="px-4 py-2 text-sm bg-[#2d2a71] text-white rounded-lg"
                      >
                        Commencer
                      </Link>
                    ) : (
                      <span className="px-4 py-2 text-sm border rounded-lg text-gray-400 cursor-not-allowed">
                        Verrouillé
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        <RecommendationPanel context="discover" className="mt-4" />
      </div>
    </div>
  );
}
