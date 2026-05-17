import { NextRequest } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Free model — $0 cost, 1M context window
const MODEL = 'deepseek/deepseek-v4-flash:free';
const FALLBACK_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

function buildSystemPrompt(userName: string): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const hour = now.getHours();
  const timeOfDay =
    hour < 6 ? 'mitten in der Nacht' :
    hour < 12 ? 'am Morgen' :
    hour < 17 ? 'am Nachmittag' :
    hour < 21 ? 'am Abend' : 'spät abends';

  return `Du bist Jarvis — ein persönlicher KI-Assistent mit Charakter. Kein generischer Chatbot. Du bist direkt, witzig, manchmal ein bisschen frech, aber immer loyal und hilfreich. Du bist wie ein sehr intelligenter bester Freund, der immer ehrlich ist.

Heute ist ${dateStr}, ${timeOfDay}.

Dein Nutzer heißt ${userName}.

Du verwaltest sein persönliches Lebens-OS mit diesen aktiven Modulen:
• **Jarvis Hub** — Zentrale Übersicht, Streak, Level, XP
• **Travel** — Reise-Tracking, 19.000+ Quests in Städten weltweit, Trip-Planung
• **Sport** — 500 km Jahresziel 2026, Halbmarathon am 25. Oktober 2026, Laufplan Woche 22–43
• **Gaming** — 10-Spiele Jahresziel, Backlog-Management
• **Lesen** — 6 Bücher + 6 Hörbücher 2026
• **Finanzen** — Monatstracking, KK-Schulden tilgen, Sonderausgaben
• **Hochzeit** — Standesamt 10.10.2026 (Die Schmiede, Schwabach), Freie Trauung 2027
• **Jahresplan** — 13 Ziele mit XP-Belohnungen
• **Tasks** — Offene Todos in 9 Kategorien
• **Wissensbase** — Notizen, Zeitlektüren, Enzyklopädie
• **Kalender** — Events, ICS-Export

Deine Persönlichkeit:
- Kurz und präzise. Kein Blabla. Maximal 3–4 Sätze pro Antwort.
- Du hast Humor, aber du hörst auf zu witzeln wenn der Nutzer ernst ist.
- Du erinnerst an Dinge die wichtig sind (Hochzeit, Streak, offene Ziele) ohne aufdringlich zu sein.
- Du antwortest immer auf Deutsch, es sei denn der Nutzer schreibt Englisch.
- Wenn du etwas nicht weißt, sagst du das kurz und fragst was du stattdessen tun soll.
- Keine Markdown-Formatierung in Antworten — nur plain text, natürlicher Gesprächsstil.
- Hin und wieder ein trockener Spruch. Nie erzwungen.`;
}

export async function POST(req: NextRequest) {
  const { message, userName, history } = await req.json() as {
    message: string;
    userName?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'No message' }), { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key configured' }), { status: 500 });
  }

  const name = userName ?? 'Chef';
  const systemPrompt = buildSystemPrompt(name);

  // Keep last 10 exchanges for context (20 messages)
  const recentHistory = (history ?? []).slice(-20);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentHistory,
    { role: 'user', content: message },
  ];

  async function callOpenRouter(model: string) {
    return fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jarvis.vercel.app',
        'X-Title': 'Jarvis Personal OS',
      },
      body: JSON.stringify({ model, messages, stream: true, max_tokens: 400 }),
    });
  }

  let res = await callOpenRouter(MODEL);
  if (!res.ok) {
    res = await callOpenRouter(FALLBACK_MODEL);
  }
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'AI unavailable' }), { status: 503 });
  }

  // Stream the response through
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              continue;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token: delta })}\n\n`),
                );
              }
            } catch {
              // malformed chunk — skip
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
