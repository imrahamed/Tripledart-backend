import express from 'express';
import cluster from 'cluster';
import os from 'os';
import { connectDatabase } from './config/database';
import { redisClient } from './config/redisClient';
import { ENV } from './config/environment';
import userRoutes from './api/routes/user.routes';
import influencerRoutes from './api/routes/influencer.routes';
import campaignRoutes from './api/routes/campaign.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import routes from './api/routes/index';

if (cluster.isPrimary) {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    console.error(`Worker ${worker.process.pid} exited with code ${code}`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(express.json());

  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/influencers', influencerRoutes);
  app.use('/api/v1/campaigns', campaignRoutes);
  app.use('/api', routes);

  app.use(errorHandler);

  const startServer = async () => {
    await connectDatabase();
    await redisClient.connect();
    app.listen(ENV.PORT, () => {
      console.log(`✅ Worker ${process.pid} running on port ${ENV.PORT}`);
    });
  };

  startServer().catch(err => console.error('❌ Server startup error:', err));
}
