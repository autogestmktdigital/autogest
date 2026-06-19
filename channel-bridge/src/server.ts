import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import { createWebhookRouter } from './webhooks/meta-webhook';

const app = express();
const PORT = process.env.BRIDGE_PORT || 3002;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'channel-bridge' });
});

// Webhook routes
app.use('/webhook', createWebhookRouter());

app.listen(PORT, () => {
  console.log(`[BRIDGE] Channel Bridge rodando na porta ${PORT}`);
  console.log(`[BRIDGE] Webhook URL: http://localhost:${PORT}/webhook/meta`);
});
