import Fastify from 'fastify';
import cors from '@fastify/cors';
import replyFrom from '@fastify/reply-from';
import client from 'prom-client';

const PORT = process.env.PORT || 3000;
const AUTH_URL = process.env.AUTH_URL || 'http://auth-service:3001';
const LISTINGS_URL = process.env.LISTINGS_URL || 'http://listings-service:3002';
const FAVORITES_URL = process.env.FAVORITES_URL || 'http://favorites-service:3003';
const MEDIA_URL = process.env.MEDIA_URL || 'http://media-service:3004';

const app = Fastify({ logger: true });
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });
await app.register(cors, { origin: true, credentials: true });
await app.register(replyFrom);

app.all('/auth/*', (req, reply) => reply.from(`${AUTH_URL}${req.raw.url}`));
app.all('/users/*', (req, reply) => reply.from(`${AUTH_URL}${req.raw.url}`));
app.all('/listings/*', (req, reply) => reply.from(`${LISTINGS_URL}${req.raw.url}`));
app.all('/favorites/*', (req, reply) => reply.from(`${FAVORITES_URL}${req.raw.url}`));
app.all('/media/*', (req, reply) => reply.from(`${MEDIA_URL}${req.raw.url}`));

app.get('/healthz', async () => ({ ok: true }));
app.get('/metrics', async (req, reply) => {
	reply.header('Content-Type', registry.contentType);
	return registry.metrics();
});

app.listen({ port: PORT, host: '0.0.0.0' });
