const { MongoClient, ObjectId } = require('mongodb');

async function fixInvestorRoles() {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    const db = client.db('investment_management');
    
    console.log('Fixing investor user roles...\n');
    
    // Get all users with investor emails
    const investorUsers = await db.collection('users').find({ 
      email: { $regex: 'investor', $options: 'i' } 
    }).toArray();
    
    console.log(`Found ${investorUsers.length} investor users to fix`);
    
    // Create or update roles for investor users
    for (const user of investorUsers) {
      console.log(`Fixing user: ${user.email}`);
      
      // Check if role exists
      let role = await db.collection('roles').findOne({ user_id: user._id });
      
      if (!role) {
        // Create new role
        const newRole = {
          _id: new ObjectId(),
          user_id: user._id,
          type: 'investor',
          status: 'active',
          permissions: ['view_investments', 'create_investment', 'view_portfolio'],
          created_at: new Date()
        };
        
        await db.collection('roles').insertOne(newRole);
        console.log(`  ✅ Created new investor role`);
        
        // Update user with role reference
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              role: {
                _id: newRole._id,
                type: 'investor',
                status: 'active',
                permissions: newRole.permissions,
                created_at: newRole.created_at
              },
              status: 'active'
            }
          }
        );
        console.log(`  ✅ Updated user with role reference`);
      } else {
        // Update existing role
        await db.collection('roles').updateOne(
          { _id: role._id },
          { 
            $set: { 
              type: 'investor',
              status: 'active',
              permissions: ['view_investments', 'create_investment', 'view_portfolio']
            }
          }
        );
        
        // Update user with role reference
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              role: {
                _id: role._id,
                type: 'investor',
                status: 'active',
                permissions: ['view_investments', 'create_investment', 'view_portfolio'],
                created_at: role.created_at || new Date()
              },
              status: 'active'
            }
          }
        );
        console.log(`  ✅ Updated existing role`);
      }
    }
    
    // Verify the fix
    console.log('\nVerifying fix...');
    const updatedUsers = await db.collection('users').find({ 
      email: { $regex: 'investor', $options: 'i' } 
    }).toArray();
    
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Role: ${user.role?.type || 'unknown'} - Status: ${user.status || 'unknown'}`);
    });
    
    await client.close();
    console.log('\n✅ Investor roles fixed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixInvestorRoles();
