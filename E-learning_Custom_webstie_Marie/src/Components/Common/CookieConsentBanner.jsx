'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Version suffix: bumping it re-collects consent after a banner-text change
const STORAGE_KEY = 'lp_cookie_consent_v2';
const LEGACY_STORAGE_KEYS = ['lp_cookie_consent'];
const CONSENT_EVENT = 'lp-cookie-consent-open';
const CONSENT_MONTHS = 6;

export function openCookiePreferences() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** A stored choice is only valid for 6 months (cookie policy) and must be well-formed. */
function hasValidConsent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;

    const parsed = JSON.parse(saved);
    if (!parsed?.choice || !parsed?.savedAt) return false;

    const savedAt = new Date(parsed.savedAt);
    if (Number.isNaN(savedAt.getTime())) return false;

    const expiresAt = new Date(savedAt);
    expiresAt.setMonth(expiresAt.getMonth() + (parsed.expiresInMonths || CONSENT_MONTHS));
    return expiresAt.getTime() > Date.now();
  } catch {
    return false;
  }
}

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore storage errors
    }

    if (!hasValidConsent()) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      setVisible(true);
    }

    const open = () => setVisible(true);
    window.addEventListener(CONSENT_EVENT, open);

    // Allow re-opening the banner from any link/QA check: /?cookies=1
    try {
      if (new URLSearchParams(window.location.search).has('cookies')) setVisible(true);
    } catch {
      // ignore malformed URLs
    }

    return () => window.removeEventListener(CONSENT_EVENT, open);
  }, []);

  const saveChoice = (value) => {
    const payload = {
      choice: value,
      savedAt: new Date().toISOString(),
      expiresInMonths: CONSENT_MONTHS,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-6 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-indigo-100 bg-white/95 shadow-2xl backdrop-blur p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[#2d2a71]">Nous respectons votre vie privée</h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          Nous utilisons des cookies techniques nécessaires au fonctionnement du site, ainsi que des
          cookies optionnels (mesure d’audience, personnalisation) pour améliorer votre expérience.
          Vous pouvez accepter ou refuser les cookies non essentiels. Vos choix sont conservés pendant
          6 mois.{' '}
          <Link href="/legal/politique-des-cookies" className="text-[#2d2a71] underline font-medium">
            En savoir plus
          </Link>
        </p>
        <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => saveChoice('refused')}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => saveChoice('accepted')}
            className="px-4 py-2.5 rounded-xl bg-[#2d2a71] text-white text-sm font-medium hover:opacity-90"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
