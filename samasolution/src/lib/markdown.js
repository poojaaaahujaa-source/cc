'use strict';

const { escapeHtml } = require('./utils');

/**
 * A deliberately small Markdown subset, escaped first.
 * Supports: ## / ### headings, paragraphs, unordered + ordered lists,
 * blockquotes, fenced code, horizontal rules, **bold**, *italic*, `code`
 * and [text](http(s) | mailto | /relative) links.
 */

function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|\/[^\s)]*)\)/g,
      '<a href="$2">$1</a>'
    );
}

function render(markdown) {
  const src = escapeHtml(String(markdown || '')).replace(/\r\n/g, '\n');
  const lines = src.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i += 1; continue; }

    if (/^```/.test(trimmed)) {
      const lang = trimmed.slice(3).trim();
      const code = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(`<pre class="code-block"${lang ? ` data-lang="${lang}"` : ''}><code>${code.join('\n')}</code></pre>`);
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      out.push('<hr>');
      i += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const para = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || /^(#{2,4}\s|[-*]\s|\d+\.\s|>\s?|```|---+$)/.test(t)) break;
      para.push(t);
      i += 1;
    }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }

  return out.join('\n');
}

module.exports = { render };
