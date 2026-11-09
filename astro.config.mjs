// @ts-check
import { URL } from "node:url";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

import {
  readWebsiteFacts,
  websiteFactsIntegration,
} from "./src/website-facts.ts";

// Pages to leave out of the sitemap, as canonical paths such as "/thank-you".
// Every other static page is included.
/** @type {string[]} */
export const sitemapExclusions = [];

/**
 * The site's configuration, built from a facts file. Test fixtures pass their
 * own facts files; the default export uses the root website-facts.yaml.
 * @param {URL} factsFile
 */
export function createConfig(factsFile) {
  const facts = readWebsiteFacts(factsFile);

  // https://astro.build/config
  return defineConfig({
    // Canonical and `og:url` tags, the sitemap, and its robots.txt reference
    // are omitted while the production URL is undecided.
    site: facts.production_url ?? undefined,

    // Page URLs have no trailing slash (#40). File output (`about.html`) keeps
    // development and build URLs consistent.
    trailingSlash: "never",
    build: {
      format: "file",
    },

    vite: {
      plugins: [tailwindcss()],
    },

    integrations: [
      react(),
      sitemap({
        filter: (page) => !sitemapExclusions.includes(new URL(page).pathname),
      }),
      websiteFactsIntegration(factsFile, facts),
    ],
  });
}

export default createConfig(new URL("./website-facts.yaml", import.meta.url));
