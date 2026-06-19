import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config';
import { errorHandler } from './middleware';
import { followUpService } from './services/followup.service';
import routes from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// API routes
app.use('/api', routes);

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`[SERVER] Servidor rodando na porta ${env.PORT}`);
  console.log(`[SERVER] Ambiente: ${env.NODE_ENV}`);

  // Start follow-up cron jobs
  followUpService.startCronJobs();
});

export default app;
