import 'dotenv/config';
import { app } from './app';
import { prisma } from './lib/prisma';

const port = Number(process.env.PORT || 5000);
const host = '127.0.0.1';
const server = app.listen(port, host, () => console.log(`Scentory API listening on http://${host}:${port}`));

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
