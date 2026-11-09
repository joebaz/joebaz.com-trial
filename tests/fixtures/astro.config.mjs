// @ts-check
import { URL } from "node:url";
import { mergeConfig } from "astro/config";

import { createConfig, sitemapExclusions } from "../../astro.config.mjs";

const fixturePage = new URL("./about.astro", import.meta.url);
const noImagePage = new URL("./no-image.astro", import.meta.url);

// `/test-fixtures/excluded` is left out of the sitemap through the exclusion list projects
// edit. Other fixture configs import this module, so the push stays at module
// level, where it runs once, rather than in the factory, which runs once per
// fixture.
sitemapExclusions.push("/test-fixtures/excluded");

/**
 * The site's configuration for a fixture's facts file, plus non-root fixture
 * pages. A nested `index` segment is its own page, unlike the root index.
 * @param {URL} factsFile
 */
export function createFixtureConfig(factsFile) {
  return mergeConfig(createConfig(factsFile), {
    integrations: [
      {
        name: "fixture-routes",
        hooks: {
          "astro:config:setup": ({ injectRoute }) => {
            injectRoute({
              pattern: "/test-fixtures/about",
              entrypoint: fixturePage,
            });
            injectRoute({
              pattern: "/test-fixtures/articles/index",
              entrypoint: fixturePage,
            });
            injectRoute({
              pattern: "/test-fixtures/excluded",
              entrypoint: fixturePage,
            });
            injectRoute({
              pattern: "/test-fixtures/no-image",
              entrypoint: noImagePage,
            });
          },
        },
      },
    ],
  });
}

// The Playwright web server's config: a production URL and language, and no
// site name.
export default createFixtureConfig(
  new URL("./website-facts.yaml", import.meta.url),
);
