#!/usr/bin/env node
/**
 * Regenerates the parts of the site that are derived from content/cv.json:
 *
 *   - the static, crawlable copy of the CV inside index.html
 *   - the header links, command chips and JSON-LD structured data
 *   - sitemap.xml
 *
 * Usage:  node tools/build.mjs          (rewrite files)
 *         node tools/build.mjs --check  (exit 1 if files are out of date)
 *
 * No dependencies. The live terminal reads cv.json directly, so the site
 * still works if this has not been run; only the static copy lags behind.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { buildCommands, contactLinks } from "../scripts/commands.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://vanowarna.com/";
const checkOnly = process.argv.includes("--check");

const escapeHtml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

/* ---------- Line models -> HTML (mirrors scripts/terminal.js) ---------- */

const partHtml = (part) => {
    const cls = part.cls ? ` class="${part.cls}"` : "";
    if (!part.href) return `<span${cls}>${escapeHtml(part.text)}</span>`;
    const external = /^https?:/i.test(part.href) ? ' target="_blank" rel="noopener noreferrer"' : "";
    const linkCls = ["terminal-link", part.cls].filter(Boolean).join(" ");
    return `<a class="${linkCls}" href="${escapeHtml(part.href)}"${external}>${escapeHtml(part.text)}</a>`;
};

const lineHtml = (model) => {
    if (model.blank) return '<div class="line blank"></div>';
    const classes = ["line", model.cls, model.indent ? `ind-${model.indent}` : "", model.marker ? "has-marker" : ""]
        .filter(Boolean)
        .join(" ");
    // Headings become real heading elements so the document outline is meaningful.
    const tag = model.cls === "heading" ? "h2" : model.cls === "sub" && model.marker ? "h3" : "div";
    const marker = model.marker ? `<span class="marker" aria-hidden="true">${escapeHtml(model.marker)}</span>` : "";
    return `<${tag} class="${classes}">${marker}<span class="text">${model.parts.map(partHtml).join("")}</span></${tag}>`;
};

/* ---------- Generated blocks ---------- */

const staticCv = (cv) => {
    const commands = buildCommands(cv);
    return commands.content
        .map((command) => command.run().map(lineHtml).join("\n"))
        .join('\n<div class="line blank"></div>\n');
};

const heroLinks = (cv) =>
    contactLinks(cv)
        .map((l) => {
            const external = /^https?:/i.test(l.url) ? ' target="_blank" rel="noopener noreferrer"' : "";
            return `<li><a href="${escapeHtml(l.url)}"${external}>${escapeHtml(l.label)}</a></li>`;
        })
        .join("\n");

const chips = (cv) => {
    const commands = buildCommands(cv);
    const chip = (name, cls = "") =>
        `<button type="button" class="chip${cls}" data-cmd="${escapeHtml(name)}">${escapeHtml(name)}</button>`;
    return [chip("ask", " chip--accent"), ...commands.list.map((c) => chip(c.name)), chip("clear", " chip--danger")].join("\n");
};

const jsonLd = (cv) => {
    const p = cv.profile;
    const section = (id) => (cv.sections || []).find((s) => s.id === id) || {};
    const data = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: p.name,
        alternateName: p.handle.toLowerCase(),
        url: SITE_URL,
        email: `mailto:${p.email}`,
        image: `${SITE_URL}assets/vanodhya-warnasooriya.jpg`,
        jobTitle: p.role,
        description: p.summary,
        sameAs: (p.links || []).map((l) => l.url),
        alumniOf: (section("edu").entries || []).map((e) => ({
            "@type": "CollegeOrUniversity",
            name: e.title.split(" — ")[0],
        })),
        knowsAbout: [
            ...(section("interests").items || []),
            ...Object.values(section("skills").groups || {}).flatMap((v) => v.split(/,\s*/)),
        ],
    };
    // "<" is escaped so content can never close the script element.
    const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
    return `<script type="application/ld+json">\n${json}\n</script>`;
};

const sitemap = (lastModified) =>
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${lastModified}</lastmod>
  </url>
</urlset>
`;

/* ---------- Apply ---------- */

const replaceBlock = (html, name, content) => {
    const pattern = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`);
    if (!pattern.test(html)) throw new Error(`index.html is missing the "${name}" build markers`);
    return html.replace(pattern, (_, open, close) => `${open}\n${content}\n${close}`);
};

const cvPath = path.join(ROOT, "content/cv.json");
const indexPath = path.join(ROOT, "index.html");
const sitemapPath = path.join(ROOT, "sitemap.xml");

const cv = JSON.parse(await readFile(cvPath, "utf8"));
const currentIndex = await readFile(indexPath, "utf8");

let nextIndex = currentIndex;
nextIndex = replaceBlock(nextIndex, "jsonld", jsonLd(cv));
nextIndex = replaceBlock(nextIndex, "hero-links", heroLinks(cv));
nextIndex = replaceBlock(nextIndex, "static-cv", staticCv(cv));
nextIndex = replaceBlock(nextIndex, "chips", chips(cv));

const indexChanged = nextIndex !== currentIndex;

if (checkOnly) {
    if (indexChanged) {
        console.error("index.html is out of date — run: node tools/build.mjs");
        process.exit(1);
    }
    console.log("index.html is up to date.");
} else {
    if (indexChanged) await writeFile(indexPath, nextIndex);
    // Only bump the sitemap date when the content actually changed.
    const existingSitemap = await readFile(sitemapPath, "utf8").catch(() => "");
    if (indexChanged || !existingSitemap) {
        await writeFile(sitemapPath, sitemap(new Date().toISOString().slice(0, 10)));
    }
    console.log(indexChanged ? "index.html and sitemap.xml regenerated." : "Nothing to do — already up to date.");
}
