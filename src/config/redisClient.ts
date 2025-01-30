import { createClient } from 'redis';
import { ENV } from './environment';

export const redisClient = createClient({
  socket: {
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT
  }
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});
