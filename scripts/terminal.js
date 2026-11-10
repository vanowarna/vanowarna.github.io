/**
 * Terminal view: renders line models (see scripts/commands.js) into the DOM
 * and owns scrolling. Knows nothing about the CV or the commands themselves.
 */

import { prefersReducedMotion } from "./prefs.js";

const STREAM_DELAY_MS = 12;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isExternal = (href) => /^https?:/i.test(href);

const partNode = (part) => {
    let node;
    if (part.href) {
        node = document.createElement("a");
        node.href = part.href;
        node.className = "terminal-link";
        if (isExternal(part.href)) {
            node.target = "_blank";
            node.rel = "noopener noreferrer";
        }
    } else {
        node = document.createElement("span");
    }
    if (part.cls) node.classList.add(part.cls);
    node.textContent = part.text;
    return node;
};

export const lineNode = (model) => {
    const el = document.createElement("div");
    if (model.blank) {
        el.className = "line blank";
        return el;
    }

    el.className = ["line", model.cls, model.indent ? `ind-${model.indent}` : ""]
        .filter(Boolean)
        .join(" ");

    const text = document.createElement("span");
    text.className = "text";
    model.parts.forEach((part) => text.appendChild(partNode(part)));

    if (model.marker) {
        el.classList.add("has-marker");
        const marker = document.createElement("span");
        marker.className = "marker";
        marker.setAttribute("aria-hidden", "true");
        marker.textContent = model.marker;
        el.appendChild(marker);
    }
    el.appendChild(text);
    return el;
};

export class Terminal {
    constructor({ body, output, promptText }) {
        this.body = body;
        this.output = output;
        this.promptText = promptText;
    }

    clear() {
        this.output.replaceChildren();
        this.body.scrollTop = 0;
    }

    /** Appends one line and returns its element. */
    append(model) {
        const el = lineNode(model);
        this.output.appendChild(el);
        return el;
    }

    echo(command) {
        return this.append({
            cls: "command",
            parts: [{ text: `${this.promptText} ${command}` }],
        });
    }

    /**
     * Prints lines, optionally one at a time.
     * @param {object} [options]
     * @param {boolean} [options.stream] reveal lines progressively
     * @param {Element} [options.anchor] keep this element at the top once done,
     *        so long answers start at their first line instead of their last
     */
    async print(lines, { stream = true, anchor = null } = {}) {
        const animate = stream && !prefersReducedMotion();
        for (const model of lines) {
            this.append(model);
            if (animate) {
                this.scrollToEnd();
                await sleep(STREAM_DELAY_MS);
            }
        }
        if (anchor) this.scrollTo(anchor);
        else this.scrollToEnd();
    }

    scrollToEnd() {
        this.body.scrollTop = this.body.scrollHeight;
    }

    scrollTo(el) {
        const delta = el.getBoundingClientRect().top - this.body.getBoundingClientRect().top;
        const target = this.body.scrollTop + delta - 8;
        // Never scroll further than "end": short answers stay pinned to the bottom.
        this.body.scrollTop = Math.min(target, this.body.scrollHeight - this.body.clientHeight);
    }
}
