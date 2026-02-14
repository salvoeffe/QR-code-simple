/**
 * App configuration from environment variables.
 * Set these in Vercel: Project → Settings → Environment Variables.
 * For local dev, use a .env file (e.g. with `vercel dev` or dotenv).
 */

function envInt(key: string, defaultValue: number): number {
  const v = process.env[key];
  if (v === undefined || v === '') return defaultValue;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? defaultValue : n;
}

export const config = {
  /** Max requests per IP per window for /qr (default 100) */
  rateLimitMax: envInt('RATE_LIMIT_MAX', 100),

  /** Rate limit window in ms (default 15 min) */
  rateLimitWindowMs: envInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),

  /** Max length of QR text (default 2000) */
  maxTextLength: envInt('MAX_TEXT_LENGTH', 2000),

  /** Optional API key. If set, /qr requires X-API-Key header or apiKey query. */
  apiKey: process.env.API_KEY?.trim() || null,
} as const;
