export const startMentorSessionCheckout = async (bookMentor, mentorId) => {
  if (!mentorId) {
    throw new Error('Mentor introuvable.');
  }

  const res = await bookMentor({ mentorId });
  if (res?.error) {
    const message =
      res.error?.data?.message ||
      'Impossible de réserver ce mentor. Réessayez plus tard.';
    throw new Error(message);
  }

  if (res?.data?.code !== 200) {
    throw new Error(
      res?.data?.message ||
        'Impossible de réserver ce mentor. Réessayez plus tard.',
    );
  }

  const checkoutUrl = res?.data?.data?.url || res?.data?.data?.paymentUrl;
  if (!checkoutUrl) {
    throw new Error('Lien de paiement introuvable.');
  }

  window.location.href = checkoutUrl;
};
