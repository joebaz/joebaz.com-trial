// @ts-check
import { URL } from "node:url";

import { createFixtureConfig } from "../astro.config.mjs";

export default createFixtureConfig(
  new URL("./website-facts.yaml", import.meta.url),
);
