import Link from 'next/link';

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs label-mono text-text-muted mb-3">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.href && !isLast ? (
                <Link href={c.href} className="hover:text-text-secondary">{c.label}</Link>
              ) : (
                <span className={isLast ? 'text-text-secondary' : ''}>{c.label}</span>
              )}
              {!isLast && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
