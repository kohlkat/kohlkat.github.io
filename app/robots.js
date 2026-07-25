import { siteOrigin } from "../lib/site";

export const dynamic = "force-static";

const policyFiles = [
  "/robots.txt",
  "/.well-known/tdmrep.json",
  "/llms.txt",
];

const permittedSearchAgents = [
  "Googlebot",
  "Google-InspectionTool",
  "Bingbot",
  "DuckDuckBot",
  "Slurp",
];

const permittedPreviewAgents = [
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
];

const blockedAiAgents = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "OAI-AdsBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "Amazonbot",
  "Bytespider",
  "cohere-ai",
  "YouBot",
  "Diffbot",
  "PetalBot",
  "TikTokSpider",
  "AI2Bot",
  "Ai2Bot-Dolma",
  "omgili",
  "omgilibot",
  "ImagesiftBot",
  "img2dataset",
  "Kangaroo Bot",
  "PanguBot",
];

const blockedArchiveAgents = [
  "ia_archiver",
  "archive.org_bot",
  "ArchiveBot",
  "Archive-It",
  "Heritrix",
];

export default function robots() {
  return {
    rules: [
      {
        userAgent: [...permittedSearchAgents, ...permittedPreviewAgents],
        allow: "/",
      },
      {
        userAgent: [...blockedAiAgents, ...blockedArchiveAgents],
        allow: policyFiles,
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: policyFiles,
        disallow: "/",
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
