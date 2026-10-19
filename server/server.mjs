/* =====================================================================
   MuscularMen server (optional)
   ---------------------------------------------------------------------
   · Serves the website (the folder above this one)
   · POST /api/coach      – AI coach chat, streamed from Claude (SSE)
   · Accounts & sync      – /api/register, /api/login, /api/logout,
                            GET/PUT /api/sync, DELETE /api/account
   The Anthropic API key stays on the server: set ANTHROPIC_API_KEY
   (or sign in with `ant auth login`). Data is stored in server/data/.
   Start:  npm install  →  npm start  →  http://localhost:8080
   ===================================================================== */
import http from 'node:http';
import { readFile, writeFile, rename, mkdir, stat, unlink } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const DATA = path.join(here, 'data');
const PORT = Number(process.env.PORT) || 8080;
const MODEL = process.env.COACH_MODEL || 'claude-opus-5-5';
const scrypt = promisify(crypto.scrypt);
const client = new Anthropic();   // reads ANTHROPIC_API_KEY or your `ant auth login` profile
// null = not known yet; false once a request fails for lack of credentials
let coachReady = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN ? true : null;

/* ---------------------------------------------------------------- helpers */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8' };
const send = (res, status, body, headers = {}) => { res.writeHead(status, Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, headers)); res.end(typeof body === 'string' ? body : JSON.stringify(body)); };
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(Object.assign(new Error('Request too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}
async function readJSON(file, fallback) { try { return JSON.parse(await readFile(file, 'utf8')); } catch (e) { return fallback; } }
async function writeJSON(file, value) {   // atomic write: temp file + rename
  await mkdir(DATA, { recursive: true });
  const tmp = file + '.' + crypto.randomUUID() + '.tmp';
  await writeFile(tmp, JSON.stringify(value));
  await rename(tmp, file);
}

/* ---------------------------------------------------------------- accounts */
const USERS = path.join(DATA, 'users.json');
const userFile = id => path.join(DATA, `user-${id}.json`);
let db = null, dbLock = Promise.resolve();
async function loadDb() { if (!db) db = await readJSON(USERS, { users: {}, sessions: {} }); return db; }
function withDb(fn) {   // serialise writes to users.json
  const run = dbLock.then(async () => { const d = await loadDb(); const out = await fn(d); await writeJSON(USERS, d); return out; });
  dbLock = run.catch(() => {});
  return run;
}
const attempts = new Map();   // naive per-IP rate limit for login/register
function limited(ip) {
  const now = Date.now(), list = (attempts.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  list.push(now); attempts.set(ip, list);
  return list.length > 20;
}
async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: (await scrypt(password, salt, 64)).toString('hex') };
}
async function newSession(d, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  d.sessions[sha256(token)] = { userId, expires: Date.now() + 30 * 24 * 3600 * 1000 };
  return token;
}
async function authUser(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!m) return null;
  const d = await loadDb(), s = d.sessions[sha256(m[1])];
  if (!s || s.expires < Date.now()) return null;
  return Object.values(d.users).find(u => u.id === s.userId) || null;
}
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

/* ---------------------------------------------------------------- AI coach */
const SYSTEM = `You are MuscularMen Coach, a friendly, knowledgeable strength & conditioning coach inside the MuscularMen workout app. The app gives users a 12-week program (fat loss, muscle gain, recomposition or strength), daily workouts, a rest timer, progress tracking and Indian nutrition guidance.

How to help:
- Use the athlete data you are given (profile, today's workout, recent training, lifts, targets) to personalise every answer. Refer to their actual exercises, numbers and goal.
- Be practical and specific: sets, reps, rest, RPE, exercise swaps, cues, simple Indian meal ideas (veg or non-veg to match their diet).
- Keep answers short and scannable for a phone at the gym: a direct answer first, then a few bullet points. No long essays.
- When suggesting a workout change, keep it consistent with the app's program (same movement patterns, progressive overload, deloads every 4th week).

Safety rules (always follow):
- You give general fitness guidance, not medical advice. You cannot diagnose.
- Sharp, joint or radiating pain, numbness, chest pain, dizziness or breathlessness: tell them to stop the exercise and see a doctor or physiotherapist; you may suggest pain-free alternatives meanwhile.
- If they mention pregnancy/postpartum, heart or blood-pressure problems, diabetes, eating disorders, or are under 18, recommend medical clearance and keep advice conservative.
- Never recommend calorie intakes below 1,200 kcal/day (women) or 1,500 kcal/day (men), crash diets, or drugs/steroids/fat burners.
- If something is outside fitness and nutrition, say so briefly and steer back.`;

function cleanMessages(list) {
  if (!Array.isArray(list)) return null;
  const out = list.slice(-20).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (out.length && out[0].role !== 'user') out.shift();         // must start with the user
  const merged = [];                                                // and alternate roles
  out.forEach(m => { const last = merged[merged.length - 1]; if (last && last.role === m.role) last.content += '\n\n' + m.content; else merged.push({ ...m }); });
  return merged.length && merged[merged.length - 1].role === 'user' ? merged : null;
}

async function coach(req, res) {
  const body = await readBody(req, 200_000);
  const messages = cleanMessages(body.messages);
  if (!messages) return send(res, 400, { error: 'Send at least one user message.' });
  const context = JSON.stringify(body.context || {}).slice(0, 12_000);
  const lang = body.lang === 'hi' ? '\n\nThe user prefers Hindi: reply in simple Hindi (Devanagari script), keeping exercise names in English.' : '';

  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  const emit = ev => res.write(`data: ${JSON.stringify(ev)}\n\n`);

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: 'low' },                    // quick, conversational answers
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',                                // if a request is declined, Anthropic retries it on a suitable fallback model
    system: [
      { type: 'text', text: SYSTEM + lang },
      { type: 'text', text: `Athlete data from the app (JSON, today is ${new Date().toISOString().slice(0, 10)}):\n${context}` },
    ],
    messages,
  });
  req.on('close', () => { if (!res.writableEnded) stream.abort(); });

  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') emit({ type: 'text', text: event.delta.text });
    }
    const final = await stream.finalMessage();
    coachReady = true;
    if (final.stop_reason === 'refusal') emit({ type: 'error', message: 'The coach can’t help with that request. Try asking about your training, recovery or food.' });
    else if (final.stop_reason === 'max_tokens') emit({ type: 'error', message: 'That answer was cut short – ask me to continue.' });
    emit({ type: 'done' });
  } catch (err) {
    let message = 'The coach is unavailable right now.';
    const noCredentials = !(err instanceof Anthropic.APIError) && /credential|api[ _-]?key|auth/i.test(String(err && err.message));
    if (err instanceof Anthropic.AuthenticationError || noCredentials) { coachReady = false; message = 'The server has no valid Anthropic API key. Set ANTHROPIC_API_KEY and restart the server.'; }
    else if (err instanceof Anthropic.RateLimitError) message = 'The coach is busy – try again in a minute.';
    else if (err instanceof Anthropic.BadRequestError) message = 'The coach couldn’t process that message.';
    else if (err instanceof Anthropic.APIError) message = `Coach error (${err.status ?? 'network'}). Try again shortly.`;
    else if (err && err.name === 'AbortError') return;
    console.error('[coach]', err && err.message);
    emit({ type: 'error', message });
  }
  res.end();
}

/* ---------------------------------------------------------------- API router */
async function apiRoute(req, res, pathname) {
  const ip = req.socket.remoteAddress || '';
  const route = `${req.method} ${pathname}`;
  if (route === 'GET /api/health') return send(res, 200, { ok: true, coach: coachReady !== false, model: MODEL });
  if (route === 'POST /api/coach') return coach(req, res);

  if (route === 'POST /api/register' || route === 'POST /api/login') {
    if (limited(ip)) return send(res, 429, { error: 'Too many attempts – wait a few minutes.' });
    const { email = '', password = '' } = await readBody(req, 10_000);
    const key = String(email).trim().toLowerCase();
    if (!EMAIL.test(key)) return send(res, 400, { error: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 200) return send(res, 400, { error: 'Password must be at least 8 characters.' });
    if (route === 'POST /api/register') {
      const result = await withDb(async d => {
        if (d.users[key]) return null;
        const { salt, hash } = await hashPassword(password);
        const user = { id: crypto.randomUUID(), email: key, salt, hash, createdAt: new Date().toISOString() };
        d.users[key] = user;
        return { email: key, token: await newSession(d, user.id) };
      });
      return result ? send(res, 201, result) : send(res, 409, { error: 'An account with this email already exists – sign in instead.' });
    }
    const d = await loadDb(), user = d.users[key];
    const check = await hashPassword(password, user ? user.salt : 'x'.repeat(32));   // constant work even if user is unknown
    if (!user || !crypto.timingSafeEqual(Buffer.from(check.hash, 'hex'), Buffer.from(user.hash, 'hex'))) return send(res, 401, { error: 'Wrong email or password.' });
    const token = await withDb(d2 => newSession(d2, user.id));
    return send(res, 200, { email: key, token });
  }

  const user = await authUser(req);
  if (!user) return send(res, 401, { error: 'Please sign in again.' });
  if (route === 'POST /api/logout') {
    const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
    await withDb(d => { delete d.sessions[sha256(m[1])]; });
    return send(res, 200, { ok: true });
  }
  if (route === 'GET /api/sync') return send(res, 200, await readJSON(userFile(user.id), { updatedAt: 0, data: null }));
  if (route === 'PUT /api/sync') {
    const body = await readBody(req, 8_000_000);
    if (!body || typeof body.data !== 'object' || body.data === null) return send(res, 400, { error: 'Nothing to save.' });
    const rec = { updatedAt: Date.now(), data: body.data };
    await writeJSON(userFile(user.id), rec);
    return send(res, 200, { updatedAt: rec.updatedAt });
  }
  if (route === 'DELETE /api/account') {
    await withDb(d => {
      delete d.users[user.email];
      Object.keys(d.sessions).forEach(k => { if (d.sessions[k].userId === user.id) delete d.sessions[k]; });
    });
    await unlink(userFile(user.id)).catch(() => {});
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'Not found' });
}

/* ---------------------------------------------------------------- static files */
async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  const file = path.resolve(ROOT, '.' + rel);
  // never serve outside the site, the server folder (user data) or dot-files
  if (!file.startsWith(ROOT + path.sep) || file.startsWith(here + path.sep) || file === here || /[\\/]\./.test(rel)) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  let info;
  try { info = await stat(file); } catch (e) { return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' }); }
  if (!info.isFile()) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': /\.(mp4|webm|png|jpg|webp)$/.test(file) ? 'public, max-age=604800' : 'no-cache', 'X-Content-Type-Options': 'nosniff' };
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range && (range[1] || range[2])) {   // video seeking
    const start = range[1] ? +range[1] : Math.max(0, info.size - +range[2]);
    const end = range[1] && range[2] ? Math.min(+range[2], info.size - 1) : info.size - 1;
    if (start > end || start >= info.size) return send(res, 416, '', { 'Content-Range': `bytes */${info.size}` });
    res.writeHead(206, Object.assign(headers, { 'Content-Range': `bytes ${start}-${end}/${info.size}`, 'Content-Length': end - start + 1 }));
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, Object.assign(headers, { 'Content-Length': info.size }));
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

/* ---------------------------------------------------------------- server */
http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    if (pathname.startsWith('/api/')) return await apiRoute(req, res, pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed' });
    return await serveStatic(req, res, pathname);
  } catch (err) {
    if (!res.headersSent) send(res, err.status || 500, { error: err.status ? err.message : 'Server error' });
    else res.end();
    if (!err.status) console.error(err);
  }
}).listen(PORT, () => {
  console.log(`MuscularMen running at http://localhost:${PORT}`);
  console.log(`AI coach model: ${MODEL}${process.env.ANTHROPIC_API_KEY ? '' : '  (no ANTHROPIC_API_KEY set – the coach will report an error unless you are signed in with `ant auth login`)'}`);
});
