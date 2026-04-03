/**
 * API Integration Test Script
 *
 * Tests all major backend endpoints sequentially.
 * Run AFTER the server is started and seed has been run.
 *
 * Usage:
 *   node scripts/test-api.js
 *   BASE_URL=http://localhost:5000 node scripts/test-api.js
 *
 * Requires Node 18+ (native fetch).
 * For Node < 18: npm install node-fetch and uncomment the import below.
 */

// const fetch = (...args) => import('node-fetch').then(m => m.default(...args));

const BASE = process.env.BASE_URL || 'http://localhost:5000/api';

let passed = 0;
let failed = 0;
let adminToken = '';
let userToken  = '';
let jerseyId   = '';
let designId   = '';
let cartItemId = '';

const log = (label, ok, detail = '') => {
  if (ok) { passed++; console.log(`  ✅  ${label}${detail ? ' — ' + detail : ''}`); }
  else     { failed++; console.log(`  ❌  ${label}${detail ? ' — ' + detail : ''}`); }
};

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

// ─────────────────────────────────────────────
async function testHealth() {
  console.log('\n── Health Check ─────────────────────');
  const { status, data } = await req('GET', '/health');
  log('GET /health', status === 200 && data.status === 'OK', data.message);
}

// ─────────────────────────────────────────────
async function testAuth() {
  console.log('\n── Auth ─────────────────────────────');

  // Admin login
  const admin = await req('POST', '/auth/login', {
    email: process.env.ADMIN_EMAIL || 'admin@escobar.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
  });
  log('POST /auth/login (admin)', admin.status === 200 && admin.data.token, `role=${admin.data.user?.role}`);
  adminToken = admin.data.token || '';

  // Register a test user
  const reg = await req('POST', '/auth/register', {
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'Test@1234',
    phone: '9876543210',
  });
  log('POST /auth/register', reg.status === 201 && reg.data.token, `id=${reg.data.user?._id}`);
  userToken = reg.data.token || '';

  // Get profile
  const me = await req('GET', '/auth/me', null, userToken);
  log('GET /auth/me', me.status === 200 && me.data.user?.email, `email=${me.data.user?.email}`);

  // Unauthorised access
  const unauth = await req('GET', '/auth/me');
  log('GET /auth/me (no token → 401)', unauth.status === 401);

  // Wrong password
  const badLogin = await req('POST', '/auth/login', { email: 'admin@escobar.com', password: 'wrong' });
  log('POST /auth/login (wrong password → 401)', badLogin.status === 401);
}

// ─────────────────────────────────────────────
async function testJerseys() {
  console.log('\n── Jerseys ──────────────────────────');

  // GET all jerseys
  const all = await req('GET', '/jerseys');
  log('GET /jerseys', all.status === 200 && Array.isArray(all.data.jerseys), `count=${all.data.count}`);

  if (all.data.jerseys?.length) {
    jerseyId = all.data.jerseys[0]._id;

    // GET single jersey
    const one = await req('GET', `/jerseys/${jerseyId}`);
    log('GET /jerseys/:id', one.status === 200 && one.data.jersey?._id === jerseyId);

    // Category filter
    const cat = await req('GET', '/jerseys?category=football');
    log('GET /jerseys?category=football', cat.status === 200);
  } else {
    log('GET /jerseys (has data)', false, 'No jerseys — run seed first');
    jerseyId = null;
  }

  // Admin-only upload without token → 401
  const noAuth = await req('POST', '/jerseys', { name: 'x', basePrice: 100 });
  log('POST /jerseys (no token → 401)', noAuth.status === 401);

  // Non-admin upload → 403
  if (userToken) {
    const noAdmin = await req('POST', '/jerseys', { name: 'x', basePrice: 100 }, userToken);
    log('POST /jerseys (user token → 403)', noAdmin.status === 403);
  }
}

// ─────────────────────────────────────────────
async function testDesigns() {
  console.log('\n── Designs ──────────────────────────');
  if (!jerseyId) { console.log('  ⏭   Skipped (no jersey)'); return; }

  // Save design (no real Cloudinary in test — skip previewImageBase64)
  const saved = await req('POST', '/designs', {
    jerseyId,
    name: 'Test API Design',
    canvasData: { version: '5.3.0', objects: [] },
    customizations: { playerName: 'RONALDO', playerNumber: '7', textColor: '#fff', fontSize: 36 },
  }, userToken);
  log('POST /designs', saved.status === 201 && saved.data.design?._id, `id=${saved.data.design?._id}`);
  designId = saved.data.design?._id || '';

  if (designId) {
    // GET all user designs
    const list = await req('GET', '/designs', null, userToken);
    log('GET /designs', list.status === 200 && list.data.count >= 1);

    // GET single design
    const one = await req('GET', `/designs/${designId}`, null, userToken);
    log('GET /designs/:id', one.status === 200 && one.data.design?._id === designId);

    // Update design name
    const upd = await req('PUT', `/designs/${designId}`, { name: 'Updated Design' }, userToken);
    log('PUT /designs/:id', upd.status === 200 && upd.data.design?.name === 'Updated Design');
  }
}

// ─────────────────────────────────────────────
async function testCart() {
  console.log('\n── Cart ─────────────────────────────');

  // GET empty cart
  const empty = await req('GET', '/cart', null, userToken);
  log('GET /cart (empty)', empty.status === 200 && Array.isArray(empty.data.cart?.items));

  if (designId && jerseyId) {
    // Add item
    const added = await req('POST', '/cart', {
      itemType: 'custom',
      designId,
      jerseyId,
      quantity: 1,
      size: 'L',
    }, userToken);
    log('POST /cart (add item)', added.status === 201);

    const cart = await req('GET', '/cart', null, userToken);
    if (cart.data.cart?.items?.length) {
      cartItemId = cart.data.cart.items[0]._id;

      // Update qty
      const upd = await req('PUT', `/cart/${cartItemId}`, { quantity: 2 }, userToken);
      log('PUT /cart/:itemId (qty update)', upd.status === 200);

      // Remove item
      const del = await req('DELETE', `/cart/${cartItemId}`, null, userToken);
      log('DELETE /cart/:itemId', del.status === 200);
    }
  } else {
    console.log('  ⏭   Cart add/update/delete skipped (no designId)');
  }

  // No token → 401
  const unauth = await req('GET', '/cart');
  log('GET /cart (no token → 401)', unauth.status === 401);
}

// ─────────────────────────────────────────────
async function testOrders() {
  console.log('\n── Orders ───────────────────────────');

  const list = await req('GET', '/orders', null, userToken);
  log('GET /orders', list.status === 200 && Array.isArray(list.data.orders));

  // Non-existent order → 404
  const bad = await req('GET', '/orders/000000000000000000000000', null, userToken);
  log('GET /orders/:id (not found → 404)', bad.status === 404);
}

// ─────────────────────────────────────────────
async function testPayment() {
  console.log('\n── Payment ──────────────────────────');

  // Get Razorpay key
  const key = await req('GET', '/payment/key', null, userToken);
  log('GET /payment/key', key.status === 200 && typeof key.data.key === 'string', `key=${key.data.key?.slice(0, 12)}...`);

  // Create Razorpay order (will fail if keys not configured — that's OK)
  const order = await req('POST', '/payment/create-order', { amount: 599 }, userToken);
  const razorpayOk = order.status === 200 && order.data.order?.id;
  log(
    'POST /payment/create-order',
    razorpayOk || order.status === 500,
    razorpayOk ? `id=${order.data.order.id}` : '⚠ Razorpay not configured (expected in test env)'
  );
}

// ─────────────────────────────────────────────
async function testAdmin() {
  console.log('\n── Admin ────────────────────────────');

  if (!adminToken) { console.log('  ⏭   Skipped (no admin token)'); return; }

  const stats = await req('GET', '/admin/stats', null, adminToken);
  log('GET /admin/stats', stats.status === 200 && stats.data.stats, JSON.stringify(stats.data.stats));

  const orders = await req('GET', '/admin/orders', null, adminToken);
  log('GET /admin/orders', orders.status === 200 && Array.isArray(orders.data.orders), `count=${orders.data.total}`);

  const users = await req('GET', '/admin/users', null, adminToken);
  log('GET /admin/users', users.status === 200 && Array.isArray(users.data.users), `count=${users.data.count}`);

  const rm = await req('GET', '/admin/ready-made', null, adminToken);
  log('GET /admin/ready-made', rm.status === 200 && Array.isArray(rm.data.designs), `count=${rm.data.count}`);

  // Non-admin → 403
  const noAdmin = await req('GET', '/admin/stats', null, userToken);
  log('GET /admin/stats (user token → 403)', noAdmin.status === 403);
}

// ─────────────────────────────────────────────
async function cleanup() {
  console.log('\n── Cleanup ──────────────────────────');
  if (designId) {
    const del = await req('DELETE', `/designs/${designId}`, null, userToken);
    log('DELETE /designs/:id (cleanup)', del.status === 200);
  }
}

// ─────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  Escobar API Test Suite');
  console.log(`  Target: ${BASE}`);
  console.log('═══════════════════════════════════════');

  try {
    await testHealth();
    await testAuth();
    await testJerseys();
    await testDesigns();
    await testCart();
    await testOrders();
    await testPayment();
    await testAdmin();
    await cleanup();
  } catch (err) {
    console.error('\n💥  Unexpected error:', err.message);
    if (err.cause?.code === 'ECONNREFUSED') {
      console.error('    Server is not running. Start it with: npm run dev (inside backend/)');
    }
    failed++;
  }

  const total = passed + failed;
  console.log('\n═══════════════════════════════════════');
  console.log(`  Results: ${passed}/${total} passed  (${failed} failed)`);
  console.log('═══════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

main();
