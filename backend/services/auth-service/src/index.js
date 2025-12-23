import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from '@fastify/jwt';
import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;
const PORT = process.env.PORT || 3001;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/market';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const pool = new Pool({ connectionString: DATABASE_URL });

async function ensureSchema() {
  await pool.query(`
  create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    password_hash text not null,
    display_name text,
    photo_url text,
    created_at timestamptz not null default now()
  );
  `);
}

const app = Fastify({ logger: true });
await app.register(cors, { origin: true, credentials: true });
await app.register(jwtPlugin, { secret: JWT_SECRET });

app.decorate('auth', async (req, reply) => {
  try { await req.jwtVerify(); } catch (e) { return reply.code(401).send({ error: 'Unauthorized' }); }
});

app.post('/auth/signup', async (req, reply) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !password) return reply.code(400).send({ error: 'Email and password required' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'insert into users (email, password_hash, display_name) values ($1,$2,$3) returning id, email, display_name, photo_url',
      [email.toLowerCase(), hash, displayName || null]
    );
    const user = rows[0];
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return { token, user };
  } catch (e) {
    if (e.code === '23505') return reply.code(409).send({ error: 'Email already exists' });
    throw e;
  }
});

app.post('/auth/signin', async (req, reply) => {
  const { email, password } = req.body || {};
  if (!email || !password) return reply.code(400).send({ error: 'Email and password required' });
  const { rows } = await pool.query('select * from users where email=$1', [email.toLowerCase()]);
  const user = rows[0];
  if (!user) return reply.code(401).send({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return reply.code(401).send({ error: 'Invalid credentials' });
  const token = app.jwt.sign({ sub: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, display_name: user.display_name, photo_url: user.photo_url } };
});

app.get('/auth/me', { preHandler: [app.auth] }, async (req) => {
  const id = req.user.sub;
  const { rows } = await pool.query('select id, email, display_name, photo_url from users where id=$1', [id]);
  return rows[0] || null;
});

app.patch('/users/me', { preHandler: [app.auth] }, async (req) => {
  const id = req.user.sub;
  const { displayName, photoURL } = req.body || {};
  const { rows } = await pool.query(
    'update users set display_name=coalesce($1, display_name), photo_url=coalesce($2, photo_url) where id=$3 returning id, email, display_name, photo_url',
    [displayName || null, photoURL || null, id]
  );
  return rows[0];
});

ensureSchema().then(() => app.listen({ port: PORT, host: '0.0.0.0' }));
