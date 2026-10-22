// Pretty-prints the one-line HTML of a web template for reading: one element per line, children
// indented, an element holding only text kept on one line, and the attributes of an opening tag
// wider than `width` put one per line. Only for the markup the templates produce (no comments,
// scripts or raw text elements); attribute values are escaped by the templates, so they hold no
// `<` or `>`. Server and client (the playground re-formats on every render).

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

type Element = { tag: string; attrs: string[]; children: Node[] };
type Node = Element | string;

function parse(html: string): Node[] {
  const root: Element = { tag: '', attrs: [], children: [] };
  const stack: Element[] = [root];
  for (const [token] of html.matchAll(/<\/?[a-zA-Z][^>]*>|[^<]+/g)) {
    const top = stack[stack.length - 1];
    if (token.startsWith('</')) {
      if (stack.length > 1) stack.pop();
    } else if (token.startsWith('<')) {
      const [, tag, rest] = token.match(/^<([a-zA-Z][\w-]*)([\s\S]*?)\/?>$/)!;
      const attrs = [...rest.matchAll(/[^\s=]+(?:="[^"]*")?/g)].map((m) => m[0]);
      const el: Element = { tag, attrs, children: [] };
      top.children.push(el);
      if (!VOID.has(tag.toLowerCase()) && !token.endsWith('/>')) stack.push(el);
    } else if (token.trim()) {
      top.children.push(token.trim());
    }
  }
  return root.children;
}

function print(node: Node, depth: number, width: number, out: string[]) {
  const pad = '  '.repeat(depth);
  if (typeof node === 'string') {
    out.push(pad + node);
    return;
  }
  const close = VOID.has(node.tag.toLowerCase()) ? '' : `</${node.tag}>`;
  const textOnly = node.children.every((c) => typeof c === 'string');
  const text = textOnly ? (node.children as string[]).join(' ') : '';
  const inline = `${pad}<${[node.tag, ...node.attrs].join(' ')}>`;
  const wrap = node.attrs.length > 1 && (inline + (textOnly ? text + close : '')).length > width;
  // Opening tag: on one line, or the tag name then one attribute per line and `>` on its own line.
  const open = wrap ? [`${pad}<${node.tag}`, ...node.attrs.map((a) => `${pad}  ${a}`), `${pad}>`] : [inline];
  if (textOnly) {
    open[open.length - 1] += text + close;
    out.push(...open);
    return;
  }
  out.push(...open);
  for (const child of node.children) print(child, depth + 1, width, out);
  if (close) out.push(pad + close);
}

export function formatHtml(html: string, width = 72): string {
  const out: string[] = [];
  for (const node of parse(html)) print(node, 0, width, out);
  return out.join('\n');
}
