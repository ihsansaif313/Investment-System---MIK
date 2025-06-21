const { MongoClient } = require('mongodb');

async function checkAdminUsers() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('investment_management');
    
    console.log('Checking admin users...\n');
    
    const users = await db.collection('users').find({ 'role.type': 'admin' }).toArray();
    
    if (users.length === 0) {
      console.log('❌ No admin users found');
    } else {
      console.log('Admin users:');
      users.forEach(user => {
        console.log(`- ${user.email} (Status: ${user.status || 'active'})`);
      });
    }
    
    // Also check superadmin users
    const superadmins = await db.collection('users').find({ 'role.type': 'superadmin' }).toArray();
    
    if (superadmins.length > 0) {
      console.log('\nSuperadmin users:');
      superadmins.forEach(user => {
        console.log(`- ${user.email} (Status: ${user.status || 'active'})`);
      });
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAdminUsers();
