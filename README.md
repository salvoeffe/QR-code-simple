# QR Code API & Web Tool

This repo contains:

- **API** — Express-based QR code API (see below)
- **Web Tool** (`web/`) — Next.js website with free QR generator, blog, and AdSense-ready structure. Deploy to a new Vercel domain with Root Directory set to `web`. See [web/README.md](web/README.md).

---

## API

Simple API: send a link or text, get back a QR code image.

- **Rate limited** (100 requests per 15 min per IP on `/qr`)
- **Input validation** (required `text`, max 2000 chars)
- **Health check** at `GET /health`

## Endpoints

| Method | Path   | Description                    |
|--------|--------|--------------------------------|
| GET    | `/`    | API usage info                 |
| GET    | `/health` | API status, uptime, timestamp |
| GET    | `/qr?text=...` | Generate QR (text in query) |
| POST   | `/qr`  | Generate QR (body: `{ "text": "..." }`) |

## Error handling

Errors return JSON with `error`, optional `code`, and optional `details`. HTTP status codes:

| Status | Code | When |
|--------|------|------|
| 400 | `PARSE_ERROR` | Invalid JSON in POST body |
| 400 | `VALIDATION_ERROR` | Invalid or missing `text` (e.g. empty, too long) |
| 400 | `MISSING_TEXT` | No `text` in query or body |
| 400 | `INVALID_TEXT` | Text not suitable for QR (e.g. too long for encoding) |
| 401 | `UNAUTHORIZED` | Missing or invalid API key (when `API_KEY` is set) |
| 404 | `NOT_FOUND` | Route does not exist |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests to `/qr` |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `NETWORK_ERROR` | Network-related failure (e.g. temporary) |

## Local development

```bash
npm install
npm run dev
```

Then open:

- http://localhost:3000/health
- http://localhost:3000/qr?text=https://example.com

## Environment variables

All are optional. Set in Vercel: **Project → Settings → Environment Variables.** For local dev, copy `.env.example` to `.env` (e.g. when using `vercel dev`).

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_MAX` | Max requests per IP per window for `/qr` | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `MAX_TEXT_LENGTH` | Max QR text length (chars) | `2000` |
| `API_KEY` | If set, `/qr` requires `X-API-Key` header or `?apiKey=...` | — |

## Deploy on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), **Add New Project** → import the repo.
3. (Optional) Add environment variables under **Settings → Environment Variables.**
4. Deploy. Vercel detects the Express app (`src/index.ts` with default export) and uses `vercel.json` for build.

Local test with Vercel: `npx vercel dev`.

## Example

```bash
# Get QR as image
curl -o qr.png "http://localhost:3000/qr?text=https://my-site.com"

# POST
curl -X POST http://localhost:3000/qr -H "Content-Type: application/json" -d '{"text":"Hello world"}' -o qr.png

# If API_KEY is set
curl -o qr.png "http://localhost:3000/qr?text=https://example.com&apiKey=your-secret-key"
curl -X POST http://localhost:3000/qr -H "Content-Type: application/json" -H "X-API-Key: your-secret-key" -d '{"text":"Hi"}' -o qr.png
```
