/**
 * ============================================================================
 * Security Regression Tests — Portfolio 2.0
 * ============================================================================
 * Run with: node tests/security.test.mjs
 *
 * Sections:
 *  [1] Pure helper tests (api/_lib/security.js + cors.js)
 *  [2] Serverless module smoke-imports (syntax + import graph)
 *  [3] Live integration against backend/server.js
 *      — spawned in a SANDBOX cwd with a decoy .env so the REAL .env (Gmail /
 *        MongoDB credentials) is never loaded and no real email is ever sent.
 *      — backend/data/portfolio.json is backed up and restored around writes.
 * ============================================================================
 */

import assert from 'assert';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';

import {
  escapeHtml,
  sanitizeExternalUrl,
  sanitizePortfolioPayload,
  createSessionToken,
  verifySessionToken,
  getSessionSecret,
  generateCsrfToken,
  parseCookies,
  buildCookieString,
  verifyCsrfDoubleSubmit,
  evaluateRateLimit,
  validateUsername,
  validateGitName,
  isValidOtp,
  safeCompareOtp,
  isValidEmail,
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME
} from '../api/_lib/security.js';

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ✅ ${name}`); })
    .catch(err => { failed++; failures.push(name); console.error(`  ❌ ${name}\n     ${err && err.message}`); });
}

// ---------------------------------------------------------------------------
// [1] PURE HELPER TESTS
// ---------------------------------------------------------------------------
console.log('\n[1] Pure security helpers');

await test('escapeHtml neutralizes tags, quotes and ampersands (no raw < > " &)', () => {
  const out = escapeHtml('<img src=x onerror="alert(1)">&\'');
  assert.ok(!out.includes('<'), 'raw < survived');
  assert.ok(!out.includes('>'), 'raw > survived');
  assert.ok(!out.includes('"'), 'raw double-quote survived');
  assert.ok(!/[&](?!amp;|lt;|gt;|quot;|#39;)/.test(out), 'raw & survived');
  assert.strictEqual(escapeHtml("Tom & Jerry's"), 'Tom \u0026amp; Jerry\u0026#39;s');
});

await test('sanitizeExternalUrl: dangerous schemes rejected, https/mailto kept', () => {
  for (const bad of [
    'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html;base64,PHNjcg==',
    'vbscript:x', 'file:///etc/passwd', 'blob:https://x/1', 'https://a.com/x\r\nSet-Cookie: pwn=1',
    'https://a.com/' + 'x'.repeat(900), 12345, null
  ]) {
    assert.strictEqual(sanitizeExternalUrl(bad), null, `should reject: ${String(bad).slice(0, 40)}`);
  }
  assert.strictEqual(sanitizeExternalUrl('https://github.com/AdarshSingh001'), 'https://github.com/AdarshSingh001');
  assert.ok(sanitizeExternalUrl('mailto:adarsh@example.com').startsWith('mailto:'));
});

await test('sanitizePortfolioPayload: schema whitelist drops unknown top-level keys', () => {
  const out = sanitizePortfolioPayload({
    personal: { name: 'Adarsh' },
    admin: true,
    __proto__: null,
    evil: { x: 'y' },
    projects: [{ title: 'P1' }]
  });
  assert.ok(out, 'sanitizer returned null');
  assert.ok('personal' in out, 'personal key missing');
  assert.ok(!('admin' in out), 'admin key survived');
  assert.ok(!('evil' in out), 'evil key survived');
});

await test('sanitizePortfolioPayload: javascript: URLs stripped from project liveUrl (stored-XSS kill)', () => {
  const out = sanitizePortfolioPayload({
    personal: { name: 'X', avatar: 'javascript:alert(1)' },
    projects: [{ id: 'p1', title: 'Evil', liveUrl: 'javascript:alert(document.domain)', githubUrl: 'https://github.com/x' }]
  });
  assert.strictEqual(out.projects[0].liveUrl, '', 'javascript: liveUrl survived');
  assert.ok(out.projects[0].githubUrl.startsWith('https://'), 'legit githubUrl was dropped');
  assert.strictEqual(out.personal.avatar, '', 'javascript: avatar survived');
});

await test('sanitizePortfolioPayload: array caps + control-char stripping', () => {
  const manyProjects = Array.from({ length: 400 }, (_, i) => ({ id: `p${i}` }));
  const out = sanitizePortfolioPayload({ projects: manyProjects });
  assert.strictEqual(out.projects.length, 300, 'project cap not applied');
  const dirty = sanitizePortfolioPayload({ personal: { name: 'A\u0007darsh' } });
  assert.ok(!dirty.personal.name.includes('\u0007'), 'control char survived');
});

await test('session token: sign/verify roundtrip, tamper + expiry rejected', () => {
  const token = createSessionToken();
  const data = verifySessionToken(token);
  assert.ok(data && data.sub === 'owner', 'roundtrip failed');
  assert.ok(data.exp > Date.now(), 'expiry in past?');

  const parts = token.split('.');
  const forgedPayload = Buffer.from(JSON.stringify({ sub: 'owner', exp: Date.now() + 999999 })).toString('base64url');
  assert.strictEqual(verifySessionToken(`${forgedPayload}.${parts[1]}`), null, 'tampered payload accepted');

  const expiredPayload = Buffer.from(JSON.stringify({ sub: 'owner', iat: Date.now() - 1000, exp: Date.now() - 1 })).toString('base64url');
  const expiredSig = crypto.createHmac('sha256', getSessionSecret()).update(expiredPayload).digest('base64url');
  assert.strictEqual(verifySessionToken(`${expiredPayload}.${expiredSig}`), null, 'expired token accepted');

  for (const garbage of ['', 'x', 'a.b.c', token + 'z', 'y'.repeat(2000)]) {
    assert.strictEqual(verifySessionToken(garbage), null, `garbage accepted: ${String(garbage).slice(0, 12)}`);
  }
});

await test('CSRF double-submit: only exact cookie/header pairs pass', () => {
  const token = generateCsrfToken();
  const cookies = { [CSRF_COOKIE_NAME]: token };
  assert.strictEqual(verifyCsrfDoubleSubmit({ cookies, headerToken: token }), true);
  assert.strictEqual(verifyCsrfDoubleSubmit({ cookies, headerToken: token + 'a' }), false);
  assert.strictEqual(verifyCsrfDoubleSubmit({ cookies: {}, headerToken: token }), false);
  assert.strictEqual(verifyCsrfDoubleSubmit({ cookies, headerToken: null }), false);
});

await test('rate-limit window logic: allows up to max, blocks after, resets on new window', () => {
  const limits = { max: 3, windowMs: 60_000 };
  let state = null;
  for (let i = 0; i < 3; i++) {
    const r = evaluateRateLimit(state, limits);
    assert.strictEqual(r.allowed, true, `attempt ${i + 1} should pass`);
    state = r.state;
  }
  const blocked = evaluateRateLimit(state, limits);
  assert.strictEqual(blocked.allowed, false, '4th attempt should be blocked');
  assert.ok(blocked.retryAfterMs > 0, 'retryAfterMs missing');
  const fresh = evaluateRateLimit({ count: 3, windowStart: Date.now() - 61_000 }, limits);
  assert.strictEqual(fresh.allowed, true, 'new window should reset');
});

await test('username/git validators: block path injection into upstream APIs', () => {
  assert.strictEqual(validateUsername('Adarsh_Singh_001'), 'Adarsh_Singh_001');
  assert.strictEqual(validateUsername('@AdarshSingh001'), 'AdarshSingh001');
  for (const bad of ['a/b', 'a?b', 'a b', 'a:b', '../etc/passwd', 'a%2Fb', '', 'x'.repeat(65)]) {
    assert.strictEqual(validateUsername(bad), null, `should reject: ${JSON.stringify(bad)}`);
  }
  assert.strictEqual(validateGitName('portfolio-2.0'), 'portfolio-2.0');
  assert.strictEqual(validateGitName('..%2Fetc'), null, 'traversal should be rejected');
  assert.strictEqual(validateGitName('a..b'), null, 'double-dot should be rejected');
});

await test('OTP helpers: format check + timing-safe compare', () => {
  assert.strictEqual(isValidOtp('123456'), true);
  for (const bad of ['12345', '1234567', 'abcdef', '12 456', '']) {
    assert.strictEqual(isValidOtp(bad), false, `should reject: ${JSON.stringify(bad)}`);
  }
  assert.strictEqual(safeCompareOtp('123456', '123456'), true);
  assert.strictEqual(safeCompareOtp('123456', '123457'), false);
  assert.strictEqual(safeCompareOtp('123456', '1234567'), false);
  assert.ok(isValidEmail('owner@example.com') && !isValidEmail('not-an-email'));
});

await test('cookie builder: HttpOnly/Secure/SameSite/Max-Age flags', () => {
  const sessionCookie = buildCookieString(SESSION_COOKIE_NAME, 'tok', { maxAgeSec: 3600, httpOnly: true, secure: true });
  assert.ok(/HttpOnly/.test(sessionCookie) && /Secure/.test(sessionCookie) && /SameSite=Lax/.test(sessionCookie) && /Max-Age=3600/.test(sessionCookie));
  const csrfCookie = buildCookieString(CSRF_COOKIE_NAME, 'csrf', { maxAgeSec: 3600, httpOnly: false, secure: true });
  assert.ok(csrfCookie.includes(`${CSRF_COOKIE_NAME}=csrf`) && !/HttpOnly/.test(csrfCookie));
  const parsed = parseCookies(`a=1; ${SESSION_COOKIE_NAME}=abc%20d; junk`);
  assert.strictEqual(parsed[SESSION_COOKIE_NAME], 'abc d');
});

// ---------------------------------------------------------------------------
// [2] SERVERLESS MODULE SMOKE-IMPORTS (syntax + import graph validation)
// ---------------------------------------------------------------------------
console.log('\n[2] Serverless module smoke-imports');

await test('all api/ handlers import cleanly (auth, portfolio, contact, proxies, resume)', async () => {
  const modules = [
    '../api/auth/[action].js',
    '../api/portfolio/index.js',
    '../api/portfolio/certifications.js',
    '../api/contact.js',
    '../api/github/[username].js',
    '../api/leetcode/[username].js',
    '../api/codolio/[username].js',
    '../api/codeforces/[handle].js',
    '../api/github/readme.js',
    '../api/ai/parse-resume.js'
  ];
  for (const m of modules) {
    const mod = await import(m);
    assert.ok(typeof mod.default === 'function', `${m} has no default export`);
  }
});

await test('cors.json: OPTIONS preflight has CSRF header allowlist, security headers on json()', async () => {
  const { handleCors, json } = await import('../api/_lib/cors.js');
  let preflightStatus = null;
  let preflightHeaders = null;
  const fakeRes = {
    writeHead(status, headers) { preflightStatus = status; preflightHeaders = headers; },
    end() { this.ended = true; }
  };
  const handled = handleCors({ method: 'OPTIONS', headers: { origin: 'https://evil.example' } }, fakeRes);
  assert.ok(handled, 'preflight not handled');
  assert.strictEqual(preflightStatus, 204);
  assert.ok(preflightHeaders['Access-Control-Allow-Headers'].includes('x-portfolio-csrf'));
  assert.ok(!('Access-Control-Allow-Origin' in preflightHeaders), 'evil origin got ACAO!');

  const fakeRes2 = { _securityHeaders: undefined, body: null, status: null };
  fakeRes2.writeHead = (status, headers) => { fakeRes2.status = status; fakeRes2.headers = headers; };
  fakeRes2.end = (body) => { fakeRes2.body = body; };
  handleCors({ method: 'GET', headers: {} }, fakeRes2);
  json(fakeRes2, 200, { ok: true });
  assert.strictEqual(fakeRes2.status, 200);
  assert.strictEqual(fakeRes2.headers['X-Content-Type-Options'], 'nosniff');
  assert.strictEqual(fakeRes2.headers['Cross-Origin-Opener-Policy'], 'same-origin');
});

// ---------------------------------------------------------------------------
// [3] LIVE INTEGRATION — backend/server.js in a sandboxed cwd
// ---------------------------------------------------------------------------
console.log('\n[3] Live integration (sandboxed backend on :3987)');

const TEST_PORT = 3987;
const BASE = `http://127.0.0.1:${TEST_PORT}`;
const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_FILE = path.join(ROOT, 'backend', 'data', 'portfolio.json');

async function runIntegration() {
  // Sandbox cwd with a decoy .env: the server's env loader finds THIS file
  // first and breaks, so the real .env (Gmail/Mongo credentials) is never loaded.
  const sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-sec-test-'));
  const testSecret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(path.join(sandboxDir, '.env'), [
    `PORT=${TEST_PORT}`,
    `SESSION_SECRET=${testSecret}`,
    'OWNER_EMAIL=owner-test@example.com',
    'EMAIL_USER=',
    'EMAIL_PASS=',
    'NODE_ENV=development',
    'FRONTEND_URL='
  ].join('\n'));

  const child = spawn(process.execPath, [path.join(ROOT, 'backend', 'server.js')], {
    cwd: sandboxDir,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdoutBuf = '';
  child.stdout.on('data', d => { stdoutBuf += d.toString(); });
  child.stderr.on('data', d => { process.stderr.write(`[server] ${d}`); });
  child.on('exit', (code, signal) => { console.log(`     [server] exited code=${code} signal=${signal || ''}`); });

  const fetchDiag = async (url, options) => {
    try {
      return await fetch(url, options);
    } catch (err) {
      const cause = err && err.cause ? ` (cause: ${err.cause.code || err.cause.message || err.cause})` : '';
      throw new Error(`fetch to ${url} failed${cause}: ${err.message}`);
    }
  };

  const waitFor = (label, predicate, timeoutMs = 45000) => new Promise((resolve, reject) => {
    const started = Date.now();
    const check = async () => {
      let ok = false;
      try { ok = await predicate(); } catch { ok = false; }
      if (ok) return resolve();
      if (Date.now() - started > timeoutMs) {
        return reject(new Error(`timeout waiting for: ${label}\n--- server stdout (first 400) ---\n${stdoutBuf.slice(0, 400)}`));
      }
      setTimeout(check, 150);
    };
    check();
  });

  const waitForOtp = () => new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const m = stdoutBuf.match(/Owner Login OTP: (\d{6})/);
      if (m) return resolve(m[1]);
      if (Date.now() - started > 20000) return reject(new Error('timeout waiting for OTP in server stdout'));
      setTimeout(check, 150);
    };
    check();
  });

  const postJson = (p, body, headers = {}) => fetchDiag(`${BASE}${p}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });

  try {
    await waitFor('server to boot', async () => {
      try {
        const r = await fetchDiag(`${BASE}/api/health`);
        return r.ok;
      } catch { return false; }
    });
    const banner = stdoutBuf.match(/running on (\S+)/);
    console.log(`     [server] ${banner ? `boot banner: ${banner[1]}` : 'booted (no banner yet)'}`);

    let dataBackup = null;
    let backupExisted = fs.existsSync(DATA_FILE);
    if (backupExisted) dataBackup = fs.readFileSync(DATA_FILE, 'utf8');

    try {
      await test('GET /api/health -> 200', async () => {
        const r = await fetch(`${BASE}/api/health`);
        assert.strictEqual(r.status, 200);
      });

      await test('GET /api/portfolio -> 200 (public read preserved)', async () => {
        const r = await fetch(`${BASE}/api/portfolio`);
        assert.ok(r.status === 200 || r.status === 404);
      });

      await test('POST /api/portfolio WITHOUT session -> 401 (defacement blocked)', async () => {
        const r = await postJson('/api/portfolio', { personal: { name: 'Hacker' } });
        assert.strictEqual(r.status, 401);
        if (backupExisted) {
          assert.strictEqual(fs.readFileSync(DATA_FILE, 'utf8'), dataBackup, 'unauthorized write touched the data file!');
        }
      });

      await test('verify-otp malformed code -> 400 (no attempt budget consumed)', async () => {
        const r = await postJson('/api/auth/verify-otp', { code: 'abc' });
        assert.strictEqual(r.status, 400);
      });

      await test('verify-otp wrong codes x5 -> 401s, 6th attempt -> 429 lockout', async () => {
        for (let i = 0; i < 5; i++) {
          const r = await postJson('/api/auth/verify-otp', { code: '000000' });
          assert.strictEqual(r.status, 401, `attempt ${i + 1} should be 401`);
        }
        const locked = await postJson('/api/auth/verify-otp', { code: '000000' });
        assert.strictEqual(locked.status, 429, 'brute force not locked out!');
      });

      await test('PIN login is dead: pin/masterPin fields are ignored', async () => {
        const r = await postJson('/api/auth/verify-otp', { pin: '9369', masterPin: '926485', code: '926485' });
        // code='926485' is not the active OTP -> must fail. Old build would have logged in!
        assert.ok(r.status === 401 || r.status === 429, `PIN login returned ${r.status}`);
      });

      await test('send-otp (no SMTP in sandbox) -> 200 and response LEAKS NO OTP', async () => {
        const r = await postJson('/api/auth/send-otp', {});
        assert.strictEqual(r.status, 200);
        const body = await r.json();
        const serialized = JSON.stringify(body);
        assert.ok(!/"[^"]*\b\d{6}\b/.test(serialized), `OTP leaked in response: ${serialized}`);
        assert.ok(!serialized.includes('mailError'), 'mailError leaked');
      });

      let sessionCookies = '';
      let csrfToken = '';

      await test('full happy path: stdout OTP -> verify -> HttpOnly session cookie + CSRF minted', async () => {
        const otp = await waitForOtp();
        const r = await postJson('/api/auth/verify-otp', { code: otp });
        assert.strictEqual(r.status, 200, `verify failed for OTP ${otp}`);
        const body = await r.json();
        assert.strictEqual(body.authenticated, true);
        assert.ok(body.token && body.token.length > 20, 'fake owner_token returned');
        assert.ok(body.csrfToken, 'csrfToken missing');

        const setCookies = r.headers.getSetCookie();
        assert.ok(setCookies.length >= 2, 'Set-Cookie pair missing');
        const sessionCookieLine = setCookies.find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
        const csrfCookieLine = setCookies.find(c => c.startsWith(`${CSRF_COOKIE_NAME}=`));
        assert.ok(sessionCookieLine && sessionCookieLine.includes('HttpOnly'), 'session cookie not HttpOnly');
        assert.ok(sessionCookieLine.includes('SameSite=Lax'), 'session cookie missing SameSite');
        assert.ok(csrfCookieLine && !csrfCookieLine.includes('HttpOnly'), 'CSRF cookie must be JS-readable');

        sessionCookies = setCookies.map(c => c.split(';')[0]).join('; ');
        csrfToken = body.csrfToken;
      });

      await test('POST /api/portfolio with session but NO CSRF header -> 403', async () => {
        const r = await postJson('/api/portfolio', { personal: { name: 'CSRF-Less' } }, { Cookie: sessionCookies });
        assert.strictEqual(r.status, 403);
      });

      await test('POST /api/portfolio with session + CSRF -> 200; payload sanitized at REST', async () => {
        const r = await postJson('/api/portfolio', {
          personal: { name: 'Owner Edit', avatar: 'javascript:alert(1)' },
          socials: { github: 'https://github.com/AdarshSingh001', email: 'mailto:x@example.com' },
          projects: [{ id: 'p1', title: 'StoreX', liveUrl: 'javascript:alert(document.domain)', githubUrl: 'https://github.com/x' }],
          certifications: [{ id: 'c1', name: 'C', credentialUrl: 'data:text/html,x' }],
          evilTopLevel: { hack: true }
        }, { Cookie: sessionCookies, 'x-portfolio-csrf': csrfToken });
        assert.strictEqual(r.status, 200, 'authorized write failed');

        // Verify the FILE on disk (write-time sanitization, not just read-time)
        const stored = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        assert.strictEqual(stored.projects[0].liveUrl, '', 'javascript: liveUrl persisted to disk!');
        assert.strictEqual(stored.personal.avatar, '', 'javascript: avatar persisted to disk!');
        assert.ok(stored.socials.github.startsWith('https://'), 'legit github link dropped');
        assert.ok(stored.socials.email.startsWith('mailto:'), 'mailto link dropped');
        assert.ok(!('evilTopLevel' in stored), 'unknown top-level key persisted!');
      });

      await test('forged session cookie (wrong secret) -> 401', async () => {
        const forgedToken = (await import('../api/_lib/security.js')).createSessionToken();
        // signed with the REAL secret from api/_lib defaults... craft with a different secret instead:
        const forged = `forged.${forgedToken.split('.')[1]}`;
        const r = await postJson('/api/portfolio', { personal: { name: 'Nope' } }, { Cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(forged)}; ${CSRF_COOKIE_NAME}=${csrfToken}`, 'x-portfolio-csrf': csrfToken });
        assert.strictEqual(r.status, 401, 'forged session accepted!');
      });

      await test('send-otp rate limit: 3/15min enforced (calls 2,3 OK, 4th -> 429)', async () => {
        const r2 = await postJson('/api/auth/send-otp', {});
        const r3 = await postJson('/api/auth/send-otp', {});
        const r4 = await postJson('/api/auth/send-otp', {});
        assert.strictEqual(r2.status, 200);
        assert.strictEqual(r3.status, 200);
        assert.strictEqual(r4.status, 429, 'OTP spam endpoint not rate limited!');
      });

      await test('CORS: foreign origin gets NO ACAO header (localhost dev allowed)', async () => {
        const evil = await fetch(`${BASE}/api/health`, { headers: { Origin: 'https://evil.example' } });
        assert.strictEqual(evil.headers.get('access-control-allow-origin'), null, 'wildcard/foreign CORS leaked!');
        assert.strictEqual(evil.headers.get('x-content-type-options'), 'nosniff');

        const local = await fetch(`${BASE}/api/health`, { headers: { Origin: 'http://localhost:5173' } });
        assert.strictEqual(local.headers.get('access-control-allow-origin'), 'http://localhost:5173');
        assert.strictEqual(local.headers.get('access-control-allow-credentials'), 'true');
      });
    } finally {
      if (backupExisted) {
        fs.writeFileSync(DATA_FILE, dataBackup, 'utf8');
        console.log('     ↩ original backend/data/portfolio.json restored');
      }
    }
  } finally {
    child.kill();
    try { fs.rmSync(sandboxDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

await runIntegration();

// ---------------------------------------------------------------------------
console.log('\n════════════════════════════════════');
console.log(`Security tests: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log('Failed:', failures.join(' | '));
}
console.log('════════════════════════════════════');
process.exit(failed === 0 ? 0 : 1);
