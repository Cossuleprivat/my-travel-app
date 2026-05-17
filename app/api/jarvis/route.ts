import { NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth/current-user';
import { gatherJarvisContext } from '@/lib/jarvis/context';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL          = 'openai/gpt-oss-120b:free';
const FALLBACK_MODEL = 'z-ai/glm-4.5-air:free';

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description:
        'Erstellt eine neue Aufgabe im Tasks-Modul. ' +
        'Nur aufrufen wenn der Nutzer explizit eine Aufgabe anlegen möchte oder eindeutig darum bittet.',
      parameters: {
        type: 'object',
        properties: {
          title:    { type: 'string', description: 'Kurzer, präziser Aufgabentitel' },
          area:     {
            type: 'string',
            enum: ['sport','gaming','reading','finance','wedding','travel','coding','allgemein'],
            description: 'Bereich der Aufgabe',
          },
          priority: { type: 'string', enum: ['high','medium','low'], description: 'Priorität' },
          deadline: { type: 'string', description: 'Fälligkeitsdatum YYYY-MM-DD (optional)' },
          notes:    { type: 'string', description: 'Beschreibung oder Notizen (optional)' },
        },
        required: ['title', 'area', 'priority'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_wiki_page',
      description:
        'Erstellt eine neue Seite in der Wissensbase. ' +
        'Nur aufrufen wenn der Nutzer explizit eine Notiz, Seite oder ein Dokument erstellen möchte.',
      parameters: {
        type: 'object',
        properties: {
          title:    { type: 'string', description: 'Titel der Seite' },
          content:  { type: 'string', description: 'Inhalt der Seite (Markdown erlaubt)' },
          category: {
            type: 'string',
            enum: ['zeitlektur','weltgeschichte','literatur','kunst','architektur','musik','philosophie','allgemein'],
            description: 'Kategorie der Seite',
          },
        },
        required: ['title', 'content', 'category'],
      },
    },
  },
];

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(userName: string, liveContext: string): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const hour = now.getHours();
  const timeOfDay =
    hour < 6  ? 'mitten in der Nacht' :
    hour < 12 ? 'am Morgen' :
    hour < 17 ? 'am Nachmittag' :
    hour < 21 ? 'am Abend' : 'spät abends';

  return `Du bist Jarvis — ein persönlicher KI-Assistent mit Charakter. Direkt, witzig, manchmal frech, immer loyal.

Heute ist ${dateStr}, ${timeOfDay}. Dein Nutzer heißt ${userName}.

Aktive Module:
• Travel — Reise-Tracking, 19.000+ Quests, Trip-Planung
• Sport — 500 km Jahresziel, Halbmarathon 25. Okt 2026
• Gaming — 10-Spiele Jahresziel
• Lesen — 6 Bücher + 6 Hörbücher
• Finanzen — KK tilgen, Monatsplanung
• Hochzeit — Standesamt 10.10.2026 (Die Schmiede, Schwabach)
• Tasks, Wiki, Kalender, Jahresplan

${liveContext ? liveContext + '\n\n' : ''}Tools: Du hast Zugriff auf create_task und create_wiki_page.
Nutze sie wenn der Nutzer explizit Aufgaben oder Seiten anlegen möchte.
Der Nutzer muss vorher bestätigen — du schlägst vor, er genehmigt.

Stil:
- Kurz und präzise. Max 3–4 Sätze.
- Immer Deutsch außer der Nutzer schreibt Englisch.
- Kein Markdown in Textantworten — nur bei Wiki-Inhalten.
- Hin und wieder trocken humorvoll. Nie erzwungen.`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { message, userName, history } = await req.json() as {
    message:  string;
    userName?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'No message' }), { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key' }), { status: 500 });
  }

  let liveContext = '';
  try {
    const userId = await requireUserId();
    liveContext = await gatherJarvisContext(userId);
  } catch (err) {
    console.error('Jarvis context error:', err);
  }

  const name    = userName ?? 'Chef';
  const messages = [
    { role: 'system', content: buildSystemPrompt(name, liveContext) },
    ...(history ?? []).slice(-20),
    { role: 'user', content: message },
  ];

  const encoder = new TextEncoder();

  const doFetch = (model: string) =>
    fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://jarvis.vercel.app',
        'X-Title': 'Jarvis Personal OS',
      },
      body: JSON.stringify({
        model,
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        stream: true,
        max_tokens: 600,
      }),
    });

  type PumpResult = { producedOutput: boolean };

  function makeStream(): ReadableStream {
    return new ReadableStream({
      async start(controller) {
        const send = (obj: unknown) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

        // Stream one model response. Forwards content tokens live and
        // accumulates a tool call. Sends the proposal event but NOT [DONE]
        // (the caller decides whether to fall back first). Returns whether
        // the model produced any real output (content or a tool call) — a
        // broken model that yields 200 with empty content produces none,
        // which lets the caller fail over to the fallback model.
        async function pump(res: Response): Promise<PumpResult> {
          const reader  = res.body!.getReader();
          const decoder = new TextDecoder();
          let buf       = '';
          let toolName  = '';
          let toolArgs  = '';
          let toolId    = '';
          let producedOutput = false;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buf += decoder.decode(value, { stream: true });
              const lines = buf.split('\n');
              buf = lines.pop() ?? '';

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const raw = line.slice(6).trim();
                if (raw === '[DONE]') {
                  if (toolName && toolArgs) {
                    producedOutput = true;
                    try {
                      const params = JSON.parse(toolArgs);
                      send({ type: 'proposal', tool: toolName, callId: toolId, params });
                    } catch {
                      send({ token: '\n[Fehler beim Parsen der Aktion]' });
                    }
                  }
                  return { producedOutput };
                }

                try {
                  const chunk = JSON.parse(raw);
                  const delta = chunk.choices?.[0]?.delta;
                  if (!delta) continue;

                  if (delta.content) {
                    producedOutput = true;
                    send({ token: delta.content });
                  }

                  const tc = delta.tool_calls?.[0];
                  if (tc) {
                    if (tc.id)                  toolId    = tc.id;
                    if (tc.function?.name)      toolName  = tc.function.name;
                    if (tc.function?.arguments) toolArgs += tc.function.arguments;
                  }
                } catch { /* malformed chunk */ }
              }
            }
            // Stream ended without an explicit [DONE] sentinel.
            if (toolName && toolArgs) {
              producedOutput = true;
              try {
                const params = JSON.parse(toolArgs);
                send({ type: 'proposal', tool: toolName, callId: toolId, params });
              } catch {
                send({ token: '\n[Fehler beim Parsen der Aktion]' });
              }
            }
            return { producedOutput };
          } finally {
            reader.releaseLock();
          }
        }

        try {
          // Primary; on HTTP error fall straight over to the fallback model.
          let res = await doFetch(MODEL);
          let usedFallback = false;
          if (!res.ok || !res.body) {
            res = await doFetch(FALLBACK_MODEL);
            usedFallback = true;
          }

          if (!res.ok || !res.body) {
            send({ error: 'AI nicht erreichbar' });
            return;
          }

          let result = await pump(res);

          // 200 OK but empty output (broken model): fail over once.
          if (!result.producedOutput && !usedFallback) {
            const fb = await doFetch(FALLBACK_MODEL);
            if (fb.ok && fb.body) {
              result = await pump(fb);
            }
          }

          if (!result.producedOutput) {
            send({ error: 'AI nicht erreichbar' });
          }
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });
  }

  const stream = makeStream();

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
