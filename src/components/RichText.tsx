import Link from "next/link";
import type { ReactNode } from "react";
import type { Block } from "@/content/types";
import { imgSrc, imgSrcSet } from "@/lib/img";
import { fr } from "@/lib/typo";

/** Inline : **gras** et [texte](url), typographie française appliquée. Liens internes via next/link. */
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  const t = fr(text);
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(t))) {
    if (m.index > last) parts.push(t.slice(last, m.index));
    if (m[1]) parts.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2] && m[3]) {
      const href = m[3];
      parts.push(
        href.startsWith("/") ? (
          <Link key={k++} href={href}>
            {m[2]}
          </Link>
        ) : (
          <a key={k++} href={href} rel="noopener">
            {m[2]}
          </a>
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < t.length) parts.push(t.slice(last));
  return <>{parts}</>;
}

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function RichText({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-carreal">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "p":
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            );
          case "h2":
            return (
              <h2 key={i} id={b.id ?? slugify(b.text)} className="scroll-mt-28">
                {fr(b.text)}
              </h2>
            );
          case "h3":
            return <h3 key={i}>{fr(b.text)}</h3>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <Inline text={it} />
                  </li>
                ))}
              </ul>
            );
          case "steps":
            return (
              <ol key={i} className="etapes pose !mt-7 !grid-cols-1">
                {b.items.map((s, j) => (
                  <li key={j} className="grid grid-cols-[3rem_1fr] items-start gap-x-3 bg-blanc px-4 py-4 before:pt-0.5">
                    <span>
                      <strong className="block font-[700]">{fr(s.title)}</strong>
                      <span className="text-[0.975rem] text-gris">
                        <Inline text={s.text} />
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={i} className="!mt-7 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[34rem] text-left text-[0.95rem]">
                  {b.caption && <caption className="t-etiquette mb-2 text-left text-gris">{fr(b.caption)}</caption>}
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} scope="col" className="border-b-2 border-anthracite py-2 pr-4 font-[700]">
                          {fr(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j}>
                        {r.map((c, k) =>
                          k === 0 ? (
                            <th key={k} scope="row" className="border-b-2 border-alu-2 py-2.5 pr-4 align-top font-[650]">
                              <Inline text={c} />
                            </th>
                          ) : (
                            <td key={k} className="border-b-2 border-alu-2 py-2.5 pr-4 align-top">
                              <Inline text={c} />
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "callout":
            return (
              <aside key={i} className={`!mt-7 border-l-[6px] bg-blanc px-5 py-4 ${b.tone === "warn" ? "border-rouge" : "border-anthracite"}`}>
                {b.title && <p className="mb-1 font-[700]">{fr(b.title)}</p>}
                <p className="text-[1rem]">
                  <Inline text={b.text} />
                </p>
              </aside>
            );
          case "spec":
            return (
              <dl key={i} className="pose !mt-7">
                {b.items.map((s, j) => (
                  <div key={j} className="col-span-6 bg-blanc px-4 py-3 sm:col-span-3">
                    <dt className="t-etiquette text-gris">{fr(s.label)}</dt>
                    <dd className="font-[650]">{fr(s.value)}</dd>
                  </div>
                ))}
              </dl>
            );
          case "image":
            return (
              <figure key={i} className="!mt-8 bg-blanc p-2 shadow-[0_10px_28px_rgba(31,33,36,0.08)] ring-2 ring-joint/60">
                <div className="overflow-hidden bg-alu-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc(b.src, 1200)}
                    srcSet={imgSrcSet(b.src, [480, 800, 1200, 1600])}
                    sizes="(min-width: 1024px) 780px, 94vw"
                    alt={b.alt}
                    width={b.width}
                    height={b.height}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full object-cover"
                  />
                </div>
                {b.caption && (
                  <figcaption className="px-1 pt-2.5 pb-1 text-[0.875rem] leading-snug text-gris">
                    {fr(b.caption)}
                  </figcaption>
                )}
              </figure>
            );
        }
      })}
    </div>
  );
}
