/**
 * Vercel serverless entry: forwards all requests to the Express app.
 * Build runs first (npm run build) so dist/ exists; this file is compiled by Vercel.
 */
// @ts-ignore - dist is built before deploy
import app from '../dist/index.js';
export default app;
