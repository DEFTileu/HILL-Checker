'use client';

import { useRouter } from 'next/navigation';
import { ProfileScreen } from '@/components/hill/screens/Profile';
import { useAuth } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, changeName, selectSkin, resetAccount, logout } =
    useAuth();

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hill-bg text-hill-muted font-mono text-xs tracking-[0.18em]">
        LOADING…
      </div>
    );
  }

  return (
    <ProfileScreen
      profile={profile}
      onSignIn={() => router.push('/login')}
      onSignOut={() => {
        void logout();
      }}
      onResetAccount={() => {
        if (
          typeof window !== 'undefined' &&
          window.confirm('Reset wins, games, and skin? This cannot be undone.')
        ) {
          void resetAccount();
        }
      }}
      onSelectSkin={(skin) => {
        void selectSkin(skin);
      }}
      onChangeName={(name) => {
        void changeName(name);
      }}
    />
  );
}
