'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialize();
      initialized.current = true;
    }
  }, [initialize]);

  return <>{children}</>;
}
