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
      out.push(`<h1 class="font-serif text-3xl font-bold text-text-primary mt-8 mb-4 first:mt-0 leading-tight">${line.slice(2)}</h1>`);
    } else if (line.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2 class="font-serif text-xl font-semibold text-text-primary mt-8 mb-3 pb-1 border-b border-border-subtle">${line.slice(3)}</h2>`);
    } else if (line.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h3 class="font-serif text-base font-semibold text-text-secondary mt-5 mb-2">${line.slice(4)}</h3>`);
    } else if (line.startsWith('> ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<blockquote class="border-l-2 border-accent-amber pl-4 text-text-secondary italic my-4 text-[15px] leading-7">${line.slice(2)}</blockquote>`);
    } else if (line === '---') {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push('<hr class="border-border-subtle my-6" />');
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      if (!inList) { out.push('<ul class="my-3 space-y-1.5">'); inList = true; }
      out.push(`<li class="ml-5 list-disc text-[15px] text-text-secondary leading-7">${line.slice(2)}</li>`);
    } else if (line.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push('<div class="h-3"></div>');
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p class="text-[15px] text-text-secondary leading-7 mb-3">${line}</p>`);
    }
  }

  if (inList) out.push('</ul>');
  return out.join('\n');
}
