import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors.js';

const NETWORK_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EAI_AGAIN',
]);

interface JsonErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

function sendError(res: Response, status: number, body: JsonErrorResponse): void {
  res.status(status).json(body);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Already sent (e.g. by another middleware)
  if (res.headersSent) {
    return;
  }

  // App errors (validation, missing text, etc.)
  if (err instanceof AppError) {
    sendError(res, err.statusCode, {
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  // JSON parsing error (malformed request body)
  if (err instanceof SyntaxError) {
    sendError(res, 400, {
      error: 'Invalid JSON in request body. Check that your body is valid JSON.',
      code: 'PARSE_ERROR',
      details: (err as SyntaxError & { message?: string }).message,
    });
    return;
  }

  // Express body-parser sets status 400 for JSON syntax errors
  const ex = err as { status?: number; statusCode?: number; message?: string; code?: string };
  if (ex.status === 400 || ex.statusCode === 400) {
    sendError(res, 400, {
      error: 'Invalid request body. Ensure the body is valid JSON.',
      code: 'PARSE_ERROR',
    });
    return;
  }

  // Network-related errors (e.g. from downstream or OS)
  if (ex && typeof ex.code === 'string' && NETWORK_ERROR_CODES.has(ex.code)) {
    sendError(res, 503, {
      error: 'Service temporarily unavailable. Please try again later.',
      code: 'NETWORK_ERROR',
    });
    return;
  }

  // Explicit app errors (e.g. from routes calling next(err) with statusCode)
  const status = ex.statusCode ?? ex.status;
  if (typeof status === 'number' && status >= 400 && status < 600) {
    sendError(res, status, {
      error: ex.message ?? 'Request failed',
      code: ex.code as string | undefined,
      details: (ex as { details?: unknown }).details,
    });
    return;
  }

  // QRCode library / invalid input (e.g. data too long for QR)
  const msg = typeof ex?.message === 'string' ? ex.message.toLowerCase() : '';
  if (msg.includes('length') || msg.includes('too long') || msg.includes('overflow')) {
    sendError(res, 400, {
      error: 'The provided text is too long or invalid for a QR code. Use shorter text (e.g. under 2000 characters).',
      code: 'INVALID_TEXT',
    });
    return;
  }

  // Unknown/server error – don’t leak internals
  console.error('Unhandled error:', err);
  sendError(res, 500, {
    error: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_ERROR',
  });
}
