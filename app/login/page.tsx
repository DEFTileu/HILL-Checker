'use client';

import { useRouter } from 'next/navigation';
import { SignIn } from '@/components/hill/screens/SignIn';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { linkGoogle } = useAuth();

  return (
    <SignIn
      onContinueGoogle={() => {
        // Upgrades the current anonymous user → Google (same user_id).
        // Triggers an OAuth redirect; the session is picked up on return.
        void linkGoogle();
      }}
      onDismiss={() => router.push('/')}
    />
  );
}
