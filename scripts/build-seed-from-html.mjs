/**
 * Converts lib/seed.html (ChatGPT export) → lib/seedConversation.data.json
 * Run: pnpm run build-seed
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const htmlPath = join(root, "lib", "seed.html");
const outPath = join(root, "lib", "seedConversation.data.json");

const LANG_HINT = {
  rust: "rust",
  toml: "toml",
  json: "json",
  javascript: "javascript",
  typescript: "typescript",
  bash: "bash",
  shell: "bash",
  python: "python",
  yaml: "yaml",
  dockerfile: "dockerfile",
  markdown: "markdown",
  text: "text",
  plaintext: "text",
  diff: "diff",
  sql: "sql",
  html: "html",
  css: "css",
  wasm: "wasm",
  cargo: "toml",
};

function normalizeLang(label) {
  const raw = label.trim().toLowerCase().replace(/\s+/g, "");
  if (LANG_HINT[raw]) return LANG_HINT[raw];
  const m = label.match(/\.([a-z0-9]+)$/i);
  if (m) {
    const ext = m[1].toLowerCase();
    const fromExt = {
      rs: "rust",
      toml: "toml",
      json: "json",
      ts: "typescript",
      tsx: "tsx",
      js: "javascript",
      jsx: "javascript",
      md: "markdown",
      yml: "yaml",
      yaml: "yaml",
      sh: "bash",
      bash: "bash",
    };
    if (fromExt[ext]) return fromExt[ext];
  }
  return raw || "text";
}

function cmContentToText($, cm) {
  const el = $(cm).clone();
  el.find("br").replaceWith("\n");
  return el.text();
}

function replaceCodeMirrorBlocks($, rootEl) {
  rootEl.find("pre").each((_, pre) => {
    const $pre = $(pre);
    const cm = $pre.find(".cm-content").first();
    if (!cm.length) return;

    let label = "";
    const header = $pre
      .find(
        ".sticky .text-token-text-primary, [class*='text-token-text-primary']"
      )
      .first();
    if (header.length) {
      label = header.clone().children().remove().end().text().trim();
    }
    if (!label) {
      label = $pre.find(".sticky div").first().text().trim();
    }

    const lang = normalizeLang(label.split("\n")[0] || "text");
    const code = cmContentToText($, cm);
    const codeEl = $("<pre><code></code></pre>");
    codeEl.find("code").attr("class", `language-${lang}`).text(code);
    $pre.replaceWith(codeEl);
  });
}

const html = readFileSync(htmlPath, "utf8");
const $ = cheerio.load(html, { decodeEntities: false });

const messages = [];
const baseTime = Date.now();

$('section[data-turn="user"], section[data-turn="assistant"]').each(
  (turnIndex, section) => {
    const $sec = $(section);
    const turn = $sec.attr("data-turn");
    const turnId =
      $sec.attr("data-turn-id") ?? `seed-${turnIndex + 1}`;

    if (turn === "user") {
      const text = $sec.find(".whitespace-pre-wrap").first().text().trim();
      if (!text) return;
      messages.push({
        id: turnId,
        role: "user",
        content: text,
        createdAt: baseTime + turnIndex * 1000,
      });
      return;
    }

    if (turn === "assistant") {
      const mdRoot = $sec.find(".markdown").first();
      if (!mdRoot.length) return;

      const clone = mdRoot.clone();
      clone.find("button").remove();
      clone.find("svg").remove();
      replaceCodeMirrorBlocks($, clone);

      clone.find("a[data-testid='webpage-citation-pill']").each((_, a) => {
        const $a = $(a);
        const href = $a.attr("href") || "#";
        const host = (() => {
          try {
            return new URL(href).hostname;
          } catch {
            return "link";
          }
        })();
        $a.replaceWith(`[${host}](${href})`);
      });

      const turndown = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        bulletListMarker: "-",
      });
      turndown.use(gfm);

      let md = turndown.turndown(
        `<div data-seed-root>${clone.html() || ""}</div>`
      );
      md = md.replace(/\n{3,}/g, "\n\n").trim();

      messages.push({
        id: turnId,
        role: "assistant",
        content: md,
        createdAt: baseTime + turnIndex * 1000,
      });
    }
  }
);

writeFileSync(outPath, JSON.stringify(messages, null, 2), "utf8");
console.log(
  `Wrote ${messages.length} messages to ${outPath} (from ${htmlPath})`
);
