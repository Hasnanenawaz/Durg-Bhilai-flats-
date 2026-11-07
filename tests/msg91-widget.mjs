// MSG91 widget login test against a fake MSG91 server that copies replies seen on a live login. No real SMS is sent.
// Usage: SESSION_SECRET=<random 16+ chars> ADMIN_PHONES=9000000009 MSG91_AUTHKEY=test MSG91_WIDGET_ID=test-widget MSG91_WIDGET_TOKEN=test-token MSG91_API_URL=http://localhost:4992 npm start   then   node tests/msg91-widget.mjs
import http from 'http';

const BASE = process.env.BASE || 'http://localhost:3000';
const ADMIN = process.env.ADMIN_PHONE || '9000000009';
const stamp = String(Date.now()).slice(-7);
const USER = `8${stamp}11`;
const USER2 = `8${stamp}22`;
const USER3 = `8${stamp}33`;
const token = (name) => `aaa.${name}.sig`;

// token name -> what the fake replies with
const replies = {
  good: { type: 'success', message: `91${USER}` },
  numeric: { type: 'success', message: Number(`91${USER2}`) },
  claim: { type: 'success', message: `91${USER3}` },
  admin: { type: 'success', message: `91${ADMIN}` },
  noNumber: { type: 'success', message: 'verified' },
  foreign: { type: 'success', message: '14155550123' },
  landline: { type: 'success', message: '911123456789' },
  altered: { type: 'error', code: 701, message: 'invalid access-token' },
  errorWithNumber: { type: 'error', code: 702, message: `91${USER}` },
  empty: {},
};
const used = new Set();
const calls = [];
const fake = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => { raw += c; });
  req.on('end', () => {
    const b = JSON.parse(raw || '{}');
    calls.push({ path: req.url, method: req.method, body: b });
    const name = String(b['access-token']).split('.')[1];
    if (name === 'broken') return res.end('<html>not json</html>');
    if (used.has(name)) return res.end(JSON.stringify({ type: 'error', code: 702, message: 'access-token already verified' }));
    if (replies[name]?.type === 'success') used.add(name);
    res.end(JSON.stringify(replies[name] || replies.altered));
  });
});
await new Promise((r) => fake.listen(4992, r));

let pass = 0, failed = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${extra}`); } };
const post = (path, data) => fetch(BASE + path, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
const verify = (data) => post('/api/auth/verify', data);
const hasSession = (r) => /dbf_session=[^;]+/.test(r.headers.get('set-cookie') || '');
const refused = async (data, name) => { const r = await verify(data); ok(r.status === 401 && !hasSession(r), name, `got ${r.status}`); };

console.log('Login page');
const page = await (await fetch(`${BASE}/login`)).text();
ok(page.includes('test-widget') && page.includes('Continue with mobile number'), 'shows the widget login');
ok(!/authkey/i.test(page), 'authkey is not sent to the browser');

console.log('Verifying');
const good = await verify({ widgetToken: token('good') });
const gd = await good.json();
const sent = calls.at(-1);
ok(good.status === 200 && hasSession(good) && gd.needsProfile, 'a confirmed token logs in');
ok(sent.path === '/widget/verifyAccessToken' && sent.method === 'POST' && sent.body.authkey === 'test' && sent.body['access-token'] === token('good'), 'MSG91 gets the authkey and token');
await refused({ widgetToken: token('good') }, 'a used token cannot be replayed');
const numeric = await verify({ widgetToken: token('numeric') });
ok(numeric.status === 200 && hasSession(numeric), 'a number sent as a JSON number also works');

console.log('Rejections');
for (const name of ['altered', 'noNumber', 'foreign', 'landline', 'errorWithNumber', 'empty', 'broken', 'unknown']) {
  await refused({ widgetToken: token(name) }, `rejected: ${name}`);
}
const n = calls.length;
for (const bad of ['', 'not-a-token', 'a.b', 'a.b.c.d', 'a.b.c&x=1', `a.${'b'.repeat(5000)}.c`, 12345, null, ['a.b.c'], { a: 1 }]) {
  await refused({ widgetToken: bad }, `malformed: ${String(JSON.stringify(bad)).slice(0, 24)}`);
}
ok(calls.length === n, 'malformed tokens never reach MSG91');
await refused({ phone: USER, code: '123456' }, 'a phone and code are not accepted instead of a token');
await refused({ idToken: 'fake' }, 'a Firebase token is not accepted instead');
ok((await post('/api/auth/otp', { phone: USER })).status === 400, 'the server does not send codes in widget mode');

console.log('Admin');
const claim = await verify({ widgetToken: token('claim'), phone: ADMIN });
const cd = await claim.json();
ok(claim.status === 200 && cd.admin === false, 'claiming an admin number in the request does not give admin');
const real = await verify({ widgetToken: token('admin') });
const rd = await real.json();
ok(real.status === 200 && rd.admin === true, 'the number MSG91 confirmed decides who logs in');

console.log(`\n${pass} passed, ${failed} failed`);
fake.close();
process.exit(failed ? 1 : 0);
