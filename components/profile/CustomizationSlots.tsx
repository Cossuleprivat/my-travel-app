const SLOTS = [
  { id: 'hat', label: 'Hat', icon: '🎩' },
  { id: 'jacket', label: 'Jacket', icon: '🧥' },
  { id: 'glasses', label: 'Glasses', icon: '👓' },
  { id: 'boots', label: 'Boots', icon: '🥾' },
] as const;

export function CustomizationSlots() {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-4">
      <h2 className="text-xs label-mono text-text-muted mb-3">Customization</h2>
      <div className="grid grid-cols-4 gap-2">
        {SLOTS.map((s) => (
          <div
            key={s.id}
            className="aspect-square rounded-lg bg-bg-elevated border border-dashed border-border-subtle flex flex-col items-center justify-center text-center opacity-60"
          >
            <span className="text-2xl" aria-hidden="true">{s.icon}</span>
            <span className="text-[10px] label-mono text-text-muted mt-1">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="text-text-muted text-[10px] label-mono mt-3 text-center">
        🔒 Items unlock in Session 03
      </p>
    </section>
  );
}
