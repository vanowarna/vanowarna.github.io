/**
 * Turns content/cv.json into terminal "lines".
 *
 * Pure module: no DOM access, so the same code renders the live terminal
 * (scripts/terminal.js) and the static, crawlable fallback (tools/build.mjs).
 *
 * A line is one of:
 *   { blank: true }
 *   { cls, indent, marker, parts: [{ text, href }] }
 */

const RULE = "─".repeat(40);

export const blank = () => ({ blank: true });

export const line = (text, cls = "", extra = {}) => ({
    cls,
    indent: 0,
    parts: [{ text }],
    ...extra,
});

const link = (text, href, extra = {}) => ({
    cls: "",
    indent: 0,
    parts: [{ text, href }],
    ...extra,
});

const rule = () => line(RULE, "dim rule");

const prettyUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/* ---------- Section renderers ---------- */

const entryLines = (entry) => {
    const out = [];
    const title = entry.tag ? `[${entry.tag}] ${entry.title}` : entry.title;
    out.push(line(title, "sub", { marker: "■" }));

    const byline = [entry.subtitle, entry.meta].filter(Boolean).join("  ·  ");
    if (byline) out.push(line(byline, "", { indent: 1 }));
    if (entry.details) out.push(line(entry.details, "dim", { indent: 1 }));
    (entry.bullets || []).forEach((b) => out.push(line(b, "", { indent: 1, marker: "·" })));
    if (entry.link) out.push(link(prettyUrl(entry.link), entry.link, { indent: 1, marker: "→" }));
    out.push(blank());
    return out;
};

export const sectionLines = (section) => {
    const out = [line(section.title, "heading"), blank()];

    (section.items || []).forEach((item) =>
        out.push(line(item, "", { marker: section.marker || "●" }))
    );

    Object.entries(section.groups || {}).forEach(([name, value]) => {
        out.push(line(name, "sub"));
        out.push(line(value, "", { indent: 1 }));
    });

    (section.entries || []).forEach((entry) => out.push(...entryLines(entry)));

    // Entries end with their own spacer; drop it so sections do not end on a gap.
    if (out[out.length - 1].blank) out.pop();
    return out;
};

export const aboutLines = (cv) => {
    const p = cv.profile;
    return [
        line(p.name, "heading"),
        line(p.headline, "sub"),
        line(p.location, "dim"),
        blank(),
        line(p.summary),
    ];
};

export const contactLinks = (cv) => {
    const p = cv.profile;
    const links = [{ label: "Email", url: `mailto:${p.email}`, text: p.email }];
    if (p.cv_pdf) links.push({ label: "CV (PDF)", url: p.cv_pdf, text: "download" });
    (p.links || []).forEach((l) => links.push({ label: l.label, url: l.url, text: prettyUrl(l.url) }));
    return links;
};

export const contactLines = (cv) => [
    line("Contact", "heading"),
    blank(),
    ...contactLinks(cv).map((l) => ({
        cls: "",
        indent: 0,
        marker: "→",
        parts: [{ text: `${l.label}: ` }, { text: l.text, href: l.url }],
    })),
];

/** Compact overview printed right after boot, so the key facts need no clicks. */
export const summaryLines = (cv) => {
    const out = [line(cv.profile.headline, "heading"), blank()];

    (cv.highlights || []).forEach((h) =>
        out.push({
            cls: "",
            indent: 0,
            marker: "▸",
            parts: [{ text: `${h.label}  `, cls: "label" }, { text: h.text }],
        })
    );
    return out;
};

/* ---------- Command table ---------- */

/**
 * @returns {{ list: Array<{name, hint, aliases, run}>, find: (name) => command|undefined }}
 */
export const buildCommands = (cv) => {
    const list = [];
    const add = (name, hint, run, aliases = []) => list.push({ name, hint, run, aliases });

    add("about", "who I am & summary", () => aboutLines(cv), ["whoami", "summary"]);
    (cv.sections || []).forEach((s) =>
        add(s.id, s.hint || s.title.toLowerCase(), () => sectionLines(s), s.aliases || [])
    );
    add("contact", "email & profiles", () => contactLines(cv), ["links", "email"]);

    const content = list.slice();
    add("all", "print the full CV", () => {
        const out = [];
        content.forEach((c, i) => {
            if (i) out.push(blank(), rule(), blank());
            out.push(...c.run());
        });
        return out;
    }, ["cv"]);

    const index = new Map();
    list.forEach((c) => [c.name, ...c.aliases].forEach((n) => index.set(n, c)));

    return { list, content, find: (name) => index.get(name) };
};

export const helpLines = (commands, extras = []) => {
    const rows = [
        ...commands.list.map((c) => [c.name, c.hint]),
        ...extras,
    ];
    const width = Math.max(...rows.map(([name]) => name.length)) + 2;
    return [
        line("Commands", "heading"),
        rule(),
        ...rows.map(([name, hint]) => ({
            cls: "",
            indent: 0,
            parts: [{ text: name.padEnd(width), cls: "label" }, { text: hint }],
        })),
        rule(),
    ];
};

/** Flattens lines to plain text (used by the offline question matcher). */
export const linesToText = (lines) =>
    lines
        .map((l) => (l.blank ? "" : l.parts.map((p) => p.text).join("")))
        .join("\n");
