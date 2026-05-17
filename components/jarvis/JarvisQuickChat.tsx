'use client';

import { useState, useTransition, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'jarvis'; text: string };

export function JarvisQuickChat({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [isPending, start]      = useTransition();
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text || isPending) return;
    setInput('');
    const userMsg: Message = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);

    start(async () => {
      const res = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userName }),
      });
      const { reply } = await res.json();
      setMessages((m) => [...m, { role: 'jarvis', text: reply }]);
    });
  }

  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
        <div className="h-2 w-2 rounded-full bg-[#40a0d0] animate-pulse" />
        <span className="font-mono text-xs tracking-widest uppercase text-text-muted">
          Jarvis — Direktleitung
        </span>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="max-h-56 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'jarvis' && (
                <div className="h-6 w-6 shrink-0 rounded-full bg-[#0a1f33] border border-[#40a0d0]/30 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-[#40a0d0]">J</span>
                </div>
              )}
              <div
                className={[
                  'max-w-[75%] rounded-xl px-3 py-2 text-sm leading-snug',
                  m.role === 'user'
                    ? 'bg-[#40a0d0]/15 text-text-primary rounded-br-none'
                    : 'bg-bg-elevated text-text-secondary rounded-bl-none border border-border-subtle',
                ].join(' ')}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isPending && (
            <div className="flex gap-2">
              <div className="h-6 w-6 shrink-0 rounded-full bg-[#0a1f33] border border-[#40a0d0]/30 flex items-center justify-center">
                <span className="font-mono text-[9px] text-[#40a0d0]">J</span>
              </div>
              <div className="bg-bg-elevated border border-border-subtle rounded-xl rounded-bl-none px-3 py-2">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="px-4 py-4 text-center">
          <p className="text-text-muted text-xs">
            Frag mich was — Reisen, Pläne, einfach alles.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {['Was steht an?', 'Reise planen', 'Motivier mich'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => { setInput(q); }}
                className="rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 text-[11px] text-text-muted hover:border-[#40a0d0]/40 hover:text-text-secondary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 border-t border-border-subtle px-3 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Sag Jarvis was..."
          disabled={isPending}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none min-w-0"
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || isPending}
          className="shrink-0 h-8 w-8 rounded-lg bg-[#40a0d0]/10 border border-[#40a0d0]/20 flex items-center justify-center text-[#40a0d0] hover:bg-[#40a0d0]/20 disabled:opacity-30 transition-colors"
          aria-label="Senden"
        >
          ▲
        </button>
      </div>
    </section>
  );
}
