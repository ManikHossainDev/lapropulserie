'use client';

import { usePurchasedCapsuleMutation } from '@/redux/fetures/capsules/capsules';
import Link from 'next/link';
import React, { useState } from 'react';
import { HiStar } from 'react-icons/hi2';
import { toast } from 'react-toastify';

const Capsules = ({ item }) => {
  const [purchaseCapsule, { isLoading }] = usePurchasedCapsuleMutation();
  const [pending, setPending] = useState(false);

  const id = item?.id || item?._id || item?.capsuleId;
  const price = Number(item?.price ?? 0);
  const isFree = item?.isFree === true || price <= 0;
  const isPurchased = item?.isPurchased === true;
  const canStart = Boolean(id) && (isFree || isPurchased || item?.canAccessContent === true);
  const needsPurchase = Boolean(id) && !isFree && !isPurchased;
  // Marketing demo cards (no real id) — don't start a broken checkout
  const isDemoCard = !id;

  const handlePurchase = async () => {
    if (!id || pending || isLoading) return;
    setPending(true);
    try {
      const res = await purchaseCapsule(id).unwrap();
      const paymentUrl = res?.data?.url || res?.data?.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      toast.error('Lien de paiement indisponible. Réessayez plus tard.');
    } catch (error) {
      toast.error(
        error?.data?.message || "Impossible de démarrer l'achat. Réessayez plus tard.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="border rounded-xl h-full flex flex-col">
      {item?.thumbnail && (
        <img
          className="rounded-t-xl h-60 object-contain object-center w-full bg-gray-100"
          src={item.thumbnail}
          alt=""
        />
      )}

      <div className="p-5 flex flex-col justify-between flex-1 gap-3">
        <div>
          {(item?.avgRating != null || item?.totalReviewCount != null) && (
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <HiStar className="text-orange-500 text-xl" />
              {item?.avgRating ?? '—'} ({item?.totalReviewCount ?? 0})
            </span>
          )}

          <h1 className="my-3 text-2xl font-semibold text-primary">{item?.title}</h1>

          {item?.description && (
            <p className="text-gray-500 text-sm line-clamp-3">{item.description}</p>
          )}

          <p className="text-sm text-gray-500 mt-2">
            {isFree ? 'Gratuit' : isPurchased ? 'Déjà achetée' : `${price} €`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t">
          {isDemoCard ? (
            <Link
              href="/signup?role=student"
              className="px-4 py-2 text-sm bg-[#2d2a71] text-white rounded-lg"
            >
              Créer un compte
            </Link>
          ) : (
            <>
              {needsPurchase && (
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={pending || isLoading}
                  className="px-4 py-2 text-sm bg-[#2d2a71] text-white rounded-lg disabled:opacity-60"
                >
                  {pending || isLoading ? 'Chargement...' : 'Acheter'}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Capsules;
