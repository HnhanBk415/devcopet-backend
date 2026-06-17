/**
 * Test script cho Onboarding API
 * Chạy: node test-onboarding.mjs
 */

const BASE = 'http://localhost:3000';

async function main() {
  console.log('=== 1. GET /onboarding/questions ===\n');
  const qRes = await fetch(`${BASE}/onboarding/questions`);
  const questions = await qRes.json();
  console.log(`Total questions: ${questions.totalQuestions}`);
  console.log(`Traits: ${questions.traits.join(', ')}`);
  console.log(`\nFirst question:`);
  const q1 = questions.questions[0];
  console.log(`  #${q1.questionNumber}: ${q1.titleVi}`);
  console.log(`  ${q1.titleEn}`);
  q1.options.forEach(o => console.log(`    ${o.key}. ${o.textEn} → ${JSON.stringify(o.scores)}`));

  // 2. Register a test user
  console.log('\n=== 2. Register test user ===\n');
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testuser_' + Date.now(),
      email: `test_${Date.now()}@test.com`,
      password: 'Test123456!',
    }),
  });
  const regData = await regRes.json();
  console.log('Register:', JSON.stringify(regData, null, 2));

  if (!regData.user) {
    console.log('Register failed, trying login instead...');
  }

  // 3. Login
  console.log('\n=== 3. Login ===\n');
  const email = regData.user?.email || `test_${Date.now()}@test.com`;
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: 'Test123456!',
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login:', JSON.stringify(loginData, null, 2));

  const token = loginData.accessToken;
  if (!token) {
    console.log('No token, cannot test submit.');
    return;
  }

  // 4. Submit answers (all A for simplicity)
  console.log('\n=== 4. POST /onboarding/submit ===\n');
  const answers = questions.questions.map(q => ({
    questionNumber: q.questionNumber,
    selectedOption: q.options[0].key, // pick first option
  }));

  const submitRes = await fetch(`${BASE}/onboarding/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });
  const submitData = await submitRes.json();
  console.log('Submit result:', JSON.stringify(submitData, null, 2));

  // 5. Get personality
  console.log('\n=== 5. GET /onboarding/personality ===\n');
  const persRes = await fetch(`${BASE}/onboarding/personality`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const persData = await persRes.json();
  console.log('Personality:', JSON.stringify(persData, null, 2));

  console.log('\n=== DONE ===');
}

main().catch(console.error);
