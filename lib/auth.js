const crypto = require('crypto');

function env(name) {
  return process.env[name] || '';
}

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function requireMethod(req, res, method) {
  if (req.method !== method) {
    res.setHeader('Allow', method);
    json(res, 405, { message: `Method ${req.method} tidak diizinkan.` });
    return false;
  }
  return true;
}

function dbConfig() {
  const url = env('SUPABASE_URL').replace(/\/$/, '');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');
  const secret = env('MONEY_MICHELLE_AUTH_SECRET');
  if (!url || !key || !secret) return null;
  return { url, key, secret };
}

async function supabase(path, options = {}) {
  const cfg = dbConfig();
  if (!cfg) throw new Error('Server auth belum dikonfigurasi. Isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan MONEY_MICHELLE_AUTH_SECRET di Vercel.');
  const response = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) {
    const detail = data.message || data.error_description || data.hint || 'Database request gagal.';
    throw new Error(detail);
  }
  return data;
}

function normalizeEmail(email) { return String(email || '').trim().toLowerCase(); }
function hashPassword(password, salt) { return crypto.scryptSync(password, salt, 64).toString('hex'); }
function makeSalt() { return crypto.randomBytes(16).toString('hex'); }
function safeEqual(a, b) {
  try { return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')); } catch { return false; }
}
function makeToken(user) {
  const cfg = dbConfig();
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString('base64url');
  const sig = crypto.createHmac('sha256', cfg.secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function readToken(req) {
  const h = String(req.headers.authorization || '');
  if (!h.startsWith('Bearer ')) return null;
  const token = h.slice(7);
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const cfg = dbConfig(); if (!cfg) return null;
  const expected = crypto.createHmac('sha256', cfg.secret).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.sub || !data.email || !data.exp || Date.now() > data.exp) return null;
    return data;
  } catch { return null; }
}

function publicUser(row) { return { id: row.id, name: row.name || '', email: row.email }; }

module.exports = { env, json, requireMethod, dbConfig, supabase, normalizeEmail, hashPassword, makeSalt, safeEqual, makeToken, readToken, publicUser };
