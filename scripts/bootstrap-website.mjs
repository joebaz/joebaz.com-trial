// @ts-check
import { execFileSync } from "node:child_process";
import console from "node:console";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "yaml";

const REQUIRED_STATUS_NAMES = ["Parking", "Todo", "In progress", "Done"];

/**
 * @typedef {Object} CanonicalLabel
 * @property {string} name
 * @property {string} color
 * @property {string} description
 */

/**
 * @typedef {Object} RepoLabel
 * @property {string} name
 * @property {string} color
 * @property {string} description
 * @property {boolean} [default]
 */

/**
 * @typedef {Object} ProjectStatusOption
 * @property {string} [id]
 * @property {string} name
 */

/**
 * @typedef {Object} ProjectFieldNode
 * @property {string} [name]
 * @property {ProjectStatusOption[]} [options]
 */

/**
 * @typedef {Object} ProjectNode
 * @property {string} id
 * @property {string} title
 * @property {number} number
 * @property {string} url
 * @property {{ __typename: string, login?: string }} [owner]
 * @property {{ pageInfo?: { hasNextPage: boolean, endCursor?: string }, nodes?: ProjectFieldNode[] }} [fields]
 */

/**
 * @typedef {Object} ContactLink
 * @property {string} name
 * @property {string} url
 * @property {string} [about]
 */

/**
 * @typedef {Object} WorkflowRun
 * @property {number} id
 * @property {string} name
 * @property {string} head_sha
 * @property {string} head_branch
 * @property {string} event
 * @property {string} status
 * @property {string | null} conclusion
 * @property {string} html_url
 */

/**
 * Format an error to its message string.
 * @param {unknown} error
 * @returns {string}
 */
function formatErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Execute a subprocess with an argument array and return its stdout.
 * Forces gh to target github.com regardless of GH_HOST environment variable.
 * @param {string} file
 * @param {string[]} args
 * @returns {string}
 */
function runSubprocess(file, args) {
  return execFileSync(file, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      GH_HOST: "github.com",
    },
  });
}

/**
 * Parse owner and repository name from the origin remote URL.
 * Strictly anchors github.com to reject other hosts (e.g., notgithub.com).
 * @param {string} remoteUrl
 * @returns {{ owner: string, repo: string }}
 */
function parseOriginUrl(remoteUrl) {
  const trimmed = remoteUrl.trim();

  // HTTPS or SSH URL with scheme (e.g., https://github.com/owner/repo.git or ssh://git@github.com/owner/repo.git)
  const schemeMatch = trimmed.match(
    /^(?:https?|ssh):\/\/(?:[^@/]+@)?github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?\/?$/,
  );
  if (schemeMatch?.groups?.owner && schemeMatch.groups?.repo) {
    return {
      owner: schemeMatch.groups.owner,
      repo: schemeMatch.groups.repo,
    };
  }

  // SCP-style SSH URL (e.g., git@github.com:owner/repo.git)
  const scpMatch = trimmed.match(
    /^git@github\.com:(?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?\/?$/,
  );
  if (scpMatch?.groups?.owner && scpMatch.groups?.repo) {
    return {
      owner: scpMatch.groups.owner,
      repo: scpMatch.groups.repo,
    };
  }

  throw new Error(
    `Unable to parse GitHub owner/repo from git remote origin URL: "${trimmed}". Host must be github.com.`,
  );
}

/**
 * Resolve the origin remote URL from git and parse owner and repository name.
 * @returns {{ owner: string, repo: string }}
 */
function resolveOriginTarget() {
  let remoteUrl;
  try {
    remoteUrl = runSubprocess("git", ["remote", "get-url", "origin"]);
  } catch (error) {
    throw new Error(
      `Failed to resolve git remote "origin": ${formatErrorMessage(error)}`,
      { cause: error },
    );
  }

  return parseOriginUrl(remoteUrl);
}

/**
 * Load and validate canonical labels from .github/labels.yml.
 * @param {string} repoRoot
 * @returns {CanonicalLabel[]}
 */
function loadCanonicalLabels(repoRoot) {
  const labelsPath = path.join(repoRoot, ".github", "labels.yml");
  if (!fs.existsSync(labelsPath)) {
    throw new Error(`Canonical label file not found at ${labelsPath}`);
  }

  const raw = fs.readFileSync(labelsPath, "utf8");
  const parsed = yaml.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`.github/labels.yml must contain a YAML array of labels.`);
  }

  for (const item of parsed) {
    if (
      !item ||
      typeof item.name !== "string" ||
      typeof item.color !== "string" ||
      typeof item.description !== "string"
    ) {
      throw new Error(
        `Invalid label entry in .github/labels.yml: ${JSON.stringify(item)}`,
      );
    }
  }

  return parsed;
}

/**
 * Fetch repository metadata via gh api.
 * Cross-checks returned full_name against target owner and repository.
 * @param {string} owner
 * @param {string} repo
 * @returns {Record<string, unknown>}
 */
function fetchRepoMetadata(owner, repo) {
  const output = runSubprocess("gh", ["api", `/repos/${owner}/${repo}`]);
  /** @type {Record<string, unknown>} */
  const metadata = JSON.parse(output);

  const expectedFullName = `${owner}/${repo}`.toLowerCase();
  const observedFullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name.toLowerCase()
      : "";
  if (observedFullName !== expectedFullName) {
    throw new Error(
      `Repository full_name crosscheck failed: origin target "${owner}/${repo}" does not match API metadata full_name "${metadata.full_name}".`,
    );
  }

  return metadata;
}

/**
 * Fetch all labels for the repository via gh api.
 * @param {string} owner
 * @param {string} repo
 * @returns {RepoLabel[]}
 */
function fetchRepoLabels(owner, repo) {
  const output = runSubprocess("gh", [
    "api",
    "--paginate",
    `/repos/${owner}/${repo}/labels`,
  ]);
  return JSON.parse(output);
}

/**
 * Normalize a hex color string for comparison (removes leading # and lowercases).
 * @param {string} color
 * @returns {string}
 */
function normalizeColor(color) {
  return color.replace(/^#/, "").trim().toLowerCase();
}

/**
 * Check if label attributes match canonical expectations.
 * @param {RepoLabel} observed
 * @param {CanonicalLabel} canonical
 * @returns {boolean}
 */
function labelAttributesMatch(observed, canonical) {
  const colorMatches =
    normalizeColor(observed.color) === normalizeColor(canonical.color);
  const descMatches =
    (observed.description || "").trim() ===
    (canonical.description || "").trim();
  const nameCaseMatches = observed.name === canonical.name;
  return colorMatches && descMatches && nameCaseMatches;
}

/**
 * Reconcile current repository labels against canonical labels.
 * Factors label diffing shared between check mode and apply mode.
 * @param {CanonicalLabel[]} canonicalLabels
 * @param {RepoLabel[]} repoLabels
 * @returns {{
 *   additions: CanonicalLabel[],
 *   updates: Array<{ canonical: CanonicalLabel, existing: RepoLabel }>,
 *   stockDeletions: RepoLabel[],
 *   preservedCustom: RepoLabel[]
 * }}
 */
function diffLabels(canonicalLabels, repoLabels) {
  const canonicalMap = new Map(
    canonicalLabels.map((l) => [l.name.toLowerCase(), l]),
  );
  const repoMap = new Map(repoLabels.map((l) => [l.name.toLowerCase(), l]));

  /** @type {CanonicalLabel[]} */
  const additions = [];
  /** @type {Array<{ canonical: CanonicalLabel, existing: RepoLabel }>} */
  const updates = [];
  /** @type {RepoLabel[]} */
  const stockDeletions = [];
  /** @type {RepoLabel[]} */
  const preservedCustom = [];

  for (const [nameLower, canonical] of canonicalMap.entries()) {
    const existing = repoMap.get(nameLower);
    if (!existing) {
      additions.push(canonical);
    } else if (!labelAttributesMatch(existing, canonical)) {
      updates.push({ canonical, existing });
    }
  }

  for (const [nameLower, existing] of repoMap.entries()) {
    if (!canonicalMap.has(nameLower)) {
      if (existing.default === true) {
        stockDeletions.push(existing);
      } else {
        preservedCustom.push(existing);
      }
    }
  }

  return { additions, updates, stockDeletions, preservedCustom };
}

/**
 * Run canonical labels check.
 * Distinguishes stock default labels to delete vs preserved custom labels.
 * @param {string} owner
 * @param {string} repo
 * @param {string} repoRoot
 * @returns {{ status: "pass" | "mismatch" | "error" }}
 */
function checkLabels(owner, repo, repoRoot) {
  try {
    const canonicalLabels = loadCanonicalLabels(repoRoot);
    const repoLabels = fetchRepoLabels(owner, repo);
    const { additions, updates, stockDeletions, preservedCustom } = diffLabels(
      canonicalLabels,
      repoLabels,
    );

    const hasMismatches =
      additions.length > 0 ||
      updates.length > 0 ||
      stockDeletions.length > 0 ||
      preservedCustom.length > 0;

    if (!hasMismatches) {
      console.log(
        `[PASS] Labels: Canonical label set (${canonicalLabels.length} labels) matches repository labels exactly.`,
      );
      return { status: "pass" };
    }

    console.log(`[FAIL] Labels: Differences detected:`);
    if (additions.length > 0) {
      console.log(`  - Additions (missing canonical labels to create):`);
      for (const item of additions) {
        console.log(
          `    * ${item.name} (color: #${normalizeColor(item.color)}, desc: "${item.description}")`,
        );
      }
    }
    if (updates.length > 0) {
      console.log(`  - Updates (canonical labels needing modification):`);
      for (const item of updates) {
        console.log(
          `    * ${item.canonical.name}: expected (name: "${item.canonical.name}", color: #${normalizeColor(item.canonical.color)}, desc: "${item.canonical.description}"), observed (name: "${item.existing.name}", color: #${normalizeColor(item.existing.color)}, desc: "${item.existing.description}")`,
        );
      }
    }
    if (stockDeletions.length > 0) {
      console.log(`  - Deletions (GitHub stock default labels to delete):`);
      for (const item of stockDeletions) {
        console.log(`    * ${item.name}`);
      }
    }
    if (preservedCustom.length > 0) {
      console.log(
        `  - Preserved custom labels (non-default labels preserved for separate review):`,
      );
      for (const item of preservedCustom) {
        console.log(`    * ${item.name}`);
      }
    }

    return { status: "mismatch" };
  } catch (error) {
    console.error(`[ERROR] Labels check failed: ${formatErrorMessage(error)}`);
    return { status: "error" };
  }
}

/**
 * Run delete-branch-on-merge check.
 * @param {string} owner
 * @param {string} repo
 * @param {Record<string, unknown>} repoMetadata
 * @returns {{ status: "pass" | "mismatch" | "error" }}
 */
function checkDeleteBranchOnMerge(owner, repo, repoMetadata) {
  if (typeof repoMetadata.delete_branch_on_merge !== "boolean") {
    console.error(
      `[ERROR] Delete-branch-on-merge: Unable to inspect delete_branch_on_merge on ${owner}/${repo} (metadata absent or invalid: ${JSON.stringify(repoMetadata.delete_branch_on_merge)}). Requires repository admin access.`,
    );
    return { status: "error" };
  }

  if (repoMetadata.delete_branch_on_merge === true) {
    console.log(
      `[PASS] Delete-branch-on-merge: Enabled on repository ${owner}/${repo}.`,
    );
    return { status: "pass" };
  }

  console.log(
    `[FAIL] Delete-branch-on-merge: Disabled on repository ${owner}/${repo} (expected: true, observed: false).`,
  );
  return { status: "mismatch" };
}

/**
 * Fetch all fields for a project node, paginating if needed.
 * @param {string} projectId
 * @param {ProjectFieldNode[]} initialNodes
 * @param {boolean} hasMore
 * @param {string | null} cursor
 * @returns {ProjectFieldNode[]}
 */
function fetchAllProjectFields(projectId, initialNodes, hasMore, cursor) {
  const fields = [...initialNodes];
  let hasNext = hasMore;
  let currentCursor = cursor;

  const fieldsQuery = `
    query($projectId: ID!, $after: String) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 50, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              ... on ProjectV2SingleSelectField {
                name
                options { name }
              }
            }
          }
        }
      }
    }
  `;

  while (hasNext) {
    /** @type {string[]} */
    const args = [
      "api",
      "graphql",
      "-f",
      `query=${fieldsQuery}`,
      "-f",
      `projectId=${projectId}`,
    ];
    if (currentCursor) {
      args.push("-f", `after=${currentCursor}`);
    }

    const output = runSubprocess("gh", args);
    /** @type {{ data?: { node?: { fields?: { pageInfo?: { hasNextPage: boolean, endCursor?: string }, nodes?: ProjectFieldNode[] } } }, errors?: Array<{ message: string }> }} */
    const res = JSON.parse(output);

    if (res.errors && res.errors.length > 0) {
      throw new Error(
        `GraphQL error querying project fields: ${res.errors.map((e) => e.message).join("; ")}`,
      );
    }

    const fieldsData = res.data?.node?.fields;
    if (!fieldsData || !Array.isArray(fieldsData.nodes)) {
      throw new Error(`Malformed fields data for project ${projectId}`);
    }

    for (const f of fieldsData.nodes) {
      fields.push(f);
    }

    hasNext = Boolean(fieldsData.pageInfo?.hasNextPage);
    if (hasNext) {
      const nextCursor = fieldsData.pageInfo?.endCursor;
      if (!nextCursor || typeof nextCursor !== "string" || !nextCursor.trim()) {
        throw new Error(
          `GraphQL pagination error: fields hasNextPage is true but endCursor is missing or empty for project ${projectId}`,
        );
      }
      currentCursor = nextCursor.trim();
    } else {
      currentCursor = null;
    }
  }

  return fields;
}

/**
 * Fetch all linked projects for a repository with complete pagination.
 * @param {string} owner
 * @param {string} repo
 * @returns {ProjectNode[]}
 */
function fetchLinkedProjects(owner, repo) {
  /** @type {ProjectNode[]} */
  const allProjects = [];
  let hasNextPage = true;
  /** @type {string | null} */
  let afterCursor = null;

  const projectQuery = `
    query($owner: String!, $repo: String!, $after: String) {
      repository(owner: $owner, name: $repo) {
        projectsV2(first: 20, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            title
            number
            url
            owner {
              __typename
              ... on User { login }
              ... on Organization { login }
            }
            fields(first: 50) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                ... on ProjectV2SingleSelectField {
                  name
                  options { name }
                }
              }
            }
          }
        }
      }
    }
  `;

  while (hasNextPage) {
    /** @type {string[]} */
    const args = [
      "api",
      "graphql",
      "-f",
      `query=${projectQuery}`,
      "-f",
      `owner=${owner}`,
      "-f",
      `repo=${repo}`,
    ];
    if (afterCursor) {
      args.push("-f", `after=${afterCursor}`);
    }

    const output = runSubprocess("gh", args);
    /** @type {{ data?: { repository?: { projectsV2?: { pageInfo?: { hasNextPage: boolean, endCursor?: string }, nodes?: ProjectNode[] } } }, errors?: Array<{ message: string }> }} */
    const response = JSON.parse(output);

    if (response.errors && response.errors.length > 0) {
      const errorDetails = response.errors.map((e) => e.message).join("; ");
      throw new Error(`GraphQL query returned errors: ${errorDetails}`);
    }

    const projectsData = response.data?.repository?.projectsV2;
    if (
      !projectsData ||
      !Array.isArray(projectsData.nodes) ||
      !projectsData.pageInfo ||
      typeof projectsData.pageInfo.hasNextPage !== "boolean"
    ) {
      throw new Error(
        `Malformed GraphQL response: missing projectsV2 nodes or pageInfo.`,
      );
    }

    for (const proj of projectsData.nodes) {
      if (!proj || typeof proj !== "object" || typeof proj.id !== "string") {
        throw new Error(
          `Malformed project node in GraphQL response: ${JSON.stringify(proj)}`,
        );
      }

      // Check if project fields require further pagination
      if (!proj.fields || !Array.isArray(proj.fields.nodes)) {
        throw new Error(
          `Malformed fields data in project #${proj.number} (${proj.title})`,
        );
      }

      if (proj.fields.pageInfo?.hasNextPage) {
        const allFields = fetchAllProjectFields(
          proj.id,
          proj.fields.nodes,
          proj.fields.pageInfo.hasNextPage,
          proj.fields.pageInfo.endCursor || null,
        );
        proj.fields = {
          ...proj.fields,
          nodes: allFields,
        };
      }

      allProjects.push(proj);
    }

    hasNextPage = projectsData.pageInfo.hasNextPage;
    if (hasNextPage) {
      const nextCursor = projectsData.pageInfo.endCursor;
      if (!nextCursor || typeof nextCursor !== "string" || !nextCursor.trim()) {
        throw new Error(
          `GraphQL pagination error: projectsV2 hasNextPage is true but endCursor is missing or empty.`,
        );
      }
      afterCursor = nextCursor.trim();
    } else {
      afterCursor = null;
    }
  }

  return allProjects;
}

/**
 * Run linked Project check.
 * @param {string} owner
 * @param {string} repo
 * @returns {{ status: "pass" | "mismatch" | "error" }}
 */
function checkLinkedProjects(owner, repo) {
  try {
    const projects = fetchLinkedProjects(owner, repo);

    /** @type {ProjectNode[]} */
    const qualifyingProjects = [];
    /** @type {Array<{ title: string, number: number, ownerLogin?: string, statusOptions: string[] }>} */
    const nonQualifyingProjects = [];

    for (const proj of projects) {
      const isUserOwner =
        proj.owner?.__typename === "User" &&
        proj.owner?.login?.toLowerCase() === owner.toLowerCase();

      let hasExactStatusNames = false;
      /** @type {string[]} */
      let observedStatusNames = [];

      const fields = proj.fields?.nodes || [];
      const statusField = fields.find((/** @type {ProjectFieldNode} */ f) =>
        Boolean(f && f.name === "Status" && Array.isArray(f.options)),
      );

      if (statusField && statusField.options) {
        observedStatusNames = statusField.options.map(
          (/** @type {ProjectStatusOption} */ o) => o.name,
        );
        const nameSet = new Set(observedStatusNames);
        if (
          nameSet.size === REQUIRED_STATUS_NAMES.length &&
          REQUIRED_STATUS_NAMES.every((name) => nameSet.has(name))
        ) {
          hasExactStatusNames = true;
        }
      }

      if (isUserOwner && hasExactStatusNames) {
        qualifyingProjects.push(proj);
      } else {
        nonQualifyingProjects.push({
          title: proj.title,
          number: proj.number,
          ownerLogin: proj.owner?.login,
          statusOptions: observedStatusNames,
        });
      }
    }

    if (qualifyingProjects.length === 1) {
      const q = qualifyingProjects[0];
      console.log(
        `[PASS] Linked Project: Found qualifying same-owner user Project #${q.number} "${q.title}" (${q.url}) with required Status names.`,
      );
      return { status: "pass" };
    }

    if (qualifyingProjects.length === 0) {
      console.log(
        `[FAIL] Linked Project: No qualifying user-level same-owner Project found with exact Status options [${REQUIRED_STATUS_NAMES.join(", ")}].`,
      );
      if (nonQualifyingProjects.length > 0) {
        console.log(`  Observed non-qualifying linked projects:`);
        for (const nq of nonQualifyingProjects) {
          console.log(
            `  - Project #${nq.number} "${nq.title}" (owner: ${nq.ownerLogin ?? "unknown"}, status options: [${nq.statusOptions.join(", ")}])`,
          );
        }
      }
      return { status: "mismatch" };
    }

    console.log(
      `[FAIL] Linked Project: Ambiguity detected. Found ${qualifyingProjects.length} qualifying Projects:`,
    );
    for (const q of qualifyingProjects) {
      console.log(`  - Project #${q.number} "${q.title}" (${q.url})`);
    }
    return { status: "mismatch" };
  } catch (error) {
    console.error(
      `[ERROR] Linked Projects check failed: ${formatErrorMessage(error)}`,
    );
    return { status: "error" };
  }
}

/**
 * Run CLAUDE.md symlink check.
 * @param {string} repoRoot
 * @returns {{ status: "pass" | "mismatch" | "error" }}
 */
function checkClaudeSymlink(repoRoot) {
  try {
    const claudePath = path.join(repoRoot, "CLAUDE.md");
    if (!fs.existsSync(claudePath)) {
      console.log(`[FAIL] Symlink: CLAUDE.md does not exist.`);
      return { status: "mismatch" };
    }

    const stat = fs.lstatSync(claudePath);
    if (!stat.isSymbolicLink()) {
      console.log(
        `[FAIL] Symlink: CLAUDE.md exists but is not a symbolic link.`,
      );
      return { status: "mismatch" };
    }

    const target = fs.readlinkSync(claudePath);
    if (target === "AGENTS.md" || target === "./AGENTS.md") {
      console.log(
        `[PASS] Symlink: CLAUDE.md is a symlink targeting ${target}.`,
      );
      return { status: "pass" };
    }

    console.log(
      `[FAIL] Symlink: CLAUDE.md targets "${target}" instead of "AGENTS.md".`,
    );
    return { status: "mismatch" };
  } catch (error) {
    console.error(`[ERROR] Symlink check failed: ${formatErrorMessage(error)}`);
    return { status: "error" };
  }
}

/**
 * Run Contribution guide contact URL check.
 * Validates required default_branch without fallback.
 * @param {string} owner
 * @param {string} repo
 * @param {string} repoRoot
 * @param {Record<string, unknown>} repoMetadata
 * @returns {{ status: "pass" | "mismatch" | "error" }}
 */
function checkContributionGuideContactUrl(owner, repo, repoRoot, repoMetadata) {
  try {
    if (
      typeof repoMetadata.default_branch !== "string" ||
      !repoMetadata.default_branch.trim()
    ) {
      console.error(
        `[ERROR] Contact URL: Repository default_branch metadata is absent or invalid (${JSON.stringify(repoMetadata.default_branch)}).`,
      );
      return { status: "error" };
    }

    const defaultBranch = repoMetadata.default_branch.trim();
    const expectedUrl = `https://github.com/${owner}/${repo}/blob/${defaultBranch}/CONTRIBUTING.md`;

    const configPath = path.join(
      repoRoot,
      ".github",
      "ISSUE_TEMPLATE",
      "config.yml",
    );
    if (!fs.existsSync(configPath)) {
      console.log(
        `[FAIL] Contact URL: .github/ISSUE_TEMPLATE/config.yml does not exist.`,
      );
      return { status: "mismatch" };
    }

    const configRaw = fs.readFileSync(configPath, "utf8");
    /** @type {{ contact_links?: ContactLink[] }} */
    const configParsed = yaml.parse(configRaw);
    const contactLinks = configParsed?.contact_links || [];
    const contribLink = contactLinks.find((/** @type {ContactLink} */ l) =>
      Boolean(l && l.name === "Contribution guide"),
    );

    if (!contribLink) {
      console.log(
        `[FAIL] Contact URL: "Contribution guide" link not found in config.yml contact_links.`,
      );
      return { status: "mismatch" };
    }

    if (contribLink.url === expectedUrl) {
      console.log(
        `[PASS] Contact URL: Contribution guide URL points to ${expectedUrl}.`,
      );
      return { status: "pass" };
    }

    console.log(
      `[FAIL] Contact URL: Expected "${expectedUrl}", observed "${contribLink.url}".`,
    );
    return { status: "mismatch" };
  } catch (error) {
    console.error(
      `[ERROR] Contact URL check failed: ${formatErrorMessage(error)}`,
    );
    return { status: "error" };
  }
}

/**
 * Run CI check for checked-out local HEAD.
 * Handles paginated runs via --slurp and verifies response shape.
 * @param {string} owner
 * @param {string} repo
 * @returns {{ status: "pass" | "mismatch" | "error" }}
 */
function checkCiRuns(owner, repo) {
  try {
    let headSha;
    try {
      headSha = runSubprocess("git", ["rev-parse", "HEAD"]).trim();
    } catch (error) {
      throw new Error(
        `Failed to resolve local git HEAD: ${formatErrorMessage(error)}`,
        { cause: error },
      );
    }

    const runsOutput = runSubprocess("gh", [
      "api",
      "--paginate",
      "--slurp",
      `/repos/${owner}/${repo}/actions/runs?head_sha=${headSha}`,
    ]);

    const parsed = JSON.parse(runsOutput);
    if (!Array.isArray(parsed)) {
      throw new Error(
        `Unexpected API response format for Actions runs: expected JSON array from --slurp, received ${typeof parsed}`,
      );
    }

    for (const page of parsed) {
      if (
        !page ||
        typeof page !== "object" ||
        !Array.isArray(page.workflow_runs)
      ) {
        throw new Error(
          `Malformed API response for Actions runs: page missing workflow_runs array (${JSON.stringify(page)})`,
        );
      }
    }

    /** @type {WorkflowRun[]} */
    const workflowRuns = parsed.flatMap((p) => p.workflow_runs);

    if (workflowRuns.length === 0) {
      console.log(
        `[FAIL] CI runs: No workflow runs found for local HEAD commit ${headSha}.`,
      );
      return { status: "mismatch" };
    }

    let allPassed = true;
    console.log(
      `[INFO] CI runs: Found ${workflowRuns.length} run(s) for local HEAD ${headSha}:`,
    );
    for (const run of workflowRuns) {
      const isSuccess =
        run.status === "completed" && run.conclusion === "success";
      if (!isSuccess) {
        allPassed = false;
      }
      console.log(
        `  - [${run.status}/${run.conclusion ?? "pending"}] ${run.name} (event: ${run.event}, branch: ${run.head_branch}, URL: ${run.html_url})`,
      );
    }

    if (allPassed) {
      console.log(
        `[PASS] CI runs: All workflow runs for local HEAD ${headSha} completed successfully.`,
      );
      return { status: "pass" };
    }

    console.log(
      `[FAIL] CI runs: One or more workflow runs for local HEAD ${headSha} are pending or failed.`,
    );
    return { status: "mismatch" };
  } catch (error) {
    console.error(`[ERROR] CI check failed: ${formatErrorMessage(error)}`);
    return { status: "error" };
  }
}

/**
 * Run check mode across all categories.
 * @param {string} owner
 * @param {string} repo
 * @param {string} repoRoot
 * @param {Record<string, unknown>} repoMetadata
 * @returns {number} Exit code: 0 if all pass, 1 if missing/mismatched/pending, 2 on inspection/tool failure.
 */
function runCheckMode(owner, repo, repoRoot, repoMetadata) {
  console.log(`\n=== Running Bootstrap Check for ${owner}/${repo} ===\n`);

  let hasMissingOrMismatch = false;
  let hasInspectionFailure = false;

  const results = [
    checkLabels(owner, repo, repoRoot),
    checkDeleteBranchOnMerge(owner, repo, repoMetadata),
    checkLinkedProjects(owner, repo),
    checkClaudeSymlink(repoRoot),
    checkContributionGuideContactUrl(owner, repo, repoRoot, repoMetadata),
    checkCiRuns(owner, repo),
  ];

  for (const res of results) {
    if (res.status === "error") {
      hasInspectionFailure = true;
    } else if (res.status === "mismatch") {
      hasMissingOrMismatch = true;
    }
  }

  console.log("\n----------------------------------------");
  if (hasInspectionFailure) {
    console.error(
      "Overall Result: Inability to inspect one or more categories (tool or API failure).",
    );
    return 2;
  }
  if (hasMissingOrMismatch) {
    console.log(
      "Overall Result: Bootstrap setup incomplete or mismatched (missing/pending setup).",
    );
    return 1;
  }

  console.log("Overall Result: All bootstrap checks passed successfully.");
  return 0;
}

/**
 * Print a summary of apply effects and outcomes.
 * @param {string[]} successful
 * @param {string[]} attempted
 * @param {string[]} failed
 */
function reportApplyOutcome(successful, attempted, failed) {
  console.log(`\nApply Execution Summary:`);
  console.log(`- Attempted effects (${attempted.length}):`);
  for (const item of attempted) {
    console.log(`  * ${item}`);
  }
  console.log(`- Successful effects (${successful.length}):`);
  for (const item of successful) {
    console.log(`  * ${item}`);
  }
  if (failed.length > 0) {
    console.error(`- Failed/unknown outcomes (${failed.length}):`);
    for (const item of failed) {
      console.error(`  * ${item}`);
    }
  }
}

/**
 * Run apply mode.
 * Reconciles canonical labels and delete-on-merge setting only.
 * Verifies exact case names, colors, descriptions, setting, and stock deletions via readback.
 * @param {string} owner
 * @param {string} repo
 * @param {string} repoRoot
 * @param {Record<string, unknown>} repoMetadata
 * @returns {number} Exit code: 0 on success, 2 on refusal, error, or incomplete readback.
 */
function runApplyMode(owner, repo, repoRoot, repoMetadata) {
  console.log(`\n=== Running Bootstrap Apply for ${owner}/${repo} ===\n`);

  if (typeof repoMetadata.is_template !== "boolean") {
    console.error(
      `Refusal: Unable to inspect target repository template status (is_template metadata absent or invalid). Apply mode refuses mutation when template status cannot be verified.`,
    );
    return 2;
  }

  if (repoMetadata.is_template === true) {
    console.error(
      `Refusal: Repository ${owner}/${repo} is marked as a template (is_template: true). Apply mode refuses mutation of template repositories.`,
    );
    return 2;
  }

  /** @type {string[]} */
  const successfulEffects = [];
  /** @type {string[]} */
  const attemptedEffects = [];
  /** @type {string[]} */
  const failedEffects = [];
  /** @type {string[]} */
  const deletedStockNames = [];

  /**
   * Helper to execute a single mutation and track outcome.
   * @param {string} desc
   * @param {() => void} action
   * @returns {boolean}
   */
  function executeMutation(desc, action) {
    attemptedEffects.push(desc);
    try {
      console.log(`${desc}...`);
      action();
      successfulEffects.push(desc);
      return true;
    } catch (error) {
      console.error(`Failed to ${desc}: ${formatErrorMessage(error)}`);
      failedEffects.push(`${desc}: ${formatErrorMessage(error)}`);
      return false;
    }
  }

  /** @type {CanonicalLabel[]} */
  let canonicalLabels;
  try {
    canonicalLabels = loadCanonicalLabels(repoRoot);
  } catch (error) {
    console.error(
      `Failed to load canonical labels: ${formatErrorMessage(error)}`,
    );
    failedEffects.push(`Load canonical labels: ${formatErrorMessage(error)}`);
    reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
    return 2;
  }

  /** @type {RepoLabel[]} */
  let initialLabels;
  try {
    initialLabels = fetchRepoLabels(owner, repo);
  } catch (error) {
    console.error(
      `Failed to fetch current repository labels: ${formatErrorMessage(error)}`,
    );
    failedEffects.push(
      `Fetch current repository labels: ${formatErrorMessage(error)}`,
    );
    reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
    return 2;
  }

  const { additions, updates, stockDeletions, preservedCustom } = diffLabels(
    canonicalLabels,
    initialLabels,
  );

  // 1. Enable delete-on-merge if needed
  if (repoMetadata.delete_branch_on_merge !== true) {
    const ok = executeMutation(
      `enable delete_branch_on_merge on ${owner}/${repo}`,
      () => {
        runSubprocess("gh", [
          "api",
          "-X",
          "PATCH",
          `/repos/${owner}/${repo}`,
          "-F",
          "delete_branch_on_merge=true",
        ]);
      },
    );
    if (!ok) {
      reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
      return 2;
    }
  } else {
    console.log(`delete_branch_on_merge is already enabled.`);
  }

  // 2. Reconcile labels: additions
  for (const canonical of additions) {
    const ok = executeMutation(
      `create canonical label "${canonical.name}"`,
      () => {
        runSubprocess("gh", [
          "api",
          "-X",
          "POST",
          `/repos/${owner}/${repo}/labels`,
          "-f",
          `name=${canonical.name}`,
          "-f",
          `color=${normalizeColor(canonical.color)}`,
          "-f",
          `description=${canonical.description}`,
        ]);
      },
    );
    if (!ok) {
      reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
      return 2;
    }
  }

  // Reconcile labels: updates
  for (const { canonical, existing } of updates) {
    const ok = executeMutation(
      `update canonical label "${canonical.name}"`,
      () => {
        runSubprocess("gh", [
          "api",
          "-X",
          "PATCH",
          `/repos/${owner}/${repo}/labels/${encodeURIComponent(existing.name)}`,
          "-f",
          `new_name=${canonical.name}`,
          "-f",
          `color=${normalizeColor(canonical.color)}`,
          "-f",
          `description=${canonical.description}`,
        ]);
      },
    );
    if (!ok) {
      reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
      return 2;
    }
  }

  // Delete ONLY GitHub stock default labels that are not in canonical set
  for (const stock of stockDeletions) {
    deletedStockNames.push(stock.name);
    const ok = executeMutation(
      `delete GitHub stock default label "${stock.name}"`,
      () => {
        runSubprocess("gh", [
          "api",
          "-X",
          "DELETE",
          `/repos/${owner}/${repo}/labels/${encodeURIComponent(stock.name)}`,
        ]);
      },
    );
    if (!ok) {
      reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
      return 2;
    }
  }

  // Preserved custom labels
  for (const custom of preservedCustom) {
    console.log(
      `Preserving non-default custom label "${custom.name}" for separate review.`,
    );
  }

  // 3. Read back and verify mutations
  console.log(`\nVerifying applied changes via readback...`);
  /** @type {string[]} */
  const readbackFailures = [];

  let readbackMetadata;
  try {
    readbackMetadata = fetchRepoMetadata(owner, repo);
  } catch (error) {
    console.error(
      `Failed to read back repository metadata: ${formatErrorMessage(error)}`,
    );
    failedEffects.push(
      `Readback repository metadata: ${formatErrorMessage(error)}`,
    );
    reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
    return 2;
  }

  if (readbackMetadata.delete_branch_on_merge !== true) {
    readbackFailures.push(
      `delete_branch_on_merge was not enabled on ${owner}/${repo} (observed: ${String(readbackMetadata.delete_branch_on_merge)})`,
    );
  }

  let readbackLabels;
  try {
    readbackLabels = fetchRepoLabels(owner, repo);
  } catch (error) {
    console.error(
      `Failed to read back repository labels: ${formatErrorMessage(error)}`,
    );
    failedEffects.push(
      `Readback repository labels: ${formatErrorMessage(error)}`,
    );
    reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
    return 2;
  }

  const readbackExactMap = new Map(readbackLabels.map((l) => [l.name, l]));
  const readbackLowerMap = new Map(
    readbackLabels.map((l) => [l.name.toLowerCase(), l]),
  );

  for (const canonical of canonicalLabels) {
    const exactObserved = readbackExactMap.get(canonical.name);
    if (!exactObserved) {
      const lowerObserved = readbackLowerMap.get(canonical.name.toLowerCase());
      if (lowerObserved) {
        readbackFailures.push(
          `Canonical label "${canonical.name}" exact case name not applied (observed casing: "${lowerObserved.name}")`,
        );
      } else {
        readbackFailures.push(
          `Canonical label "${canonical.name}" missing from repository after apply`,
        );
      }
    } else if (!labelAttributesMatch(exactObserved, canonical)) {
      readbackFailures.push(
        `Canonical label "${canonical.name}" attributes mismatch (expected color: #${normalizeColor(canonical.color)}, desc: "${canonical.description}"; observed color: #${normalizeColor(exactObserved.color)}, desc: "${exactObserved.description}")`,
      );
    }
  }

  for (const stockName of deletedStockNames) {
    if (readbackLowerMap.has(stockName.toLowerCase())) {
      readbackFailures.push(
        `Stock default label "${stockName}" was not deleted and remains in repository`,
      );
    }
  }

  if (readbackFailures.length > 0) {
    console.error(`\n[ERROR] Readback verification failed:`);
    for (const fail of readbackFailures) {
      console.error(`  - ${fail}`);
      failedEffects.push(`Readback verification: ${fail}`);
    }
    reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
    return 2;
  }

  console.log(`Apply completed and verified successfully.`);
  reportApplyOutcome(successfulEffects, attemptedEffects, failedEffects);
  return 0;
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (args.length !== 1 || (mode !== "check" && mode !== "apply")) {
    console.error("Usage: node scripts/bootstrap-website.mjs <check|apply>");
    process.exit(2);
  }

  let target;
  try {
    target = resolveOriginTarget();
  } catch (error) {
    console.error(`Target resolution error: ${formatErrorMessage(error)}`);
    process.exit(2);
  }

  console.log(`Target repository: ${target.owner}/${target.repo}`);

  let repoMetadata;
  try {
    repoMetadata = fetchRepoMetadata(target.owner, target.repo);
  } catch (error) {
    console.error(
      `Failed to fetch metadata for target repository ${target.owner}/${target.repo}: ${formatErrorMessage(error)}`,
    );
    process.exit(2);
  }

  const repoRoot = process.cwd();

  if (mode === "check") {
    const exitCode = runCheckMode(
      target.owner,
      target.repo,
      repoRoot,
      repoMetadata,
    );
    process.exit(exitCode);
  } else {
    const exitCode = runApplyMode(
      target.owner,
      target.repo,
      repoRoot,
      repoMetadata,
    );
    process.exit(exitCode);
  }
}

main();
