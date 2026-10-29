'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import { LoadingState } from '../components/common/LoadingState';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push(ROUTES.DASHBOARD);
      } else {
        router.push(ROUTES.LOGIN);
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <LoadingState message="Loading TierFlow..." />
    </div>
  );
}
