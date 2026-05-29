'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

const App = dynamic(() => import('@/shared/components/App'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <App />
    </Suspense>
  );
}
