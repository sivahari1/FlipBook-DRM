// Script to check if deployment is working
const https = require('https');

async function checkDeployment() {
  console.log('🔍 Checking deployment status...');
  
  const url = 'https://flip-book-drm.vercel.app';
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check if the page contains the updated pricing
        if (data.includes('₹999')) {
          console.log('✅ SUCCESS: Deployment working! ₹999 pricing found.');
          console.log('🎉 The 1 Month Plan is now showing the correct price.');
        } else if (data.includes('₹1,999')) {
          console.log('❌ ISSUE: Still showing old price ₹1,999');
          console.log('🔄 Deployment may still be in progress or not triggered.');
        } else {
          console.log('⚠️  WARNING: Could not find pricing information.');
          console.log('📄 Page loaded but pricing section not detected.');
        }
        
        console.log(`📊 Response status: ${res.statusCode}`);
        console.log(`📏 Page size: ${data.length} characters`);
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.error('⏰ Request timed out');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Run the check
checkDeployment()
  .then(() => {
    console.log('\n📋 Next steps if deployment is not working:');
    console.log('1. Go to Vercel Dashboard → Deployments');
    console.log('2. Click "Redeploy" on latest deployment');
    console.log('3. Uncheck "Use existing Build Cache"');
    console.log('4. Wait 2-3 minutes and check again');
  })
  .catch((error) => {
    console.error('💥 Check failed:', error.message);
  });