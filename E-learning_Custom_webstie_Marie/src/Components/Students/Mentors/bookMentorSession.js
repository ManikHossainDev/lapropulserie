/**
 * #17 — Free intro: open mentor Calendly. No Stripe / platform payment.
 */
export function openMentorFreeIntro(calendlyProfileLink) {
  const url =
    typeof calendlyProfileLink === 'string' ? calendlyProfileLink.trim() : '';

  if (!url) {
    throw new Error(
      'Lien Calendly indisponible pour ce mentor. Ouvre le profil ou réessaie plus tard.',
    );
  }

  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Lien Calendly invalide.');
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Back-compat wrapper. Prefer openMentorFreeIntro(link).
 * 2nd arg must be a Calendly URL or an object with calendlyProfileLink
 * (not a bare mentorId — that cannot resolve the link).
 */
export async function startMentorSessionCheckout(_bookMentor, calendlyOrMentor) {
  if (typeof calendlyOrMentor === 'string') {
    if (/^[a-f\d]{24}$/i.test(calendlyOrMentor.trim())) {
      throw new Error(
        'Lien Calendly manquant. Ouvre le profil du mentor pour réserver la découverte offerte.',
      );
    }
    openMentorFreeIntro(calendlyOrMentor);
    return;
  }

  openMentorFreeIntro(
    calendlyOrMentor?.calendlyProfileLink || calendlyOrMentor?.calendlyLink,
  );
}
