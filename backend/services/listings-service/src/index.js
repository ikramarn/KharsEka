import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from '@fastify/jwt';
import pkg from 'pg';

const { Pool } = pkg;
const PORT = process.env.PORT || 3002;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/market';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const pool = new Pool({ connectionString: DATABASE_URL });

async function ensureSchema() {
  await pool.query(`
  create table if not exists listings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    title text not null,
    description text not null,
    price numeric(12,2) not null,
    category text not null,
    images text[] not null default '{}',
    sold boolean not null default false,
    created_at timestamptz not null default now()
  );
  create index if not exists idx_listings_cat on listings(category);
  `);
}

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(jwtPlugin, { secret: JWT_SECRET });
app.decorate('auth', async (req, reply) => { try { await req.jwtVerify(); } catch (e) { return reply.code(401).send({ error: 'Unauthorized' }); } });

app.get('/listings', async (req) => {
  const { category, q, page = 1, limit = 20 } = req.query || {};
  const offset = (Number(page) - 1) * Number(limit);
  const params = [];
  let where = 'where 1=1';
  if (category) { params.push(category); where += ` and category=$${params.length}`; }
  if (q) { params.push(`%${q.toLowerCase()}%`); where += ` and (lower(title) like $${params.length} or lower(description) like $${params.length})`; }
  const { rows } = await pool.query(`select * from listings ${where} order by created_at desc limit ${Number(limit)} offset ${offset}`, params);
  return rows;
});

app.get('/listings/:id', async (req, reply) => {
  const { id } = req.params;
  const { rows } = await pool.query('select * from listings where id=$1', [id]);
  if (!rows[0]) return reply.code(404).send({ error: 'Not found' });
  return rows[0];
});

app.post('/listings', { preHandler: [app.auth] }, async (req, reply) => {
  const userId = req.user.sub;
  const { title, description, price, category, images } = req.body || {};
  if (!title || !description || !price || !category || !images || images.length < 2 || images.length > 8) {
    return reply.code(400).send({ error: 'Invalid payload' });
  }
  const { rows } = await pool.query(
    'insert into listings (user_id, title, description, price, category, images) values ($1,$2,$3,$4,$5,$6) returning *',
    [userId, title, description, Number(price), category, images]
  );
  return rows[0];
});

app.patch('/listings/:id', { preHandler: [app.auth] }, async (req, reply) => {
  const userId = req.user.sub; const { id } = req.params; const { sold } = req.body || {};
  const { rows } = await pool.query('update listings set sold=coalesce($1, sold) where id=$2 and user_id=$3 returning *', [sold, id, userId]);
  if (!rows[0]) return reply.code(404).send({ error: 'Not found or no permission' });
  return rows[0];
});

app.delete('/listings/:id', { preHandler: [app.auth] }, async (req, reply) => {
  const userId = req.user.sub; const { id } = req.params;
  const { rowCount } = await pool.query('delete from listings where id=$1 and user_id=$2', [id, userId]);
  if (!rowCount) return reply.code(404).send({ error: 'Not found or no permission' });
  return { ok: true };
});

ensureSchema().then(() => app.listen({ port: PORT, host: '0.0.0.0' }));
