import type { APIRoute } from "astro";

// Allows all crawling. The sitemap reference needs the production URL, so it
// is omitted, as is the sitemap itself, while `production_url` in
// website-facts.yaml is undecided.
export const GET: APIRoute = ({ site }) => {
  const lines = ["User-agent: *", "Allow: /"];
  if (site) {
    lines.push("", `Sitemap: ${new URL("sitemap-index.xml", site).href}`);
  }
  return new Response(`${lines.join("\n")}\n`);
};
