/**
 * Conversion entre le format de blocs du site (src/content/types.ts) et le Portable Text de Sanity.
 * - blocksToPortable : utilisé par le script d'import (contenu local → Sanity)
 * - portableToBlocks : utilisé à la lecture (Sanity → rendu du site), un seul moteur de rendu.
 * Fichier sans alias « @/ » : il est aussi exécuté par Node dans scripts/seed-sanity.mts.
 */
import type { Block } from "../content/types";

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _type: "link"; _key: string; href: string };
export type PtBlock = {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3";
  listItem?: "bullet";
  level?: number;
  markDefs: MarkDef[];
  children: Span[];
};
type PtObject = { _type: string; _key: string; [k: string]: unknown };
export type PortableText = (PtBlock | PtObject)[];

let counter = 0;
export const key = () => `k${(counter++).toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function inlineToSpans(text: string): { children: Span[]; markDefs: MarkDef[] } {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const push = (t: string, marks: string[] = []) => t && children.push({ _type: "span", _key: key(), text: t, marks });
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    if (m[1]) push(m[1], ["strong"]);
    else {
      const k = key();
      markDefs.push({ _type: "link", _key: k, href: m[3] });
      push(m[2], [k]);
    }
    last = re.lastIndex;
  }
  push(text.slice(last));
  if (!children.length) push(" ");
  return { children, markDefs };
}

const block = (text: string, style: PtBlock["style"] = "normal", listItem?: "bullet"): PtBlock => ({
  _type: "block",
  _key: key(),
  style,
  ...(listItem ? { listItem, level: 1 } : {}),
  ...inlineToSpans(text),
});

export function blocksToPortable(blocks: Block[]): PortableText {
  const out: PortableText = [];
  for (const b of blocks) {
    switch (b.type) {
      case "p":
        out.push(block(b.text));
        break;
      case "h2":
      case "h3":
        out.push(block(b.text, b.type));
        break;
      case "ul":
        b.items.forEach((it) => out.push(block(it, "normal", "bullet")));
        break;
      case "steps":
        out.push({ _type: "steps", _key: key(), items: b.items.map((i) => ({ _key: key(), _type: "step", ...i })) });
        break;
      case "table":
        out.push({ _type: "tableau", _key: key(), caption: b.caption, head: b.head, rows: b.rows.map((cells) => ({ _key: key(), _type: "row", cells })) });
        break;
      case "callout":
        out.push({ _type: "callout", _key: key(), title: b.title, text: b.text, tone: b.tone ?? "info" });
        break;
      case "spec":
        out.push({ _type: "spec", _key: key(), items: b.items.map((i) => ({ _key: key(), _type: "specItem", ...i })) });
        break;
    }
  }
  return out;
}

function spansToInline(bl: PtBlock): string {
  const defs = new Map((bl.markDefs ?? []).map((d) => [d._key, d]));
  return (bl.children ?? [])
    .map((s) => {
      let t = s.text ?? "";
      for (const mk of s.marks ?? []) {
        if (mk === "strong") t = `**${t}**`;
        else if (defs.get(mk)?.href) t = `[${t}](${defs.get(mk)!.href})`;
      }
      return t;
    })
    .join("");
}

export function portableToBlocks(pt: PortableText | null | undefined): Block[] {
  const out: Block[] = [];
  for (const node of pt ?? []) {
    if (node._type === "block") {
      const bl = node as PtBlock;
      const text = spansToInline(bl);
      if (bl.listItem) {
        const prev = out[out.length - 1];
        if (prev?.type === "ul") prev.items.push(text);
        else out.push({ type: "ul", items: [text] });
      } else if (bl.style === "h2") out.push({ type: "h2", text });
      else if (bl.style === "h3") out.push({ type: "h3", text });
      else if (text.trim()) out.push({ type: "p", text });
      continue;
    }
    const o = node as Record<string, unknown>;
    if (o._type === "steps") out.push({ type: "steps", items: ((o.items as { title?: string; text?: string }[]) ?? []).map((i) => ({ title: i.title ?? "", text: i.text ?? "" })) });
    else if (o._type === "tableau")
      out.push({ type: "table", caption: (o.caption as string) || undefined, head: (o.head as string[]) ?? [], rows: ((o.rows as { cells?: string[] }[]) ?? []).map((r) => r.cells ?? []) });
    else if (o._type === "callout") out.push({ type: "callout", title: (o.title as string) || undefined, text: (o.text as string) ?? "", tone: (o.tone as "info" | "warn") ?? "info" });
    else if (o._type === "spec") out.push({ type: "spec", items: ((o.items as { label?: string; value?: string }[]) ?? []).map((i) => ({ label: i.label ?? "", value: i.value ?? "" })) });
  }
  return out;
}
