export function AppBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Base sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #010406 0%, #030c13 22%, #050e18 55%, #07111b 80%, #09141e 100%)',
        }}
      />

      {/* Nebula / atmospheric color bleed */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 70% 35% at 72% 12%, rgba(90,30,170,0.08) 0%, transparent 100%)',
            'radial-gradient(ellipse 55% 28% at 18% 22%, rgba(25,75,165,0.07) 0%, transparent 100%)',
            'radial-gradient(ellipse 40% 20% at 50% 5%,  rgba(40,100,200,0.05) 0%, transparent 100%)',
          ].join(', '),
        }}
      />

      {/* Stars — tiled large/bright (tile repeats across viewport) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(2px 2px at 18px  22px, rgba(255,255,255,0.95) 0%, transparent 100%)',
            'radial-gradient(1px 1px at 52px   8px, rgba(200,220,255,0.8)  0%, transparent 100%)',
            'radial-gradient(2px 2px at 88px  35px, rgba(255,255,255,0.9)  0%, transparent 100%)',
            'radial-gradient(1px 1px at 32px  55px, rgba(210,230,255,0.7)  0%, transparent 100%)',
            'radial-gradient(2px 2px at 72px  68px, rgba(255,255,255,0.85) 0%, transparent 100%)',
          ].join(', '),
          backgroundSize: '110px 90px',
          maskImage: 'linear-gradient(180deg, black 0%, black 50%, transparent 80%)',
          WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 50%, transparent 80%)',
        }}
      />

      {/* Stars — tiled small/dim (denser fill) */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: [
            'radial-gradient(1.5px 1.5px at 12px  30px, rgba(200,220,255,0.7) 0%, transparent 100%)',
            'radial-gradient(1px   1px   at 48px   5px, rgba(255,255,255,0.5) 0%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 76px  18px, rgba(200,230,255,0.6) 0%, transparent 100%)',
            'radial-gradient(1px   1px   at 28px  50px, rgba(255,255,255,0.4) 0%, transparent 100%)',
            'radial-gradient(1.5px 1.5px at 62px  40px, rgba(210,225,255,0.5) 0%, transparent 100%)',
            'radial-gradient(1px   1px   at  8px  65px, rgba(255,255,255,0.35) 0%, transparent 100%)',
          ].join(', '),
          backgroundSize: '90px 75px',
          maskImage: 'linear-gradient(180deg, black 0%, black 45%, transparent 75%)',
          WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 45%, transparent 75%)',
        }}
      />

      {/* Far mountains — pixel-stepped silhouette */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '110px' }}
      >
        <path
          d="M0,110 L0,76 L40,76 L40,60 L80,60 L80,48 L120,48 L120,60
             L160,60 L160,44 L200,44 L200,30 L240,30 L240,44 L280,44
             L280,32 L320,32 L320,48 L360,48 L360,28 L400,28 L400,14
             L440,14 L440,30 L480,30 L480,18 L520,18 L520,34 L560,34
             L560,48 L600,48 L600,32 L640,32 L640,46 L680,46 L680,28
             L720,28 L720,14 L760,14 L760,30 L800,30 L800,46 L840,46
             L840,34 L880,34 L880,20 L920,20 L920,38 L960,38 L960,54
             L1000,54 L1000,38 L1040,38 L1040,22 L1080,22 L1080,36
             L1120,36 L1120,50 L1160,50 L1160,62 L1200,62 L1200,50
             L1240,50 L1240,64 L1280,64 L1280,76 L1320,76 L1320,64
             L1360,64 L1360,76 L1400,76 L1400,88 L1440,88 L1440,110 Z"
          fill="#05101a"
          opacity="0.92"
        />
      </svg>

      {/* Near hills — second layer, darker */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '72px' }}
      >
        <path
          d="M0,72 L0,52 L80,52 L80,40 L160,40 L160,52 L240,52
             L240,38 L320,38 L320,50 L400,50 L400,36 L480,36 L480,48
             L560,48 L560,60 L640,60 L640,48 L720,48 L720,36 L800,36
             L800,48 L880,48 L880,60 L960,60 L960,48 L1040,48 L1040,60
             L1120,60 L1120,50 L1200,50 L1200,62 L1280,62 L1280,52
             L1360,52 L1360,64 L1440,64 L1440,72 Z"
          fill="#07121e"
          opacity="0.97"
        />
      </svg>

      {/* Ground strip */}
      <div
        className="absolute bottom-0 inset-x-0 h-5"
        style={{ background: 'linear-gradient(180deg, #07121e 0%, #030a12 100%)' }}
      />

      {/* Subtle pixel dot grid overlay */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(64,160,208,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* CRT scanlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.022) 3px, rgba(0,0,0,0.022) 4px)',
        }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, rgba(2,7,14,0.65) 100%)',
        }}
      />
    </div>
  );
}
