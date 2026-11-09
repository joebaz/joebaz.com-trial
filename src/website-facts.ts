import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { parse } from "yaml";

// A fact is a value, `none` (decided not to have it), or null (undecided,
// written as an empty value). A null can't render as text, so a bug that
// skips a check omits a tag instead of printing a placeholder.
type Fact = string | null;
type ListFact = string | string[] | null;

export interface WebsiteFacts {
  site_name: Fact;
  business_name: Fact;
  site_description: Fact;
  production_url: Fact;
  redirecting_hostnames: ListFact;
  language: Fact;
  other_languages: ListFact;
  hosting_provider: Fact;
  dns_provider: Fact;
  domain_registrar: Fact;
  analytics: ListFact;
  user_data_stored: ListFact;
  maintainer: Fact;
  client_approver: Fact;
}

// Every key is required; whether a fact may be a list. Extra keys are allowed
// because the maintainer approves new facts in pull request review.
const factKinds: Record<keyof WebsiteFacts, "value" | "list"> = {
  site_name: "value",
  business_name: "value",
  site_description: "value",
  production_url: "value",
  redirecting_hostnames: "list",
  language: "value",
  other_languages: "list",
  hosting_provider: "value",
  dns_provider: "value",
  domain_registrar: "value",
  analytics: "list",
  user_data_stored: "list",
  maintainer: "value",
  client_approver: "value",
};

const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

/**
 * Reads and validates a facts file. Throws, failing Astro's build, with a
 * message naming the file and key when the file breaks a rule.
 */
export function readWebsiteFacts(file: URL): WebsiteFacts {
  const name = displayPath(file);
  const fail = (problem: string): never => {
    throw new Error(`${name}: ${problem}`);
  };

  let data: unknown;
  try {
    data = parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return fail("the file must hold `key: value` facts, one per line.");
  }
  const facts = data as Record<string, unknown>;

  for (const [key, kind] of Object.entries(factKinds)) {
    if (!(key in facts)) fail(`\`${key}\` is missing.`);
    const value = facts[key];
    const valid =
      value === null ||
      isText(value) ||
      (kind === "list" &&
        Array.isArray(value) &&
        value.length > 0 &&
        value.every(isText));
    if (!valid) {
      fail(
        kind === "list"
          ? `\`${key}\` must be text, \`none\`, a list of text, or empty while undecided.`
          : `\`${key}\` must be text, \`none\`, or empty while undecided.`,
      );
    }
  }

  // The site name, production URL, and language are a value or undecided;
  // Astro's build can't use `none`.
  // The URL and language checks below already reject `none`.
  const { site_name, production_url, language } = facts as Record<
    "site_name" | "production_url" | "language",
    Fact
  >;
  if (site_name === "none") {
    fail("`site_name` must be the site's name, or empty while undecided.");
  }
  if (production_url !== null && !isHttpUrl(production_url)) {
    fail(
      "`production_url` must be an absolute http or https URL, or empty while undecided.",
    );
  }
  if (language !== null && !isLanguageTag(language)) {
    fail(
      "`language` must be a language tag such as `en` or `ja`, or empty while undecided.",
    );
  }

  return facts as unknown as WebsiteFacts;
}

function isHttpUrl(value: string) {
  return (
    URL.canParse(value) && ["http:", "https:"].includes(new URL(value).protocol)
  );
}

function isLanguageTag(value: string) {
  try {
    Intl.getCanonicalLocales(value);
    return true;
  } catch {
    return false;
  }
}

// Messages name the file relative to the working directory, such as
// `website-facts.yaml` for the root file.
function displayPath(file: URL) {
  return path.relative(process.cwd(), fileURLToPath(file));
}

const virtualModuleId = "virtual:website-facts";
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

/**
 * An Astro integration that gives the layout the site name and language
 * through `virtual:website-facts`, warns during `astro build` for each
 * undecided site name, production URL, or language, and restarts Astro's dev server when the facts
 * file changes.
 */
export function websiteFactsIntegration(
  file: URL,
  facts: WebsiteFacts,
): AstroIntegration {
  const name = displayPath(file);
  const undecidedWarnings: [Fact, string][] = [
    [
      facts.production_url,
      `Production URL is undecided. Set \`production_url\` in ${name}; canonical and og:url tags, the sitemap, and its robots.txt reference are omitted until then.`,
    ],
    [
      facts.site_name,
      `Site name is undecided. Set \`site_name\` in ${name}; titles and og:site_name omit it until then.`,
    ],
    [
      facts.language,
      `Language is undecided. Set \`language\` in ${name}; pages omit the lang attribute until then.`,
    ],
  ];

  return {
    name: "website-facts",
    hooks: {
      "astro:config:setup": ({
        command,
        addWatchFile,
        updateConfig,
        logger,
      }) => {
        addWatchFile(file);
        updateConfig({
          vite: {
            plugins: [
              {
                name: "website-facts",
                resolveId: (id) =>
                  id === virtualModuleId ? resolvedVirtualModuleId : undefined,
                load: (id) =>
                  id === resolvedVirtualModuleId
                    ? [
                        `export const siteName = ${JSON.stringify(facts.site_name)};`,
                        `export const language = ${JSON.stringify(facts.language)};`,
                      ].join("\n")
                    : undefined,
              },
            ],
          },
        });
        if (command !== "build") return;
        for (const [value, warning] of undecidedWarnings) {
          if (value === null) logger.warn(warning);
        }
      },
    },
  };
}
