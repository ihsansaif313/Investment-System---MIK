/**
 * Fix Demo User Roles
 * Corrects the role assignments for demo users
 */

const { MongoClient, ObjectId } = require('mongodb');

console.log('🔧 Fixing Demo User Roles...\n');

const MONGODB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'investment_management';

// Correct role assignments
const ROLE_FIXES = [
  { email: 'superadmin.demo@investpro.com', role: { type: 'superadmin', id: 'superadmin' } },
  { email: 'admin1.demo@investpro.com', role: { type: 'admin', id: 'admin' } },
  { email: 'admin2.demo@investpro.com', role: { type: 'admin', id: 'admin' } },
  { email: 'investor1.demo@investpro.com', role: { type: 'investor', id: 'investor' } },
  { email: 'investor2.demo@investpro.com', role: { type: 'investor', id: 'investor' } },
  { email: 'investor3.demo@investpro.com', role: { type: 'investor', id: 'investor' } }
];

async function fixUserRoles() {
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    
    console.log('📝 Updating user roles...');
    
    for (const fix of ROLE_FIXES) {
      const result = await db.collection('users').updateOne(
        { email: fix.email },
        { 
          $set: { 
            role: fix.role,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`   ✅ Updated ${fix.email} to ${fix.role.type}`);
      } else {
        console.log(`   ⚠️ User ${fix.email} not found or already correct`);
      }
    }
    
    // Verify the fixes
    console.log('\n🔍 Verifying role fixes...');
    const users = await db.collection('users').find({ 
      email: { $in: ROLE_FIXES.map(f => f.email) } 
    }).toArray();
    
    users.forEach(user => {
      const expectedRole = ROLE_FIXES.find(f => f.email === user.email)?.role.type;
      const actualRole = user.role?.type;
      
      if (expectedRole === actualRole) {
        console.log(`   ✅ ${user.email}: ${actualRole}`);
      } else {
        console.log(`   ❌ ${user.email}: Expected ${expectedRole}, got ${actualRole}`);
      }
    });
    
    await client.close();
    
    console.log('\n🎉 User role fixes completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Role fix failed:', error.message);
    return false;
  }
}

// Run the fix
fixUserRoles()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Execution error:', error);
    process.exit(1);
  });
