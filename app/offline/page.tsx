export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-6">✈</div>
      <h1 className="font-sans text-2xl text-text-primary mb-2">You're offline</h1>
      <p className="text-text-muted text-sm max-w-xs">
        No connection detected. Your trips and progress are saved — check back when you're online.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-5 py-2.5 rounded-xl bg-accent-blue text-white text-sm font-medium"
      >
        Try again
      </button>
    </div>
  );
}
