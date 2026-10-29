'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '../../constants/routes';

// ------------------------------ Registration Redirect Content ------------------------------
function RegisterRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get('ref');
    const targetUrl = ref ? `${ROUTES.LOGIN}?mode=register&ref=${encodeURIComponent(ref)}` : `${ROUTES.LOGIN}?mode=register`;
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="h-screen w-screen bg-[#020B1E] flex items-center justify-center text-white text-xs select-none">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
        <span>Loading TierFlow Registration...</span>
      </div>
    </div>
  );
}

// ------------------------------ Exported Page with Suspense ------------------------------
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#020B1E] flex items-center justify-center text-white text-xs">
          Loading...
        </div>
      }
    >
      <RegisterRedirectContent />
    </Suspense>
  );
}
