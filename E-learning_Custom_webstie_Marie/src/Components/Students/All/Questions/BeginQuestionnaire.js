import Link from 'next/link';
import React from 'react';

const SUBTITLE =
  'Réalise gratuitement ton bilan professionnel en seulement 15 minutes et obtiens une première analyse personnalisée de ta situation, ainsi que des pistes pour avancer sereinement.';

const BeginQuestionnaire = () => {
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

      <Link
        href="/students/all-questions"
        className="px-10 py-4 rounded-lg customSignUpButton text-white mt-5"
      >
        Commencer mon bilan gratuit
      </Link>
    </div>
  );
};

export default BeginQuestionnaire;
