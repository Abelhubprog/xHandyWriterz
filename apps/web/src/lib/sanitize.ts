// Minimal client-side sanitizer to reduce XSS risk when rendering CMS-provided HTML.
// Note: For production, prefer a vetted sanitizer (DOMPurify/rehype-sanitize). This covers common cases.

export function sanitizeHtml(input?: string): string {
  if (!input) return '';
  // Create a detached DOM parser/container
  const tpl = document.createElement('template');
  tpl.innerHTML = input;
  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // Remove dangerous elements
      const tag = el.tagName.toLowerCase();
      if (['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'].includes(tag)) {
        el.remove();
        return;
      }
      // Strip event handlers and javascript: urls
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        const value = attr.value;
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }
        if ((name === 'src' || name === 'href') && /^\s*javascript:/i.test(value)) {
          el.removeAttribute(attr.name);
          continue;
        }
      }
    }
    // Recurse
    for (const child of Array.from(node.childNodes)) walk(child);
  };
  walk(tpl.content);
  return tpl.innerHTML;
}
