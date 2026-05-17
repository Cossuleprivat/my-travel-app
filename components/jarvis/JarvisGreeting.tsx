'use client';

import { useEffect, useState } from 'react';

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6)  return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

const GREETINGS: Record<string, string[]> = {
  morning: [
    'Guten Morgen. Kaffee läuft, ich auch.',
    'Morgen. Was steht heute an?',
    'Die Welt schläft noch. Wir nicht.',
    'Morgen. Lass uns was erreichen heute.',
  ],
  afternoon: [
    'Nachmittag. Wie läuft es?',
    'Der Tag ist noch nicht vorbei.',
    'Halbzeit. Was fehlt noch?',
    'Afternoon, Chef. Alles im Griff?',
  ],
  evening: [
    'Guten Abend. Produktiver Tag?',
    'Der Tag neigt sich. Was hast du erledigt?',
    'Evening. Zeit für eine Runde Refl.',
    'Fast geschafft. Was noch?',
  ],
  night: [
    'Noch wach? Ich auch — immer.',
    'Nachtschicht? Respekt.',
    'Die besten Ideen kommen nachts.',
    'Spät noch hier. Alles ok?',
  ],
};

export function JarvisGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const tod = getTimeOfDay();
    const options = GREETINGS[tod];
    setGreeting(options[Math.floor(Math.random() * options.length)]);
  }, []);

  return (
    <div className="space-y-0.5">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#40a0d0]/50">
        Jarvis spricht
      </p>
      <p className="font-sans text-lg text-text-primary leading-snug">
        {greeting || '...'}
      </p>
      <p className="font-mono text-xs text-text-muted">
        Hey {name}. Was machen wir?
      </p>
    </div>
  );
}
