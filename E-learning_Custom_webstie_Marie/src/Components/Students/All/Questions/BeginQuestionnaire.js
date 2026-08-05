'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUBTITLE =
  'Réalise gratuitement ton bilan professionnel en seulement 15 minutes et obtiens une première analyse personnalisée de ta situation, ainsi que des pistes pour avancer sereinement.';

const BeginQuestionnaire = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleStart = () => {
    if (pending) return;
    setPending(true);
    router.push('/students/all-questions');
  };

  return (
    <div className="max-w-6xl mx-auto bg-white lg:p-10 p-5 text-center rounded-xl flex flex-col items-center">
      <div>
        <img
          className="max-w-14 mb-5"
          src="/Images/StudentsDash/question_setp_first.png"
          alt=""
        />
      </div>
      <h2 className="text-2xl font-semibold mb-3 text-primary">
        Ton bilan professionnel gratuit
      </h2>
      <p className="text-gray-500 max-w-3xl">{SUBTITLE}</p>

      <button
        type="button"
        onClick={handleStart}
        disabled={pending}
        className="px-10 py-4 rounded-lg customSignUpButton text-white mt-5 inline-flex items-center justify-center gap-2 min-w-[14rem] disabled:opacity-80 disabled:cursor-wait"
      >
        {pending && (
          <span
            className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-white/40 border-t-white animate-spin"
            aria-hidden
          />
        )}
        {pending ? 'Chargement...' : 'Commencer mon bilan gratuit'}
      </button>
    </div>
  );
};

export default BeginQuestionnaire;
