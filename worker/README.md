# AI assistant — Cloudflare Worker

A small proxy between the portfolio and [OpenRouter](https://openrouter.ai). It keeps the API key secret, restricts who can call it, and grounds the model on `content/cv.json`.

Cost: free. Cloudflare Workers' free plan and OpenRouter's free models are enough.

## Setup (about 10 minutes, once)

You need Node.js installed and a terminal opened in this `worker/` folder.

### 1. Create the OpenRouter key

1. Sign up at <https://openrouter.ai>.
2. Go to **Keys** → **Create Key**. Name it `vanowarna-portfolio`.
3. Set **Credit limit** to `0` so the key can never spend money.
4. Copy the key (starts with `sk-or-`). You will paste it in step 3 — never into the repository or a chat.
5. In **Settings → Privacy**, review which free providers are allowed. Leaving the "model training" toggle off restricts routing to providers that do not train on prompts.

### 2. Log in to Cloudflare

Create a free account at <https://dash.cloudflare.com/sign-up>, then:

```bash
npx wrangler login
```

### 3. Store the key as a secret

```bash
npx wrangler secret put OPENROUTER_API_KEY
```

Paste the key when prompted.

### 4. Deploy

```bash
npx wrangler deploy
```

The output ends with the Worker's address, for example `https://vanowarna-ask.YOUR-SUBDOMAIN.workers.dev`.

### 5. Switch it on

In `content/cv.json`, paste that address:

```json
"assistant": {
  "endpoint": "https://vanowarna-ask.YOUR-SUBDOMAIN.workers.dev",
  "max_question_length": 300
}
```

Commit. Within a few minutes, typing a question on the site gets an AI answer.

## Limits

| Limit | Value | Where |
|---|---|---|
| Questions per visitor | 5 per minute | `wrangler.toml` → `[[ratelimits]]` |
| Questions per day, all visitors | 50 (1,000 after a one-time $10 OpenRouter top-up) | OpenRouter free tier |
| Question length | 300 characters | `worker.js` |
| Answer length | 400 tokens | `worker.js` |
| Allowed callers | `vanowarna.com` and the GitHub Pages address | `wrangler.toml` → `ALLOWED_ORIGINS` |

When a limit is hit, the site answers from its offline keyword matcher instead of showing an error.

## Changing things later

- **Different model:** change `MODEL` in `wrangler.toml` to any id ending in `:free` from <https://openrouter.ai/models>, then `npx wrangler deploy`.
- **Tone or rules:** edit `systemPrompt` in `worker.js`, then deploy.
- **Turn it off:** set `"endpoint": ""` in `content/cv.json`.
- **Rotate the key:** delete it on OpenRouter, create a new one, repeat step 3.

## What it does not do

It stores nothing and logs nothing. It has no conversation memory: each question is answered on its own.
