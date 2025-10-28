// Database setup script to fix empty Supabase database
const https = require('https');

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  // Your deployed Vercel URL - replace with your actual URL
  const url = 'https://flip-book-drm.vercel.app/api/setup/database';
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Database setup response:', result);
          resolve(result);
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.end();
  });
}

// Run the setup
setupDatabase()
  .then((result) => {
    if (result.success) {
      console.log('🎉 Database setup completed successfully!');
      console.log('📊 Database info:', result.database);
    } else {
      console.error('❌ Database setup failed:', result.message);
    }
  })
  .catch((error) => {
    console.error('💥 Setup script failed:', error);
  });