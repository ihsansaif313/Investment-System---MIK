const { MongoClient } = require('mongodb');

async function checkInvestorUsers() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('investment_management');
    
    console.log('Checking investor users...\n');
    
    const users = await db.collection('users').find({ 'role.type': 'investor' }).toArray();
    console.log(`Found ${users.length} investor users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Status: ${user.status || 'active'}`);
      console.log(`   Role: ${user.role?.type || 'unknown'}`);
      console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Also check if there are any users with email containing 'investor'
    const investorEmails = await db.collection('users').find({ 
      email: { $regex: 'investor', $options: 'i' } 
    }).toArray();
    
    console.log(`\nUsers with 'investor' in email: ${investorEmails.length}`);
    investorEmails.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Role: ${user.role?.type || 'unknown'}`);
    });
    
    await client.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkInvestorUsers();
