# vanowarna.com

Interactive CV terminal for Vanodhya Warnasooriya. Static site, no build step required, hosted on GitHub Pages.

## Updating the content

**Everything on the site comes from one file: [`content/cv.json`](content/cv.json).**

1. Open `content/cv.json` on GitHub and click the pencil icon (this works on a phone too).
2. Make the change and commit.

The terminal, the command chips, the `help` list, the startup summary and the AI assistant all update from that file. A GitHub Action then refreshes the static copy that search engines read.

### Common edits

| I want to… | Edit |
|---|---|
| Add a publication | Add an object to `entries` in the `publications` section |
| Change the startup summary | `highlights` |
| Add a profile link | `profile.links` |
| Link a CV PDF | Upload the PDF to `assets/`, then set `profile.cv_pdf` to e.g. `"assets/cv.pdf"` |
| Add a whole new section | Add an object to `sections` (a new command and chip appear automatically) |

### Section format

Each section has an `id` (the command name), a `title`, a `hint` (shown in `help`) and one of:

```jsonc
// A simple list
{ "id": "awards", "title": "Awards", "hint": "honours", "marker": "★", "items": ["First prize …"] }

// Labelled groups
{ "id": "skills", "title": "Skills", "hint": "technical skills", "groups": { "Programming": "Python, C++" } }

// Entries (jobs, projects, papers, degrees). Every field except "title" is optional.
{
  "id": "publications", "title": "Publications", "hint": "papers", "aliases": ["papers"],
  "entries": [{
    "tag": "Published",
    "title": "Paper title",
    "subtitle": "Venue",
    "meta": "2026",
    "details": "Supervisor: …",
    "bullets": ["One line about the contribution"],
    "link": "https://…"
  }]
}
```

JSON is strict: keep the commas between items and use double quotes. If the file is invalid the site falls back to the last static copy, and the GitHub Action fails with the line number.

## Project layout

```
content/cv.json      all content
index.html           page shell + generated static copy of the CV
styles/main.css      styles
scripts/main.js      entry point: boot, commands, input
scripts/commands.js  cv.json -> terminal lines (shared with the build)
scripts/terminal.js  rendering and scrolling
scripts/assistant.js "ask" feature (remote AI + offline fallback)
scripts/audio.js     soundtrack toggle and loudness analyser
scripts/scene.js     Three.js radar scene (loaded lazily)
scripts/grain.js     film grain overlay
scripts/prefs.js     saved preferences, reduced-motion detection
tools/build.mjs      regenerates the static copy, JSON-LD and sitemap
worker/              Cloudflare Worker for the AI assistant
vendor/              Three.js (self-hosted, MIT)
```

## Running locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. After editing `cv.json` locally, refresh the generated parts with:

```bash
node tools/build.mjs
```

## AI assistant

Off until `assistant.endpoint` in `content/cv.json` is set. Setup steps are in [`worker/README.md`](worker/README.md). Without it, questions are answered by an offline keyword matcher.
