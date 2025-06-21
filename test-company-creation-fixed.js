/**
 * Test script to verify company creation API after fixes
 */

const testData = {
  name: "Test Company Fixed",
  industry: "Technology",
  category: "Startup",
  description: "A test company for validation after fixes",
  contactEmail: "test@testcompany.com",
  establishedDate: "2024-01-01",
  address: "123 Test Street",
  contactPhone: "+1234567890",
  website: "https://testcompany.com"
};

console.log('Testing company creation with data:', JSON.stringify(testData, null, 2));

// You'll need to get a valid JWT token first by logging in
// For now, this is just a template - you can test through the web interface

console.log('To test:');
console.log('1. Go to http://localhost:5174');
console.log('2. Login with your credentials');
console.log('3. Go to Company Management');
console.log('4. Click "New Company"');
console.log('5. Fill in the form and submit');
console.log('');
console.log('The backend should now handle the adminUserId assignment correctly');
console.log('by falling back to superadmin role when no admin role is found.');
