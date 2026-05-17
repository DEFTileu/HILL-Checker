'use client';
import { useRouter } from 'next/navigation';
import { Landing } from '@/components/hill/screens/Landing';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { profile } = useAuth();
  return (
    <Landing
      profile={profile}
      onCreateRoom={() => router.push('/r/new')}
      onPlayClassic={() => router.push('/play/classic')}
      onSignIn={() => router.push('/login')}
    />
  );
}
