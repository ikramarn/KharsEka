import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from '@fastify/jwt';
import pkg from 'pg';

const { Pool } = pkg;
const PORT = process.env.PORT || 3003;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/market';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const pool = new Pool({ connectionString: DATABASE_URL });

async function ensureSchema() {
  await pool.query(`
  create table if not exists favorites (
    user_id uuid not null,
    listing_id uuid not null,
    created_at timestamptz not null default now(),
    primary key (user_id, listing_id)
  );
  `);
}

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(jwtPlugin, { secret: JWT_SECRET });
app.decorate('auth', async (req, reply) => { try { await req.jwtVerify(); } catch (e) { return reply.code(401).send({ error: 'Unauthorized' }); } });

app.get('/favorites', { preHandler: [app.auth] }, async (req) => {
  const userId = req.user.sub;
  const { rows } = await pool.query('select listing_id from favorites where user_id=$1', [userId]);
  return rows.map(r => r.listing_id);
});

app.post('/favorites/:listingId', { preHandler: [app.auth] }, async (req) => {
  const userId = req.user.sub; const { listingId } = req.params;
  await pool.query('insert into favorites(user_id, listing_id) values ($1,$2) on conflict do nothing', [userId, listingId]);
  return { ok: true };
});

app.delete('/favorites/:listingId', { preHandler: [app.auth] }, async (req) => {
  const userId = req.user.sub; const { listingId } = req.params;
  await pool.query('delete from favorites where user_id=$1 and listing_id=$2', [userId, listingId]);
  return { ok: true };
});

app.get('/healthz', async () => ({ ok: true }));

ensureSchema().then(() => app.listen({ port: PORT, host: '0.0.0.0' }));
