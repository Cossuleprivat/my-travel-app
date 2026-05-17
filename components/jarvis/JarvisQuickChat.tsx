'use client';

import { useState, useRef, useCallback } from 'react';

type Message = { role: 'user' | 'jarvis'; text: string };

const CHIPS = ['Was steht an?', 'Motivier mich', 'Sport-Status'];

export function JarvisQuickChat({ userName }: { userName: string }) {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput('');

    const history = messages.map((m) => ({
      role: m.role === 'jarvis' ? 'assistant' as const : 'user' as const,
      content: m.text,
    }));

    setMessages((prev) => [...prev, { role: 'user', text: msg }, { role: 'jarvis', text: '' }]);
    setStreaming(true);

    try {
      const res = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userName, history }),
      });

      if (!res.ok || !res.body) throw new Error('failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const { token } = JSON.parse(data);
            if (token) {
              acc += token;
              const snap = acc;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: 'jarvis', text: snap };
                return next;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'jarvis', text: 'Fehler. Nochmal?' };
        return next;
      });
    } finally {
      setStreaming(false);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [input, streaming, messages, userName]);

  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
        <div className="h-1.5 w-1.5 rounded-full bg-[#40a0d0] animate-pulse" />
        <span className="font-mono text-xs tracking-widest uppercase text-text-muted">Jarvis</span>
      </div>

      {messages.length > 0 && (
        <div className="max-h-52 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'jarvis' && (
                <div className="h-6 w-6 shrink-0 rounded-full bg-[#0a1f33] border border-[#40a0d0]/30 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-[#40a0d0]">J</span>
                </div>
              )}
              <div className={[
                'max-w-[75%] rounded-xl px-3 py-2 text-sm leading-snug min-h-[2rem]',
                m.role === 'user'
                  ? 'bg-[#40a0d0]/15 text-text-primary rounded-br-none'
                  : 'bg-bg-elevated text-text-secondary rounded-bl-none border border-border-subtle',
              ].join(' ')}>
                {m.text || (
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {messages.length === 0 && (
        <div className="px-4 py-4 text-center">
          <p className="text-text-muted text-xs mb-3">Frag mich was — ich kenne alle deine Module.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {CHIPS.map((q) => (
              <button key={q} type="button" onClick={() => send(q)}
                className="rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 text-[11px] text-text-muted hover:border-[#40a0d0]/40 hover:text-text-secondary transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 border-t border-border-subtle px-3 py-2">
        <input type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Schreib Jarvis..."
          disabled={streaming}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0" />
        <button type="button" onClick={() => send()} disabled={!input.trim() || streaming}
          className="shrink-0 h-8 w-8 rounded-lg bg-[#40a0d0]/10 border border-[#40a0d0]/20 flex items-center justify-center text-[#40a0d0] hover:bg-[#40a0d0]/20 disabled:opacity-30 transition-colors"
          aria-label="Senden">
          ▲
        </button>
      </div>
    </section>
  );
}
