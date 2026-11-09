# Configure a site and add pages

Use this guide when implementing shared site values, shared metadata, or a new page. Approved site values belong in the configuration below; approved page copy and image choices come from the task or existing content.

## Configure shared values

- Set `production_url` in [website-facts.yaml](../website-facts.yaml) to the approved absolute production URL. Astro's build sets its `site` option from it, and the layout reads `Astro.site`; preview and development hosts do not supply this value.
- Set `site_name` in the same file to the approved site name. It supplies the title suffix and `og:site_name`.
- Set `language` in the same file to the site's HTML language tag, such as `ja` for a Japanese-only site. It sets only the `lang` attribute; it does not configure multilingual routing.
- The layout links to `favicon.svg` and `favicon.ico` in `public/`; replace those files to change the favicon.

While the production URL, site name, or language is undecided, leave its value empty in `website-facts.yaml`. Astro's build still succeeds and logs a warning for each undecided value, naming the key to set. Without a production URL, canonical and `og:url` tags are omitted. Without a site name, the title contains only the page title and `og:site_name` is omitted. Without a language, the layout omits the `lang` attribute. Record only approved values rather than placeholders.

The same production URL supplies the generated sitemap and robots.txt sitemap reference. See [Configure the sitemap and robots.txt](configure-sitemap-and-robots.md) for build behavior and page exclusions.

## Add a page

Create an `.astro` file under `src/pages/`, following [Astro's file-based routing](https://docs.astro.build/en/guides/routing/). Import [BaseLayout](../src/layouts/BaseLayout.astro) using the relative path appropriate to the new page.

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";

const title = "About";
const description = "Learn about this project.";
---

<BaseLayout title={title} description={description}>
  <main>
    <h1>{title}</h1>
    <p>{description}</p>
  </main>
</BaseLayout>
```

Replace the example copy with the approved page content. The layout owns the HTML document, shared styles, and head metadata; place page content, landmarks, and headings in its default slot.

| Layout input  | Required | Purpose                                                                |
| ------------- | -------- | ---------------------------------------------------------------------- |
| `title`       | Yes      | Page title; the configured site name is appended when present          |
| `description` | Yes      | Page description for standard and social metadata                      |
| `image`       | No       | `{ src: string; alt: string }` for the social-sharing image; see below |
| Default slot  | Yes      | Rendered page content                                                  |

The canonical and `og:url` values combine the configured production URL with the page path in its no-trailing-slash form, such as `/about`, with `/` for the homepage; they exclude query parameters and fragments. Follow the repository [URL conventions](../coding-standards.md#urls-and-metadata).

### Social-sharing images

Supply the optional `image` input as `{ src, alt }` with the approved image source and alternative text. Files in `public/` use a root-relative path; an imported Astro image uses its `.src` property; externally hosted images use an absolute HTTP(S) URL. Relative image URLs need a configured production URL to become absolute social metadata URLs. An absolute image URL can be used even before the production URL is configured. When no image can be resolved, image metadata is omitted.

The layout emits Open Graph metadata and a `twitter:card` value from the page inputs. Twitter cards use the Open Graph title, description, and image.

## Verify changes

Run the applicable checks in [CONTRIBUTING.md](../CONTRIBUTING.md#validate-your-change). No test depends on the values in the root `website-facts.yaml`, but each fixture's config imports `astro.config.mjs`, so the reader module also validates the root file and an invalid root file fails the test builds. Each Playwright test builds or serves the site from a fixture, a test input the tests own under `tests/fixtures/` with its own facts file. The fixtures that set a production URL use the reserved test domain `example.com`, which must not become the project's production URL.
