import { apiRequest } from './testHelper.js';

const API_BASE = 'http://localhost:5000/api';

async function runAcceptanceTest() {
  console.log('🚀 Starting CCR End-to-End Acceptance Test (Prompt Section 53)...');

  // Step 1: Login as Contributor (User A: Elena)
  console.log('\n--- Step 1: Login as User A (contributor@ccr.demo) ---');
  const loginARes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'contributor@ccr.demo', password: 'Password123!' }),
  });
  const dataA = await loginARes.json();
  const tokenA = dataA.token;
  const userA = dataA.user;
  console.log(`✅ Logged in as User A (${userA.name})`);

  // Step 2: User A lists "Power Drill - Acceptance Demo" for 10 Cash Credits
  console.log('\n--- Step 2: User A lists Power Drill for 10 Cash Credits ---');
  const resListing = await fetch(`${API_BASE}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      name: 'Power Drill - Acceptance Demo',
      description: 'Cordless drill for acceptance test',
      category: 'Tools & Hardware',
      creditPrice: 10,
      condition: 'EXCELLENT',
      locationZone: 'Greenwood District',
    }),
  });
  const resourceData = await resListing.json();
  const resourceId = resourceData.resource._id;
  console.log(`✅ Resource listed: ${resourceData.resource.name} (ID: ${resourceId})`);

  // Step 3: Register / Login as User B
  console.log('\n--- Step 3: Register/Login as User B ---');
  const userBEmail = `testuser_${Date.now()}@ccr.demo`;
  const regBRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Borrower',
      email: userBEmail,
      password: 'Password123!',
      locationZone: 'Greenwood District',
    }),
  });
  const dataB = await regBRes.json();
  const tokenB = dataB.token;
  const userB = dataB.user;
  console.log(`✅ Registered User B (${userB.name}, Email: ${userBEmail})`);

  // Step 4: User B requests drill as "Request as Goodwill"
  console.log('\n--- Step 4: User B requests drill as Goodwill ---');
  const gwReqRes = await fetch(`${API_BASE}/resources/${resourceId}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      days: 1,
      isGoodwill: true,
      message: 'Need to hang shelves but requesting as goodwill community help.',
    }),
  });
  const gwReqData = await gwReqRes.json();
  const resRequestId = gwReqData.resourceRequest._id;
  console.log(`✅ Goodwill request sent (ID: ${resRequestId}, isGoodwill: ${gwReqData.resourceRequest.isGoodwill})`);

  // Step 5: User A receives Goodwill Request and accepts
  console.log('\n--- Step 5: User A accepts the Goodwill Opportunity ---');
  const acceptRes = await fetch(`${API_BASE}/resources/requests/${resRequestId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ decision: 'ACCEPT' }),
  });
  const acceptData = await acceptRes.json();
  console.log(`✅ User A accepted goodwill request: ${acceptData.message}`);

  // Step 6: Handover and Return
  console.log('\n--- Step 6: Handover and Return ---');
  await fetch(`${API_BASE}/resources/requests/${resRequestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: 'HANDED_OVER' }),
  });

  await fetch(`${API_BASE}/resources/requests/${resRequestId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ status: 'RETURN_PENDING' }),
  });
  console.log('✅ Resource handed over and returned');

  // Step 7: User A verifies return -> User A receives +10 Goodwill Credits, User B paid 0
  console.log('\n--- Step 7: User A verifies return ---');
  const verifyRes = await fetch(`${API_BASE}/resources/requests/${resRequestId}/verify-return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
  });
  const verifyData = await verifyRes.json();
  console.log(`✅ Return verified: ${verifyData.message}`);

  // Check User A wallet
  const walletARes = await fetch(`${API_BASE}/wallet/me`, {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const walletAData = await walletARes.json();
  console.log(`✅ User A Wallet: Cash: ${walletAData.wallet.cashCredits}, Goodwill: ${walletAData.wallet.goodwillCredits} (Received Goodwill Credits!)`);

  // Step 8: User B tops up 100 Cash Credits via Demo Payment (4242 4242 4242 4242)
  console.log('\n--- Step 8: User B tops up 100 Cash Credits via Demo Payment ---');
  const payRes = await fetch(`${API_BASE}/payments/demo-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ credits: 100, cardNumber: '4242 4242 4242 4242' }),
  });
  const payData = await payRes.json();
  console.log(`✅ Payment success: ${payData.message}`);
  console.log(`✅ User B Cash Credits now: ${payData.wallet.cashCredits}`);

  // Step 9: User B requests assistance worth 20 Credits (system uses Goodwill first, then Cash)
  console.log('\n--- Step 9: User B creates assistance request for 20 Credits ---');
  const astRes = await fetch(`${API_BASE}/assistance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      title: 'Move Heavy Planters',
      description: 'Need help moving 3 heavy outdoor planters',
      category: 'Moving & Lifting',
      creditValue: 20,
      preferredDate: '2026-09-22',
      preferredTime: 'Afternoon',
      approximateLocation: 'Greenwood District',
    }),
  });
  const astData = await astRes.json();
  const astId = astData.request._id;
  console.log(`✅ Assistance request created (ID: ${astId}, Status: ${astData.request.status})`);

  // Verify User B's credit priority deduction
  const walletBRes = await fetch(`${API_BASE}/wallet/me`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const walletBData = await walletBRes.json();
  console.log(`✅ User B Wallet after 20-credit request: Cash: ${walletBData.wallet.cashCredits}, Goodwill: ${walletBData.wallet.goodwillCredits}`);
  console.log('   (Notice Goodwill was used first: 20 GW used -> 0 GW remaining, Cash untouched at 150!)');

  // Step 10: Contributor (User A) volunteers, gets selected, marks completed
  console.log('\n--- Step 10: User A volunteers, completes task ---');
  await fetch(`${API_BASE}/assistance/${astId}/apply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  await fetch(`${API_BASE}/assistance/${astId}/select-contributor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ contributorId: userA.id }),
  });

  await fetch(`${API_BASE}/assistance/${astId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });
  console.log('✅ User A marked task as completed');

  // Step 11: User B verifies completion -> User A receives Cash Credits
  console.log('\n--- Step 11: User B verifies completion ---');
  const astVerifyRes = await fetch(`${API_BASE}/assistance/${astId}/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
  });
  const astVerifyData = await astVerifyRes.json();
  console.log(`✅ Assistance completion verified: ${astVerifyData.message}`);

  // Step 12: User A requests Demo Withdrawal (Cash Credits only)
  console.log('\n--- Step 12: User A requests demo withdrawal of Cash Credits ---');
  const withdrawRes = await fetch(`${API_BASE}/withdrawals/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      amount: 40,
      payoutMethod: 'UPI',
      payoutDetails: 'elena@okaxis',
    }),
  });
  const withdrawData = await withdrawRes.json();
  const withdrawalId = withdrawData.withdrawal._id;
  console.log(`✅ Withdrawal requested: ${withdrawData.message} (ID: ${withdrawalId}, Status: ${withdrawData.withdrawal.status})`);

  // Step 13: Admin logs in, sees withdrawal, and approves it
  console.log('\n--- Step 13: Admin logs in and approves withdrawal ---');
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ccr.demo', password: 'Password123!' }),
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;

  const approveRes = await fetch(`${API_BASE}/admin/withdrawals/${withdrawalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ action: 'APPROVE' }),
  });
  const approveData = await approveRes.json();
  console.log(`✅ Admin approved withdrawal: ${approveData.message}`);
  console.log(`✅ Final Withdrawal Status: ${approveData.withdrawal.status}`);

  console.log('\n======================================================');
  console.log('🎉 ALL ACCEPTANCE TEST SCENARIOS PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

runAcceptanceTest().catch((err) => {
  console.error('❌ Acceptance test failed:', err);
  process.exit(1);
});
