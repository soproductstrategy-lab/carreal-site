import type { MetadataRoute } from "next";
import { IS_NOINDEX } from "@/content/business";
import { abs } from "@/lib/seo";

/**
 * En mode démo (*.vercel.app ou NEXT_PUBLIC_NOINDEX=true), toute indexation est bloquée.
 * En production sur carreal.fr, tous les robots sont autorisés, y compris les robots des moteurs IA
 * (OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended…) : être cité par les IA est un objectif.
 */
export default function robots(): MetadataRoute.Robots {
  if (IS_NOINDEX) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/merci/", "/studio/"] },
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Bingbot", "Applebot"],
        allow: "/",
      },
    ],
    sitemap: abs("/sitemap.xml"),
    host: abs("/"),
  };
}
