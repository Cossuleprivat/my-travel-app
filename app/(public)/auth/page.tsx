import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to Travel Scorer</h1>
          <p className="mt-2 text-slate-600">
            Create an account or log in to continue your journey.
          </p>
        </div>

        {/* DEV BYPASS BANNER — remove when real auth is implemented */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Dev mode:</strong> Auth is bypassed. Click Sign In to enter the app directly.
        </div>

        {/* AUTH BYPASS: Sign In goes directly to /dashboard */}
        <Link
          href="/dashboard"
          className="block w-full rounded-lg bg-slate-900 px-8 py-3 text-center font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
        >
          Sign In
        </Link>

        <p className="text-center text-sm text-slate-500">
          <Link href="/" className="hover:underline">
            Back to home
          </Link>
        </p>

        <p className="text-center text-xs text-slate-400">
          Real email/password auth — Sprint 2, T2.1
        </p>
      </div>
    </main>
  );
}
