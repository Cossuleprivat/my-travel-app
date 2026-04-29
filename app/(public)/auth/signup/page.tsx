import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 bg-bg-base">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-sans text-2xl text-text-primary">Create account</h1>
          <p className="mt-2 text-text-secondary text-sm">
            Start tracking your travels.
          </p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent-blue hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
