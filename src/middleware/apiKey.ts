import { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

/**
 * Optional API key check. Only runs when API_KEY env var is set.
 * Accepts key via X-API-Key header or apiKey query parameter.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = config.apiKey;
  if (!key) {
    next();
    return;
  }

  const provided =
    (req.headers['x-api-key'] as string)?.trim() ||
    (req.query.apiKey as string)?.trim();

  if (provided !== key) {
    res.status(401).json({
      error: 'Invalid or missing API key. Provide X-API-Key header or apiKey query.',
      code: 'UNAUTHORIZED',
    });
    return;
  }
  next();
}
