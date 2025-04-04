import express, { Request, Response, NextFunction } from 'express';
import cluster from 'cluster';
import os from 'os';
import { connectDatabase } from './config/database';
import { redisClient } from './config/redisClient';
import { ENV } from './config/environment';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/errorHandler.middleware';
import routes from './api/routes/index';
import * as swaggerDocument from './swagger/routes.json';
import cors from 'cors';
import dotenv from "dotenv";
import { initializeInsightIQSync } from './jobs/insightiqSync.job';
dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);

// Error handling middleware must be used last
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

const startServer = async () => {
  await connectDatabase();
  await redisClient.connect();
  
  // Initialize jobs
  await initializeInsightIQSync();
  
  app.listen(ENV.PORT, () => {
    console.log(`✅ Worker ${process.pid} running on port ${ENV.PORT}`);
  });
};

startServer().catch(err => console.error('❌ Server startup error:', err));