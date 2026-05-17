'use client';

import { useState, useTransition, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'jarvis'; text: string; ts: number };

const SUGGESTIONS = [
  'Was steht heute an?',
  'Zeig mir meine Reise-Stats',
  'Neue Trip planen',
  'Motivier mich kurz',
  'Wer bist du?',
  'Was kannst du?',
];

const INTRO: Message = {
  role: 'jarvis',
  text: 'Bereit. Ich bin dein persönlicher Assistent — für Reisen, Pläne, Ziele, und alles dazwischen. Was brauchst du?',
  ts: Date.now(),
};

export function JarvisFullChat({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<Message[]>([INTRO]);
  const [input, setInput]       = useState('');
  const [isPending, start]      = useTransition();
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isPending) return;
    setInput('');
    inputRef.current?.focus();
    const userMsg: Message = { role: 'user', text: msg, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);

    start(async () => {
      const res  = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, userName }),
      });
      const { reply } = await res.json();
      setMessages((m) => [...m, { role: 'jarvis', text: reply, ts: Date.now() }]);
    });
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 rounded-xl border border-border-subtle bg-bg-surface overflow-hidden"
         style={{ boxShadow: '0 0 20px rgba(64,160,208,0.04)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'jarvis' && (
              <div
                className="h-8 w-8 shrink-0 rounded-full border border-[#40a0d0]/30 flex items-center justify-center mt-0.5"
                style={{ background: 'radial-gradient(circle, #0d2035 0%, #060c14 100%)' }}
              >
                <span className="font-mono text-xs font-bold text-[#40a0d0]">J</span>
              </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[78%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={[
                  'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-[#40a0d0]/15 text-text-primary rounded-tr-sm border border-[#40a0d0]/15'
                    : 'bg-bg-elevated text-text-secondary rounded-tl-sm border border-border-subtle',
                ].join(' ')}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex gap-3 justify-start">
            <div
              className="h-8 w-8 shrink-0 rounded-full border border-[#40a0d0]/30 flex items-center justify-center"
              style={{ background: 'radial-gradient(circle, #0d2035 0%, #060c14 100%)' }}
            >
              <span className="font-mono text-xs font-bold text-[#40a0d0]">J</span>
            </div>
            <div className="bg-bg-elevated border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3">
              <span className="inline-flex gap-1.5 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0]/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0]/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions — only show after first message */}
      {messages.length <= 1 && !isPending && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border-subtle bg-bg-base px-3 py-1 text-[11px] font-mono text-text-muted hover:border-[#40a0d0]/40 hover:text-text-secondary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex gap-2 border-t border-border-subtle px-4 py-3"
        style={{ background: 'rgba(9,14,22,0.8)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={`Sag Jarvis was, ${userName}...`}
          disabled={isPending}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0"
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={!input.trim() || isPending}
          className="shrink-0 h-9 w-9 rounded-xl border border-[#40a0d0]/25 flex items-center justify-center text-[#40a0d0] hover:bg-[#40a0d0]/10 disabled:opacity-25 transition-all"
          style={{ background: 'rgba(64,160,208,0.05)' }}
          aria-label="Senden"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 12V2M7 2L2 7M7 2l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
