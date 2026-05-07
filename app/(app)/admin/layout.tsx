import React from 'react';
import Link from 'next/link';

const ADMIN_NAV = [
  { href: '/admin',                    label: 'Data Ops' },
  { href: '/admin/import-runbook',     label: 'Import Runbook' },
  { href: '/admin/rls-audit',          label: 'RLS Audit' },
  { href: '/admin/release-checklist',  label: 'Release Checklist' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <nav className="flex gap-2 flex-wrap">
        <Link
          href="/profile"
          className="text-xs label-mono text-text-muted hover:text-text-secondary"
        >
          ← Profile
        </Link>
        <span className="text-text-muted text-xs">/</span>
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-xs label-mono text-accent-blue/70 hover:text-accent-blue transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
