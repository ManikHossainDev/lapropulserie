'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useDeleteMyAccountMutation } from '@/redux/fetures/profile/profile';

const DeleteAccountTab = () => {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteMyAccount, { isLoading }] = useDeleteMyAccountMutation();

  const handleDelete = async () => {
    try {
      await deleteMyAccount().unwrap();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Ton compte a été supprimé.');
      router.replace('/login');
    } catch (error) {
      toast.error(
        error?.data?.message ||
          'Impossible de supprimer le compte. Réessaie.',
      );
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 space-y-4 max-w-xl">
      <h2 className="text-lg font-semibold text-gray-800">Supprimer mon compte</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Cette action est définitive. Ton compte sera désactivé et tu ne pourras
        plus te connecter avec ces identifiants.
      </p>

      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
        >
          Supprimer mon compte
        </button>
      ) : (
        <div className="space-y-3 border border-red-200 bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-800 font-medium">
            Es-tu sûr(e) de vouloir supprimer ton compte ?
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-60"
            >
              {isLoading ? 'Suppression...' : 'Oui, supprimer'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setConfirmOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccountTab;
