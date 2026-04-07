import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing health endpoint...');
    const healthRes = await fetch('http://localhost:5000/health');
    console.log('Health status:', healthRes.status);
    const healthData = await healthRes.json();
    console.log('Health data:', JSON.stringify(healthData, null, 2));

    console.log('\nTesting interview start...');
    const startRes = await fetch('http://localhost:5000/api/interview/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        type: 'technical',
        domain: 'web development',
        difficulty: 'medium',
        totalQuestions: 1,
        answers: []
      })
    });
    console.log('Start interview status:', startRes.status);
    const startData = await startRes.json();
    console.log('Start data:', JSON.stringify(startData, null, 2));

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAPI();