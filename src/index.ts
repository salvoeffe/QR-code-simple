import express from 'express';
import { requireApiKey } from './middleware/apiKey.js';
import { qrRateLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getHealth } from './routes/health.js';
import { getQr, postQr } from './routes/qr.js';
import { qrQueryValidation, qrBodyValidation } from './validation/qrValidation.js';

const app = express();

app.use(express.json({ limit: '10kb' }));

// Health check – no rate limit, no API key
app.get('/health', getHealth);

// QR endpoints – optional API key, then rate limit, then validation
app.get('/qr', requireApiKey, qrRateLimiter, qrQueryValidation, getQr);
app.post('/qr', requireApiKey, qrRateLimiter, qrBodyValidation, postQr);

// Root – simple usage info
app.get('/', (_req, res) => {
  res.json({
    name: 'QR Code API',
    usage: {
      get: 'GET /qr?text=https://example.com',
      post: 'POST /qr with body { "text": "https://example.com" }',
    },
    health: 'GET /health',
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

// Central error handler (parsing, validation, network, server errors)
app.use(errorHandler);

// Local development: listen when not on Vercel
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`QR Code API running at http://localhost:${PORT}`);
  });
}

export default app;
