import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthBackground } from '@/components/auth/AuthBackground';

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ redirect?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm space-y-8 animate-fade-up">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue/15 ring-1 ring-accent-blue/30 backdrop-blur-sm">
              <span className="font-mono text-xl font-bold text-accent-blue">LO</span>
            </div>
            <h1 className="font-sans text-3xl text-text-primary">LiveOS</h1>
            <p className="mt-2 text-text-secondary text-sm">
              Dein persönliches Life-Betriebssystem.
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle/80 bg-bg-surface/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <LoginForm redirectTo={sp.redirect ?? '/hub'} />
          </div>

          <p className="text-center text-sm text-text-muted">
            Noch keinen Account?{' '}
            <Link href="/auth/signup" className="text-accent-blue hover:underline">
              Account erstellen
            </Link>
          </p>
        </div>
      </main>
    </AuthBackground>
  );
}
