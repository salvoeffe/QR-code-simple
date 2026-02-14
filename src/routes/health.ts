import { Request, Response } from 'express';

const startTime = Date.now();

export function getHealth(_req: Request, res: Response): void {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    service: 'qr-code-api',
  });
}
