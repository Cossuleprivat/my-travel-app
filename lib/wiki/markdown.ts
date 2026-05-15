export function renderMarkdown(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  const out: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-bg-elevated px-1 rounded text-accent-blue text-sm">$1</code>');

    if (line.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h1 class="text-xl font-bold text-text-primary mt-6 mb-2 first:mt-0">${line.slice(2)}</h1>`);
    } else if (line.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2 class="text-base font-semibold text-text-primary mt-5 mb-1.5">${line.slice(3)}</h2>`);
    } else if (line.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h3 class="text-sm font-semibold text-text-secondary mt-4 mb-1">${line.slice(4)}</h3>`);
    } else if (line.startsWith('> ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<blockquote class="border-l-2 border-accent-blue pl-3 text-text-muted italic my-2 text-sm">${line.slice(2)}</blockquote>`);
    } else if (line === '---') {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push('<hr class="border-border-subtle my-4" />');
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      if (!inList) { out.push('<ul class="my-2 space-y-0.5">'); inList = true; }
      out.push(`<li class="ml-4 list-disc text-sm text-text-secondary">${line.slice(2)}</li>`);
    } else if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push('<div class="h-2"></div>');
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p class="text-sm text-text-secondary leading-relaxed">${line}</p>`);
    }
  }

  if (inList) out.push('</ul>');
  return out.join('\n');
}
