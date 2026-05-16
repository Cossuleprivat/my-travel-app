export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-base">
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="aurora-blob aurora-blob-1"
          style={{
            top: '-10%',
            left: '-5%',
            width: '45vw',
            height: '45vw',
            background:
              'radial-gradient(circle at 30% 30%, #40a0d0, transparent 70%)',
          }}
        />
        <div
          className="aurora-blob aurora-blob-2"
          style={{
            bottom: '-15%',
            right: '-10%',
            width: '50vw',
            height: '50vw',
            background:
              'radial-gradient(circle at 70% 70%, #a060e0, transparent 70%)',
          }}
        />
        <div
          className="aurora-blob aurora-blob-3"
          style={{
            top: '30%',
            right: '15%',
            width: '35vw',
            height: '35vw',
            background:
              'radial-gradient(circle at 50% 50%, #d48030, transparent 70%)',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div className="auth-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(14,26,38,0.7) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
