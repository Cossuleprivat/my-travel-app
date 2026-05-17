'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type Message = { role: 'user' | 'jarvis'; text: string };

const SUGGESTIONS = [
  'Was steht heute an?',
  'Motivier mich kurz',
  'Wer bist du?',
  'Wie ist mein Streak?',
  'Was sind meine Jahresziele?',
  'Reise planen',
];

const INTRO: Message = { role: 'jarvis', text: 'Online. Was brauchst du?' };

export function JarvisFullChat({ userName }: { userName: string }) {
  const [messages, setMessages]   = useState<Message[]>([INTRO]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput('');
    inputRef.current?.focus();

    const userMsg: Message = { role: 'user', text: msg };
    const history = messages
      .filter((m) => m.text !== INTRO.text)
      .map((m) => ({ role: m.role === 'jarvis' ? 'assistant' as const : 'user' as const, content: m.text }));

    setMessages((prev) => [...prev, userMsg, { role: 'jarvis', text: '' }]);
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
        next[next.length - 1] = { role: 'jarvis', text: 'Verbindungsproblem. Versuch nochmal.' };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, messages, userName]);

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-border-subtle overflow-hidden"
         style={{ background: 'rgba(12,18,28,0.95)', boxShadow: '0 0 20px rgba(64,160,208,0.04)' }}>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'jarvis' && (
              <div className="h-8 w-8 shrink-0 rounded-full border border-[#40a0d0]/30 flex items-center justify-center mt-0.5"
                   style={{ background: 'radial-gradient(circle, #0d2035 0%, #060c14 100%)' }}>
                <span className="font-mono text-xs font-bold text-[#40a0d0]">J</span>
              </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[78%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={[
                'rounded-2xl px-4 py-2.5 text-sm leading-relaxed min-h-[2rem]',
                m.role === 'user'
                  ? 'bg-[#40a0d0]/15 text-text-primary rounded-tr-sm border border-[#40a0d0]/15'
                  : 'bg-bg-elevated text-text-secondary rounded-tl-sm border border-border-subtle',
              ].join(' ')}>
                {m.text || (
                  <span className="inline-flex gap-1.5 items-center pt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && !streaming && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => send(s)}
              className="rounded-full border border-border-subtle bg-bg-base px-3 py-1 text-[11px] font-mono text-text-muted hover:border-[#40a0d0]/40 hover:text-text-secondary transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-border-subtle px-4 py-3" style={{ background: 'rgba(9,14,22,0.8)' }}>
        <input ref={inputRef} type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={`Sag Jarvis was, ${userName}...`}
          disabled={streaming}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0" />
        <button type="button" onClick={() => send()} disabled={!input.trim() || streaming}
          className="shrink-0 h-9 w-9 rounded-xl border border-[#40a0d0]/25 flex items-center justify-center text-[#40a0d0] hover:bg-[#40a0d0]/10 disabled:opacity-25 transition-all"
          style={{ background: 'rgba(64,160,208,0.05)' }} aria-label="Senden">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 12V2M7 2L2 7M7 2l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
