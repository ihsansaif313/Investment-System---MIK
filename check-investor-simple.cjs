const { MongoClient } = require('mongodb');

async function checkInvestorSimple() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('investment_management');
    
    console.log('Checking investor user...\n');
    
    const user = await db.collection('users').findOne({ 
      email: 'investor1.demo@gmail.com' 
    });
    
    if (user) {
      console.log(`User found: ${user.email}`);
      console.log(`Has password: ${user.password ? 'Yes' : 'No'}`);
      console.log(`Password starts with: ${user.password ? user.password.substring(0, 10) + '...' : 'N/A'}`);
      console.log(`Role: ${user.role?.type || 'unknown'}`);
      console.log(`Status: ${user.status || 'unknown'}`);
      console.log(`Created: ${user.created_at || 'unknown'}`);
      
      // Check if it's a bcrypt hash (should start with $2b$)
      if (user.password) {
        console.log(`Is bcrypt hash: ${user.password.startsWith('$2b$') ? 'Yes' : 'No'}`);
      }
    } else {
      console.log('User not found');
    }
    
    // Also check admin user for comparison
    console.log('\nChecking admin user for comparison...');
    const adminUser = await db.collection('users').findOne({ 
      email: 'admin.demo@investpro.com' 
    });
    
    if (adminUser) {
      console.log(`Admin user: ${adminUser.email}`);
      console.log(`Has password: ${adminUser.password ? 'Yes' : 'No'}`);
      console.log(`Password starts with: ${adminUser.password ? adminUser.password.substring(0, 10) + '...' : 'N/A'}`);
      console.log(`Is bcrypt hash: ${adminUser.password && adminUser.password.startsWith('$2b$') ? 'Yes' : 'No'}`);
    }
    
    await client.close();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkInvestorSimple();
