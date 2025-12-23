import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import staticPlugin from '@fastify/static';
import jwtPlugin from '@fastify/jwt';
import { nanoid } from 'nanoid';
import fs from 'fs-extra';
import path from 'path';

const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';

await fs.ensureDir(UPLOAD_DIR);

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(multipart, { limits: { files: 8, fileSize: 10 * 1024 * 1024 } });
await app.register(jwtPlugin, { secret: JWT_SECRET });
await app.register(staticPlugin, { root: UPLOAD_DIR, prefix: '/media/' });

app.decorate('auth', async (req, reply) => { try { await req.jwtVerify(); } catch { return reply.code(401).send({ error: 'Unauthorized' }); } });

app.post('/media/upload', { preHandler: [app.auth] }, async (req, reply) => {
  const parts = req.parts();
  const urls = [];
  for await (const part of parts) {
    if (part.file) {
      const id = nanoid();
      const ext = path.extname(part.filename || '') || '.jpg';
      const fname = `${id}${ext}`;
      const dest = path.join(UPLOAD_DIR, fname);
      await fs.ensureDir(path.dirname(dest));
      await fs.writeFile(dest, await part.toBuffer());
      urls.push(`/media/${fname}`);
    }
  }
  return { urls };
});

app.listen({ port: PORT, host: '0.0.0.0' });
