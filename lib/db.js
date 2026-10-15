import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * One small data API used by the whole app:
 *   find(table, query) · count(table, query) · get(table, id) · getBy(table, col, val)
 *   insert(table, row) · update(table, id, patch) · remove(table, id)
 *
 * query = { eq: {col: val}, neq: {}, gte: {}, lte: {}, in: {col: [..]},
 *           search: { cols: ['title'], term: 'supela' }, order: ['created_at', false], limit, offset }
 *
 * With Supabase keys set it talks to Supabase (service role, server only).
 * Without them it falls back to a JSON file in .data/ so the site runs locally with zero setup.
 */

export const usingSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// Vercel's filesystem is read-only, so the JSON fallback would fail on every write. Stop the build instead.
if (!usingSupabase && process.env.VERCEL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set: the local .data/ database cannot run on Vercel.');
}

const TABLES = ['users', 'properties', 'inquiries', 'favorites', 'blogs', 'reports'];
const now = () => new Date().toISOString();

// ───────────────────────── Supabase backend ─────────────────────────
let _sb;
async function sb() {
  if (!_sb) {
    const { createClient } = await import('@supabase/supabase-js');
    _sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _sb;
}

function applyQuery(q, query = {}) {
  for (const [k, v] of Object.entries(query.eq || {})) q = v === null ? q.is(k, null) : q.eq(k, v);
  for (const [k, v] of Object.entries(query.neq || {})) q = q.neq(k, v);
  for (const [k, v] of Object.entries(query.gte || {})) q = q.gte(k, v);
  for (const [k, v] of Object.entries(query.lte || {})) q = q.lte(k, v);
  for (const [k, v] of Object.entries(query.in || {})) q = q.in(k, v);
  if (query.search?.term) {
    const term = query.search.term.replace(/[%,()]/g, ' ').trim();
    if (term) q = q.or(query.search.cols.map((c) => `${c}.ilike.%${term}%`).join(','));
  }
  return q;
}

// Supabase returns at most 1000 rows per request (PostgREST max-rows), so bigger reads are fetched in pages.
const PAGE = 1000;

const supabaseDb = {
  async find(table, query = {}) {
    const c = await sb();
    const start = query.offset || 0;
    const want = query.limit || Infinity;
    const rows = [];
    while (rows.length < want) {
      const n = Math.min(PAGE, want - rows.length);
      let q = applyQuery(c.from(table).select('*'), query);
      if (query.order) q = q.order(query.order[0], { ascending: !!query.order[1] });
      q = q.order('id', { ascending: true }); // stable tie-break so pages don't overlap
      const from = start + rows.length;
      const { data, error } = await q.range(from, from + n - 1);
      if (error) throw new Error(`${table}.find: ${error.message}`);
      rows.push(...(data || []));
      if (!data || data.length < n) break;
    }
    return rows;
  },
  async count(table, query = {}) {
    const c = await sb();
    const { count, error } = await applyQuery(c.from(table).select('*', { count: 'exact', head: true }), query);
    if (error) throw new Error(`${table}.count: ${error.message}`);
    return count || 0;
  },
  async getBy(table, col, val) {
    const c = await sb();
    const { data, error } = await c.from(table).select('*').eq(col, val).maybeSingle();
    if (error) throw new Error(`${table}.getBy: ${error.message}`);
    return data;
  },
  async insert(table, row) {
    const c = await sb();
    const { data, error } = await c.from(table).insert(row).select('*').single();
    if (error) throw new Error(`${table}.insert: ${error.message}`);
    return data;
  },
  async update(table, id, patch) {
    const c = await sb();
    const { data, error } = await c.from(table).update(patch).eq('id', id).select('*').single();
    if (error) throw new Error(`${table}.update: ${error.message}`);
    return data;
  },
  async remove(table, id) {
    const c = await sb();
    const { error } = await c.from(table).delete().eq('id', id);
    if (error) throw new Error(`${table}.remove: ${error.message}`);
    return true;
  },
};

// ───────────────────────── Local JSON backend ─────────────────────────
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const g = globalThis;

async function load() {
  if (g.__dbCache) return g.__dbCache;
  try {
    g.__dbCache = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  } catch {
    g.__dbCache = {};
  }
  for (const t of TABLES) g.__dbCache[t] ||= [];
  return g.__dbCache;
}
async function save() {
  // Serialise writes so concurrent requests can't corrupt the file.
  g.__dbWrite = (g.__dbWrite || Promise.resolve()).then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = DB_FILE + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(g.__dbCache, null, 2));
    await fs.rename(tmp, DB_FILE);
  });
  return g.__dbWrite;
}

function match(row, query = {}) {
  for (const [k, v] of Object.entries(query.eq || {})) if ((row[k] ?? null) !== v) return false;
  for (const [k, v] of Object.entries(query.neq || {})) if (row[k] === v) return false;
  for (const [k, v] of Object.entries(query.gte || {})) if (!(row[k] >= v)) return false;
  for (const [k, v] of Object.entries(query.lte || {})) if (!(row[k] <= v)) return false;
  for (const [k, v] of Object.entries(query.in || {})) if (!v.includes(row[k])) return false;
  if (query.search?.term) {
    const t = query.search.term.toLowerCase().trim();
    if (t && !query.search.cols.some((c) => String(row[c] ?? '').toLowerCase().includes(t))) return false;
  }
  return true;
}
const clone = (x) => (x ? JSON.parse(JSON.stringify(x)) : x);

const localDb = {
  async find(table, query = {}) {
    const db = await load();
    let rows = db[table].filter((r) => match(r, query));
    if (query.order) {
      const [col, asc] = query.order;
      rows = rows.sort((a, b) => ((a[col] ?? '') > (b[col] ?? '') ? 1 : (a[col] ?? '') < (b[col] ?? '') ? -1 : 0) * (asc ? 1 : -1));
    }
    if (query.limit) rows = rows.slice(query.offset || 0, (query.offset || 0) + query.limit);
    return clone(rows);
  },
  async count(table, query = {}) {
    const db = await load();
    return db[table].filter((r) => match(r, query)).length;
  },
  async getBy(table, col, val) {
    const db = await load();
    return clone(db[table].find((r) => r[col] === val) || null);
  },
  async insert(table, row) {
    const db = await load();
    const full = { id: crypto.randomUUID(), created_at: now(), ...row };
    if (table === 'properties' || table === 'blogs') full.updated_at = full.created_at;
    db[table].push(full);
    await save();
    return clone(full);
  },
  async update(table, id, patch) {
    const db = await load();
    const row = db[table].find((r) => r.id === id);
    if (!row) throw new Error(`${table}.update: not found`);
    Object.assign(row, patch);
    await save();
    return clone(row);
  },
  async remove(table, id) {
    const db = await load();
    db[table] = db[table].filter((r) => r.id !== id);
    await save();
    return true;
  },
};

const impl = usingSupabase ? supabaseDb : localDb;

export const db = {
  find: impl.find,
  count: impl.count,
  getBy: impl.getBy,
  get: (table, id) => (id ? impl.getBy(table, 'id', id) : null),
  insert: impl.insert,
  update: (table, id, patch) =>
    impl.update(table, id, table === 'properties' || table === 'blogs' ? { ...patch, updated_at: now() } : patch),
  remove: impl.remove,
};

// ───────────────────────── Image storage ─────────────────────────
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const BUCKET = process.env.SUPABASE_BUCKET || 'property-images';

// Every stored file is named by upload() below. Listing photos sit under the uploader's user id
// so a listing can only reference (and later delete) its own owner's or uploader's files.
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const PATH_RE = new RegExp(`^(properties/${UUID}|blog)/\\d{4}-\\d{2}/${UUID}\\.(jpg|png|webp)$`);

export const storage = {
  isValidPath: (p) => typeof p === 'string' && PATH_RE.test(p),
  /** Public URL for a stored path. Never trust a URL sent by the browser; rebuild it from the path. */
  urlFor: (p) => (usingSupabase
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${BUCKET}/${p}`
    : `/api/files/${p}`),
  /** Saves an image and returns { url, path }. folder is 'blog' or 'properties/<userId>'. */
  async upload(buffer, ext, contentType, folder) {
    const name = `${folder}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
    if (!PATH_RE.test(name)) throw new Error(`upload: bad path ${name}`);
    if (usingSupabase) {
      const c = await sb();
      const { error } = await c.storage.from(BUCKET).upload(name, buffer, { contentType, upsert: false, cacheControl: '31536000' });
      if (error) throw new Error(`upload: ${error.message}`);
      return { url: storage.urlFor(name), path: name };
    }
    const file = path.join(UPLOAD_DIR, name);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, buffer);
    return { url: storage.urlFor(name), path: name };
  },
  async remove(p) {
    if (!storage.isValidPath(p)) return;
    try {
      if (usingSupabase) {
        const c = await sb();
        await c.storage.from(BUCKET).remove([p]);
      } else {
        const full = storage.localPath(p);
        if (full) await fs.unlink(full);
      }
    } catch {}
  },
  localPath: (p) => {
    const full = path.normalize(path.join(UPLOAD_DIR, p));
    return full.startsWith(UPLOAD_DIR + path.sep) ? full : null;
  },
};
