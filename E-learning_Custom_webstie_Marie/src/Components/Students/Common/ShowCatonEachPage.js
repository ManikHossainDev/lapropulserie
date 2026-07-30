'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const LUNA_AVATAR = '/Images/StudentsDash/explorationJourney_cartoon.png';

const ShowCatonEachPage = () => {
  const [isShow, setIsShow] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenCartoon_v2');
    if (!hasSeen) setIsShow(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        hideCartoon();
      }
    };
    if (isShow) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShow]);

  const hideCartoon = () => {
    setIsShow(false);
    localStorage.setItem('hasSeenCartoon_v2', 'true');
  };

  if (!isShow) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-end">
      <div
        ref={wrapperRef}
        className="relative w-full max-w-xl m-4 mb-6 flex items-end gap-3"
      >
        <img
          src={LUNA_AVATAR}
          alt="Luna"
          className="w-28 sm:w-36 object-contain drop-shadow-lg shrink-0"
        />
        <div className="relative bg-white rounded-2xl shadow-xl p-4 sm:p-5 mb-8 max-w-sm">
          <div className="absolute -left-2 bottom-10 w-4 h-4 bg-white rotate-45" />
          <p className="text-[#2d2a71] font-bold text-lg mb-2">
            Bienvenue, je suis Luna ✨
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            Je suis là pour t&apos;aider à faire le point, avancer pas à pas, et
            explorer ce qui compte vraiment pour toi.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/students/all-questions"
              onClick={hideCartoon}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#2d2a71] text-white text-sm font-semibold"
            >
              C&apos;est parti !
            </Link>
            <button
              type="button"
              onClick={hideCartoon}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowCatonEachPage;
