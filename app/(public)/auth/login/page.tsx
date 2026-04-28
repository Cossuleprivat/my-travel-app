import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ redirect?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 bg-bg-base">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-sans text-2xl text-text-primary">Welcome back</h1>
          <p className="mt-2 text-text-secondary text-sm">
            Sign in to continue your journey.
          </p>
        </div>

        <LoginForm redirectTo={sp.redirect ?? '/dashboard'} />

        <p className="text-center text-sm text-text-muted">
          New here?{' '}
          <Link href="/auth/signup" className="text-accent-blue hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
