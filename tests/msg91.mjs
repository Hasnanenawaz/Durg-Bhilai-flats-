// MSG91 login test against a fake MSG91 server. No real SMS is sent.
// Usage: SESSION_SECRET=<random 16+ chars> MSG91_AUTHKEY=test MSG91_OTP_TEMPLATE_ID=test MSG91_API_URL=http://localhost:4991 npm start   then   node tests/msg91.mjs
import http from 'http';

const BASE = process.env.BASE || 'http://localhost:3000';
const GOOD = '482913';
const SEND_REJECTED = '6000000001'; // the fake refuses to send to this number
const calls = [];
let verified = new Set();

const fake = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const q = Object.fromEntries(u.searchParams);
  calls.push({ method: req.method, path: u.pathname, q, authkey: req.headers.authkey });
  const reply = (o) => res.end(JSON.stringify(o));
  if (u.pathname === '/otp') {
    if (q.mobile === `91${SEND_REJECTED}`) return reply({ type: 'error', message: 'Template not approved' });
    verified.delete(q.mobile);
    return reply({ type: 'success', request_id: 'x' });
  }
  if (u.pathname === '/otp/verify') {
    if (verified.has(q.mobile)) return reply({ type: 'error', message: 'Mobile no. already verified' });
    if (q.otp !== GOOD) return reply({ type: 'error', message: 'OTP not match' });
    verified.add(q.mobile);
    return reply({ type: 'success', message: 'OTP verified success' });
  }
  res.statusCode = 404; reply({});
});
await new Promise((r) => fake.listen(4991, r));

let pass = 0, failed = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${extra}`); } };

let seq = 0;
const stamp = String(Date.now()).slice(-7);
const newPhone = () => `9${stamp}${String(seq++).padStart(2, '0')}`;
const newIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
const post = (path, data, ip = newIp()) => fetch(BASE + path, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(data) });
const send = (phone, ip) => post('/api/auth/otp', { phone }, ip);
const verify = (phone, code, ip, extra = {}) => post('/api/auth/verify', { phone, code, ...extra }, ip);
const callsOf = (path) => calls.filter((c) => c.path === path).length;
const hasSession = (r) => /dbf_session=[^;]+/.test(r.headers.get('set-cookie') || '');

console.log('Sending');
const a = newPhone();
const s = await send(a);
const sd = await s.json();
const sc = calls.at(-1);
ok(s.status === 200, 'code is sent', `got ${s.status}`);
ok(!('devCode' in sd), 'code is never returned to the browser');
ok(sc.method === 'POST' && sc.q.mobile === `91${a}` && sc.q.template_id === 'test' && sc.q.otp_length === '6', 'MSG91 gets the number, template and length');
ok(sc.authkey === 'test' && !('authkey' in sc.q), 'authkey goes in a header, not the URL');
ok((await send('12345')).status === 400, 'invalid phone rejected');
let n = callsOf('/otp');
ok((await send(a)).status === 429 && callsOf('/otp') === n, 'second request within 30s is blocked before MSG91');
ok((await send(SEND_REJECTED)).status === 502, 'MSG91 refusing to send shows as an error');

console.log('Verifying');
const wrong = await verify(a, '000000');
ok(wrong.status === 401 && !hasSession(wrong), 'wrong code rejected, no session');
n = callsOf('/otp/verify');
for (const bad of ['123', `${GOOD}&mobile=919999999999`, `${GOOD}\n`, 482913, [GOOD], null]) {
  const r = await verify(a, bad);
  ok(r.status === 401 && !hasSession(r), `malformed code rejected: ${JSON.stringify(bad)}`);
}
ok(callsOf('/otp/verify') === n, 'malformed codes never reach MSG91');
const fakeToken = await verify(a, undefined, undefined, { idToken: 'fake' });
ok(fakeToken.status === 401 && !hasSession(fakeToken), 'a Firebase token is not accepted instead of a code');
const good = await verify(a, GOOD);
const gd = await good.json();
ok(good.status === 200 && hasSession(good) && gd.needsProfile, 'correct code logs in');
const replay = await verify(a, GOOD);
ok(replay.status === 401 && !hasSession(replay), 'a used code cannot be replayed');

console.log('Limits');
const b = newPhone();
await send(b);
for (let i = 0; i < 5; i++) await verify(b, '111111');
n = callsOf('/otp/verify');
const locked = await verify(b, GOOD);
ok(locked.status === 429 && !hasSession(locked) && callsOf('/otp/verify') === n, 'after 5 tries even the correct code is refused, from any IP');

const ip = newIp();
let last;
for (let i = 0; i < 21; i++) last = await send(newPhone(), ip);
ok(last.status === 429, 'one IP cannot request codes for unlimited numbers');

const c = newPhone();
const ip2 = newIp();
await send(c, ip2);
const sessions = await Promise.all(Array.from({ length: 12 }, () => verify(c, '222222', ip2)));
ok(sessions.filter((r) => r.status === 401).length <= 5, 'simultaneous guesses cannot exceed the cap');

console.log('Admin');
const admin = process.env.ADMIN_PHONE;
if (admin) {
  await send(admin);
  const r = await verify(admin, '333333');
  ok(r.status === 401 && !hasSession(r), 'wrong code on an admin number rejected');
}

console.log(`\n${pass} passed, ${failed} failed`);
fake.close();
process.exit(failed ? 1 : 0);
