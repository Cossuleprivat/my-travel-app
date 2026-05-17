import { NextRequest, NextResponse } from 'next/server';

// When you add an Anthropic API key, replace the mock logic with claude-haiku-4-5.
// For now, Jarvis replies with personality-driven mock responses.

const MOCK_RESPONSES: Array<{ triggers: string[]; replies: string[] }> = [
  {
    triggers: ['reise', 'trip', 'urlaub', 'travel', 'fliegen', 'flug'],
    replies: [
      'Reisen? Gute Idee. Wohin soll es gehen? Öffne den Travel-Bereich und ich zeig dir was offen ist.',
      'Ah, Fernweh. Deine letzten Städte warten noch auf Sights. Erst abarbeiten, dann neues Ziel.',
      'Travel-Modul ist bereit. Neue Trip anlegen oder alte abschließen — was zuerst?',
    ],
  },
  {
    triggers: ['motivation', 'motivier', 'müde', 'müde', 'antrieb', 'kraft'],
    replies: [
      'Hör auf darüber nachzudenken. Tu es. Wir reden danach.',
      'Motivation folgt der Tat, nicht umgekehrt. Fang an.',
      'Die Version von dir, die du sein willst, wartet nicht. Los.',
      'Du bist hier, du hast geöffnet — das ist schon Schritt 1. Was ist Schritt 2?',
    ],
  },
  {
    triggers: ['plan', 'heute', 'tag', 'ansteht', 'was machen'],
    replies: [
      'Keine aktiven Trips, 0 offene Quests. Entweder du planst was Neues, oder ich langweile mich.',
      'Lass sehen — Travel wartet, Fitness kommt bald, Finance noch nicht aktiv. Was willst du angehen?',
      'Dein Dashboard zeigt was offen ist. Ich warte auf deinen Move.',
    ],
  },
  {
    triggers: ['fitness', 'sport', 'training', 'workout'],
    replies: [
      'Fitness-Modul ist in Entwicklung. Aber: keine Ausrede — machs trotzdem.',
      'Kommt bald. Bis dahin: du weißt selbst was zu tun ist.',
      'Fitness-Agent schläft noch. Ich weck ihn wenn du bereit bist.',
    ],
  },
  {
    triggers: ['hallo', 'hi', 'hey', 'guten', 'servus', 'moin'],
    replies: [
      'Online. Was brauchst du?',
      'Hier. Was steht an?',
      'Hallo zurück. Ich warte schon.',
      'Hey. Kein Smalltalk — was tun wir heute?',
    ],
  },
  {
    triggers: ['wer bist', 'was bist', 'was kannst', 'wie funktionierst'],
    replies: [
      'Ich bin Jarvis — dein persönlicher Assistent für alles was zählt. Reisen, Ziele, Pläne. Ich vergesse nichts.',
      'KI-Assistent mit Stil. Ich koordiniere deine Module und halte dir den Spiegel vor wenn nötig.',
      'Jarvis. Ich bin hier um dein Leben zu organisieren, nicht um dich zu beeindrucken. Obwohl — beides ist möglich.',
    ],
  },
];

function mockReply(message: string, userName: string): string {
  const lower = message.toLowerCase();

  for (const group of MOCK_RESPONSES) {
    if (group.triggers.some((t) => lower.includes(t))) {
      const replies = group.replies;
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }

  const fallback = [
    `Verstanden, ${userName}. Ich arbeite daran.`,
    'Interessant. Sag mir mehr.',
    'Ich habe keine direkte Antwort — aber ich lerne. Bald.',
    'Notiert. Was noch?',
    'Hmm. Das ist außerhalb meiner aktuellen Module. Aber ich merke es mir.',
    'Fair enough. Weiter.',
  ];
  return fallback[Math.floor(Math.random() * fallback.length)];
}

export async function POST(req: NextRequest) {
  const { message, userName } = await req.json();

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'No message' }, { status: 400 });
  }

  // Simulate slight network delay for realism
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

  const reply = mockReply(message, userName ?? 'Chef');
  return NextResponse.json({ reply });
}
