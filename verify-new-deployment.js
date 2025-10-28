// Script to verify new Vercel deployment
const https = require('https');

async function verifyDeployment(url) {
  console.log(`🔍 Verifying deployment at: ${url}`);
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response status: ${res.statusCode}`);
        
        // Check for pricing
        if (data.includes('₹999')) {
          console.log('✅ SUCCESS: ₹999 pricing found!');
          console.log('🎉 1 Month Plan shows correct price');
        } else if (data.includes('₹1,999')) {
          console.log('❌ ISSUE: Still showing old price ₹1,999');
        } else {
          console.log('⚠️  WARNING: No pricing information found');
        }
        
        // Check for key components
        const checks = [
          { name: 'FlipBook DRM', found: data.includes('FlipBook DRM') },
          { name: 'Pricing Section', found: data.includes('Month Plan') },
          { name: 'Free Trial', found: data.includes('Free Trial') },
          { name: 'Features', found: data.includes('premium features') },
          { name: 'Sign In', found: data.includes('Sign In') }
        ];
        
        console.log('\n📋 Component Check:');
        checks.forEach(check => {
          console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
        });
        
        const allGood = checks.every(check => check.found) && data.includes('₹999');
        
        if (allGood) {
          console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
          console.log('✅ All components working');
          console.log('✅ Pricing updated correctly');
        } else {
          console.log('\n⚠️  DEPLOYMENT NEEDS ATTENTION');
          console.log('Some components may not be working correctly');
        }
        
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

// Usage: node verify-new-deployment.js https://your-new-app.vercel.app
const url = process.argv[2];

if (!url) {
  console.log('Usage: node verify-new-deployment.js https://your-new-app.vercel.app');
  process.exit(1);
}

verifyDeployment(url)
  .then(() => {
    console.log('\n📝 Next steps:');
    console.log('1. Test document upload functionality');
    console.log('2. Test share link creation');
    console.log('3. Set up database via /api/setup/database');
    console.log('4. Update your custom domain if needed');
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error.message);
  });