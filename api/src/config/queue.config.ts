import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  prefix: process.env.QUEUE_PREFIX ?? 'train_tickets',
  defaultConcurrency: Number(process.env.QUEUE_DEFAULT_CONCURRENCY ?? 5)
}));
