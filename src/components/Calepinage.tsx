import type { PatternName } from "@/content/types";

/**
 * Dessins de calepinage (plans de pose) en SVG pur : zéro image, zéro JS, net à toutes les tailles.
 * Ils servent d'illustration honnête tant que les vraies photos de chantier ne sont pas en ligne.
 */
type Props = {
  pattern: PatternName;
  className?: string;
  /** Carreau(x) mis en avant en rouge (indices). */
  accent?: number[];
  label?: string;
  tone?: "light" | "dark";
};

type Rect = { x: number; y: number; w: number; h: number; r?: number };

const W = 240;
const H = 240;

function droit(size = 40): Rect[] {
  const out: Rect[] = [];
  for (let y = 0; y < H; y += size) for (let x = 0; x < W; x += size) out.push({ x, y, w: size, h: size });
  return out;
}

function decale(w = 80, h = 40, offset = 1 / 3): Rect[] {
  const out: Rect[] = [];
  let row = 0;
  for (let y = 0; y < H; y += h, row++) {
    const shift = ((row * offset) % 1) * w;
    for (let x = -shift; x < W; x += w) out.push({ x, y, w, h });
  }
  return out;
}

function grand(): Rect[] {
  return [
    { x: 0, y: 0, w: 120, h: 120 },
    { x: 120, y: 0, w: 120, h: 120 },
    { x: 0, y: 120, w: 120, h: 120 },
    { x: 120, y: 120, w: 120, h: 120 },
  ];
}

function opus(): Rect[] {
  // Module d'opus romain (4 formats) répété
  const m: Rect[] = [
    { x: 0, y: 0, w: 80, h: 80 },
    { x: 80, y: 0, w: 40, h: 40 },
    { x: 80, y: 40, w: 40, h: 40 },
    { x: 0, y: 80, w: 40, h: 40 },
    { x: 40, y: 80, w: 80, h: 40 },
  ];
  const out: Rect[] = [];
  for (let oy = 0; oy < H; oy += 120) for (let ox = 0; ox < W; ox += 120) m.forEach((r) => out.push({ ...r, x: r.x + ox, y: r.y + oy }));
  return out;
}

function chevronPaths(): string[] {
  const paths: string[] = [];
  const w = 30;
  const h = 20;
  for (let col = -1; col < W / w + 1; col++) {
    for (let row = -2; row < H / h + 2; row++) {
      const x = col * w;
      const y = row * h + (col % 2 === 0 ? 0 : 0);
      const dir = col % 2 === 0 ? 1 : -1;
      paths.push(`M${x},${y + (dir > 0 ? 0 : h)} L${x + w},${y + (dir > 0 ? h : 0)} L${x + w},${y + (dir > 0 ? h * 2 : h)} L${x},${y + (dir > 0 ? h : h * 2)} Z`);
    }
  }
  return paths;
}

function batons(): Rect[] {
  // Bâtons rompus (herringbone 2:1) : chaîne diagonale H/V répétée sur un réseau (s,s) × (-2s,2s)
  const s = 20;
  const out: Rect[] = [];
  for (let band = -12; band < 12; band++) {
    for (let i = -14; i < 14; i++) {
      const bx = band * -2 * s + i * s;
      const by = band * 2 * s + i * s;
      if (bx > W + 2 * s || by > H + 2 * s || bx < -3 * s || by < -3 * s) continue;
      out.push({ x: bx, y: by, w: 2 * s, h: s });
      out.push({ x: bx, y: by + s, w: s, h: 2 * s });
    }
  }
  return out;
}

export function Calepinage({ pattern, className, accent = [], label, tone = "light" }: Props) {
  const stroke = tone === "dark" ? "rgba(255,255,255,0.28)" : "var(--joint)";
  const fill = tone === "dark" ? "rgba(255,255,255,0.03)" : "var(--blanc)";
  const fillAlt = tone === "dark" ? "rgba(255,255,255,0.06)" : "var(--alu-2)";

  let rects: Rect[] = [];
  let paths: string[] = [];
  switch (pattern) {
    case "droit":
      rects = droit(48);
      break;
    case "mosaique":
      rects = droit(20);
      break;
    case "decale":
      rects = decale();
      break;
    case "grand":
      rects = grand();
      break;
    case "opus":
      rects = opus();
      break;
    case "chevron":
      paths = chevronPaths();
      break;
    case "batons":
      rects = batons();
      break;
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      preserveAspectRatio="xMidYMid slice"
    >
      <g strokeWidth={3} stroke={stroke}>
        <rect width={W} height={H} fill={fill} stroke="none" />
        {rects.map((r, i) => (
          <rect
            key={i}
            x={r.x + 1}
            y={r.y + 1}
            width={r.w - 2}
            height={r.h - 2}
            fill={accent.includes(i) ? "var(--rouge)" : i % 7 === 3 ? fillAlt : fill}
          />
        ))}
        {paths.map((d, i) => (
          <path key={i} d={d} fill={accent.includes(i) ? "var(--rouge)" : i % 5 === 2 ? fillAlt : fill} />
        ))}
      </g>
    </svg>
  );
}
