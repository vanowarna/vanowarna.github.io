/**
 * "Ask" feature: answers free-text questions about the CV.
 *
 * 1. If content/cv.json sets assistant.endpoint, the question goes to the
 *    Cloudflare Worker in /worker, which holds the API key and calls a free
 *    OpenRouter model grounded on the CV.
 * 2. Otherwise, or whenever the remote call fails or is rate limited, a
 *    local keyword matcher points the visitor at the most relevant section.
 *
 * The API key never reaches the browser, and answers are rendered as plain
 * text only.
 */

import { blank, line, linesToText } from "./commands.js";

const REQUEST_TIMEOUT_MS = 20000;
const COOLDOWN_MS = 3000;
const MAX_REMOTE_PER_VISIT = 15;
const DEFAULT_MAX_LENGTH = 300;

const STOP_WORDS = new Set(
    ("a an and are as at be been by can did do does for from had has have he her his how i in is it " +
     "me my of on or she tell that the their them they this to was were what when where which who " +
     "whom why will with you your about any some there").split(" ")
);

/** Extra vocabulary per section id, so "papers" finds "publications", etc. */
const SYNONYMS = {
    about: ["who", "bio", "background", "summary", "introduce", "location", "located", "based", "live"],
    interests: ["interest", "interested", "focus", "topics", "areas"],
    edu: ["education", "study", "studied", "studying", "degree", "university", "gpa", "school", "masters", "bachelor", "graduate"],
    skills: ["skill", "languages", "frameworks", "tools", "stack", "technologies", "programming"],
    work: ["job", "jobs", "company", "companies", "worked", "working", "experience", "industry", "employer", "career"],
    research: ["project", "projects", "thesis", "supervisor", "supervisors", "advisor", "lab"],
    publications: ["paper", "papers", "published", "publication", "journal", "conference", "preprint", "arxiv", "cite"],
    awards: ["award", "prize", "prizes", "won", "win", "competition", "hackathon", "achievement", "achievements"],
    leadership: ["lead", "leader", "volunteer", "volunteering", "service", "community", "chair"],
    contact: ["email", "mail", "reach", "linkedin", "github", "scholar", "hire", "message", "touch"],
};

const tokenize = (text) =>
    text
        .toLowerCase()
        .split(/[^a-z0-9+#]+/)
        .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

export const createAssistant = (cv, commands) => {
    const config = cv.assistant || {};
    const endpoint = (config.endpoint || "").trim();
    const maxLength = config.max_question_length || DEFAULT_MAX_LENGTH;

    let lastRequestAt = 0;
    let remoteCount = 0;

    const corpus = commands.content.map((command) => ({
        command,
        names: new Set([command.name, ...command.aliases, ...(SYNONYMS[command.name] || [])]),
        words: new Set(tokenize(linesToText(command.run()))),
    }));

    const localAnswer = (question) => {
        const tokens = tokenize(question);
        let best = null;
        let bestScore = 0;
        corpus.forEach((entry) => {
            let score = 0;
            tokens.forEach((t) => {
                if (entry.names.has(t)) score += 3;
                else if (entry.words.has(t)) score += 1;
            });
            if (score > bestScore) {
                best = entry;
                bestScore = score;
            }
        });

        if (!best) {
            return [
                line("I could not match that to a section of the CV.", "dim"),
                line("Try 'help' for the list of commands, or 'contact' to ask directly.", "dim"),
            ];
        }
        return [
            line(`Closest match in the CV: ${best.command.name}`, "dim"),
            blank(),
            ...best.command.run(),
        ];
    };

    const remoteAnswer = async (question) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
                signal: controller.signal,
            });
            if (!response.ok) return null;
            const data = await response.json();
            return typeof data.answer === "string" && data.answer.trim() ? data.answer.trim() : null;
        } catch {
            return null;
        } finally {
            clearTimeout(timer);
        }
    };

    return {
        isRemote: Boolean(endpoint),
        maxLength,

        /** @returns {Promise<Array>} lines to print */
        async ask(rawQuestion) {
            const question = rawQuestion.trim().replace(/\s+/g, " ");
            if (!question) {
                return [line("Usage: ask <question>   e.g. ask what is your research about?", "dim")];
            }
            if (question.length > maxLength) {
                return [line(`Please keep questions under ${maxLength} characters.`, "dim")];
            }

            const now = Date.now();
            const canUseRemote =
                endpoint &&
                remoteCount < MAX_REMOTE_PER_VISIT &&
                now - lastRequestAt >= COOLDOWN_MS;

            if (canUseRemote) {
                lastRequestAt = now;
                remoteCount += 1;
                const answer = await remoteAnswer(question);
                if (answer) {
                    return [
                        ...answer.split(/\n+/).map((paragraph) => line(paragraph, "answer")),
                        blank(),
                        line("AI-generated from the CV on this site — verify details with 'all' or by email.", "dim note"),
                    ];
                }
            }
            return localAnswer(question);
        },
    };
};
