// Test script for OpenRouter API
const https = require('https');

const testOpenRouterAPI = () => {
  const data = JSON.stringify({
    model: "kwaipilot/kat-coder-pro:free",
    messages: [
      {
        role: "user",
        content: "What is the meaning of life?"
      }
    ],
    max_tokens: 100
  });

  const options = {
    hostname: 'openrouter.ai',
    port: 443,
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Interview Assistant Test'
    }
  };

  const req = https.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response Headers:', res.headers);
      
      try {
        const parsedData = JSON.parse(responseData);
        console.log('\n=== SUCCESS ===');
        console.log('API Response:', JSON.stringify(parsedData, null, 2));
        
        if (parsedData.choices && parsedData.choices[0] && parsedData.choices[0].message) {
          console.log('\n=== ASSISTANT RESPONSE ===');
          console.log(parsedData.choices[0].message.content);
        }
      } catch (error) {
        console.log('\n=== ERROR PARSING JSON ===');
        console.log('Raw response:', responseData);
        console.log('Parse error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('\n=== REQUEST ERROR ===');
    console.error('Error:', error.message);
  });

  req.write(data);
  req.end();
};

console.log('Testing OpenRouter API...');
console.log('Model: kwaipilot/kat-coder-pro:free');
console.log('API: https://openrouter.ai/api/v1');
console.log('Question: "What is the meaning of life?"');
console.log('\n' + '='.repeat(50) + '\n');

testOpenRouterAPI();
