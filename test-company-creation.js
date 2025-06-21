/**
 * Test script to verify company creation API
 */

const testData = {
  name: "Test Company",
  industry: "Technology",
  category: "Startup",
  description: "A test company for validation",
  contactEmail: "test@testcompany.com",
  establishedDate: "2024-01-01",
  address: "123 Test Street",
  contactPhone: "+1234567890",
  website: "https://testcompany.com"
};

console.log('Testing company creation with data:', JSON.stringify(testData, null, 2));

fetch('http://localhost:3001/api/companies/sub', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'll need to replace this
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response data:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
});
