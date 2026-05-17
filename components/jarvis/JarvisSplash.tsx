'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JarvisSplash() {
  const router = useRouter();
  const [phase, setPhase] = useState<'idle' | 'activating' | 'done'>('idle');
  const [typedText, setTypedText] = useState('');
  const fullGreeting = 'Bereit, wenn du es bist.';

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTypedText(fullGreeting.slice(0, i + 1));
      i++;
      if (i >= fullGreeting.length) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, []);

  function handleActivate() {
    if (phase !== 'idle') return;
    setPhase('activating');
    setTimeout(() => {
      setPhase('done');
      router.push('/dashboard');
    }, 1800);
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#060c14] select-none"
      style={{ cursor: phase === 'idle' ? 'pointer' : 'default' }}
      onClick={handleActivate}
    >
      {/* Animated grid lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(64,160,208,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(64,160,208,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow behind orb */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(64,160,208,0.12) 0%, transparent 70%)',
          transition: 'transform 1.8s ease, opacity 1.8s ease',
          transform: phase === 'activating' ? 'scale(2.5)' : 'scale(1)',
          opacity: phase === 'activating' ? 0 : 1,
        }}
      />

      {/* Corner decorations */}
      <CornerDecor position="top-left" />
      <CornerDecor position="top-right" />
      <CornerDecor position="bottom-left" />
      <CornerDecor position="bottom-right" />

      {/* Status line top */}
      <div className="absolute top-8 left-0 right-0 flex justify-between px-10">
        <span className="font-mono text-[10px] tracking-[0.3em] text-[#40a0d0]/40 uppercase">
          System v2.4.1
        </span>
        <span className="font-mono text-[10px] tracking-[0.3em] text-[#40a0d0]/40 uppercase">
          ● Online
        </span>
      </div>

      {/* Main orb — the click target */}
      <button
        type="button"
        aria-label="Jarvis aktivieren"
        onClick={(e) => { e.stopPropagation(); handleActivate(); }}
        className="group relative mb-12 focus:outline-none"
        disabled={phase !== 'idle'}
      >
        {/* Outer ring pulses */}
        {phase === 'idle' && (
          <>
            <span className="absolute inset-0 -m-8 rounded-full border border-[#40a0d0]/10 animate-[ping_3s_ease-out_infinite]" />
            <span className="absolute inset-0 -m-4 rounded-full border border-[#40a0d0]/15 animate-[ping_3s_ease-out_0.8s_infinite]" />
          </>
        )}

        {/* Orb shell */}
        <div
          className="relative flex h-44 w-44 items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle at 38% 35%, #1e4a6e 0%, #0a1f33 55%, #060c14 100%)',
            boxShadow: phase === 'activating'
              ? '0 0 120px 60px rgba(64,160,208,0.5), inset 0 0 40px rgba(64,160,208,0.3)'
              : '0 0 40px 10px rgba(64,160,208,0.15), inset 0 0 20px rgba(64,160,208,0.08)',
            border: '1px solid rgba(64,160,208,0.25)',
            transition: 'box-shadow 1.8s ease',
          }}
        >
          {/* Inner hexagon icon */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <polygon
              points="32,4 56,18 56,46 32,60 8,46 8,18"
              stroke="rgba(64,160,208,0.6)"
              strokeWidth="1.5"
              fill="none"
            />
            <polygon
              points="32,14 48,23 48,41 32,50 16,41 16,23"
              stroke="rgba(64,160,208,0.3)"
              strokeWidth="1"
              fill="rgba(64,160,208,0.05)"
            />
            <text
              x="32"
              y="37"
              textAnchor="middle"
              fill="rgba(64,160,208,0.9)"
              fontSize="16"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
              letterSpacing="2"
            >
              J
            </text>
          </svg>

          {/* Scan line animation */}
          {phase === 'idle' && (
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
            >
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#40a0d0]/40 to-transparent"
                style={{ animation: 'scanline 4s ease-in-out infinite', top: '50%' }}
              />
            </div>
          )}
        </div>

        {/* Click hint */}
        {phase === 'idle' && (
          <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.25em] text-[#40a0d0]/40 uppercase animate-pulse">
            Antippen um zu starten
          </p>
        )}

        {phase === 'activating' && (
          <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] tracking-[0.25em] text-[#40a0d0]/70 uppercase">
            Initialisiere...
          </p>
        )}
      </button>

      {/* Title */}
      <div className="text-center">
        <h1
          className="font-mono text-5xl font-bold tracking-[0.5em] uppercase"
          style={{
            color: '#e0eef8',
            textShadow: '0 0 30px rgba(64,160,208,0.3)',
            transition: 'opacity 1.5s',
            opacity: phase === 'activating' ? 0 : 1,
          }}
        >
          JARVIS
        </h1>
        <p
          className="mt-3 font-mono text-sm tracking-widest"
          style={{ color: 'rgba(64,160,208,0.5)', minHeight: '1.5em' }}
        >
          {typedText}
          <span className="animate-pulse">_</span>
        </p>
      </div>

      {/* Bottom status bar */}
      <div
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6 px-10"
        style={{ opacity: phase === 'activating' ? 0 : 1, transition: 'opacity 1s' }}
      >
        <StatusDot label="Travel" />
        <StatusDot label="Fitness" dim />
        <StatusDot label="Finance" dim />
        <StatusDot label="Goals" dim />
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 10%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function CornerDecor({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const cls = [
    'absolute w-10 h-10 pointer-events-none',
    position === 'top-left'     ? 'top-6 left-6 border-t border-l'     : '',
    position === 'top-right'    ? 'top-6 right-6 border-t border-r'    : '',
    position === 'bottom-left'  ? 'bottom-6 left-6 border-b border-l'  : '',
    position === 'bottom-right' ? 'bottom-6 right-6 border-b border-r' : '',
  ].join(' ');
  return <div className={cls} style={{ borderColor: 'rgba(64,160,208,0.2)' }} />;
}

function StatusDot({ label, dim }: { label: string; dim?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: dim ? 'rgba(64,160,208,0.2)' : 'rgba(64,160,208,0.7)' }}
      />
      <span
        className="font-mono text-[9px] tracking-[0.2em] uppercase"
        style={{ color: dim ? 'rgba(64,160,208,0.2)' : 'rgba(64,160,208,0.5)' }}
      >
        {label}
      </span>
    </div>
  );
}
