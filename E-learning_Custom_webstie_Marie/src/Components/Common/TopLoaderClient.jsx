"use client";

import { useEffect, useState } from "react";
import NextTopLoader from "nextjs-toploader";

export default function TopLoaderClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <NextTopLoader
      color="#1d2a65"
      height={6}
      speed={800}
      showSpinner={false}
      easing="ease"
    />
  );
}
