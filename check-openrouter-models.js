// Test script to check available OpenRouter models
const https = require('https');

const checkAvailableModels = () => {
  const options = {
    hostname: 'openrouter.ai',
    port: 443,
    path: '/api/v1/models',
    method: 'GET',
    headers: {
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
      try {
        const parsedData = JSON.parse(responseData);
        console.log('Available Models:');
        console.log('==================');
        
        // Filter for free or popular models
        const freeModels = parsedData.data.filter(model => 
          model.id.includes(':free') || 
          model.context_length > 8000 ||
          model.top_provider.context_length > 8000
        );

        console.log('\n📝 Free/Popular Models:');
        freeModels.slice(0, 20).forEach(model => {
          console.log(`• ${model.id} (${model.top_provider.context_length || model.context_length} tokens)`);
        });

        console.log(`\nTotal models available: ${parsedData.data.length}`);
        console.log(`Free/Popular models shown: ${freeModels.slice(0, 20).length}`);
        
      } catch (error) {
        console.log('Error parsing models response:');
        console.log(responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
};

console.log('Checking available OpenRouter models...');
checkAvailableModels();