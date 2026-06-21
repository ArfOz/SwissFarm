'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isTokenExpired } from '@/lib/auth';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoginPage = pathname === '/auth/login';

    // Redirect to login if token is missing or expired (and not already on login page)
    if (isTokenExpired(token) && !isLoginPage) {
      localStorage.removeItem('token'); // Clear expired token
      router.push('/auth/login');
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  // Don't render anything until we've checked auth
  if (!checked) return null;

  return <>{children}</>;
}
