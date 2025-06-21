const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function checkInvestorPassword() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('investment_management');
    
    console.log('Checking investor password...\n');
    
    const user = await db.collection('users').findOne({ 
      email: 'investor1.demo@gmail.com' 
    });
    
    if (user) {
      console.log(`User found: ${user.email}`);
      console.log(`Has password: ${user.password ? 'Yes' : 'No'}`);
      console.log(`Password length: ${user.password ? user.password.length : 0}`);
      console.log(`Role: ${user.role?.type || 'unknown'}`);
      console.log(`Status: ${user.status || 'unknown'}`);
      
      // Test password verification
      if (user.password) {
        const testPassword = 'Investor123!';
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`Password '${testPassword}' is valid: ${isValid}`);
        
        if (!isValid) {
          console.log('\nUpdating password...');
          const hashedPassword = await bcrypt.hash(testPassword, 10);
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
          );
          console.log('✅ Password updated successfully');
        }
      } else {
        console.log('\nCreating password...');
        const testPassword = 'Investor123!';
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        console.log('✅ Password created successfully');
      }
    } else {
      console.log('User not found');
    }
    
    await client.close();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkInvestorPassword();
