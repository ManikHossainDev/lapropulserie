"use client";

import { useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import { ToastContainer } from "react-toastify";

/**
 * Renders client-only components (TopLoader + ToastContainer) only after mount.
 * Single mount guard prevents server/client DOM position mismatch during hydration.
 */
export default function ClientProviders() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <NextTopLoader
        color="#1d2a65"
        height={6}
        speed={800}
        showSpinner={false}
        easing="ease"
      />
      <ToastContainer />
    </>
  );
}
