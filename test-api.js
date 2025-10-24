const fetch = require('node-fetch');

async function testPromptAPI() {
  try {
    console.log('Testing prompt creation API...');

    const response = await fetch('http://localhost:3000/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Prompt',
        templateType: 'diary',
        promptText: 'This is a test prompt',
        isDefault: false,
      }),
    });

    console.log('Response status:', response.status);
    console.log(
      'Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.text();
    console.log('Response body:', data);

    if (response.status === 201) {
      console.log('✅ API test passed - prompt created successfully');
    } else {
      console.log('❌ API test failed - unexpected status code');
    }
  } catch (error) {
    console.error('❌ API test failed with error:', error.message);
  }
}

testPromptAPI();
