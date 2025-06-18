// Clear browser cache and localStorage for fresh installation testing
console.log('🧹 Clearing browser cache and localStorage...');

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.clear();
  console.log('✅ localStorage cleared');
}

// Clear sessionStorage
if (typeof sessionStorage !== 'undefined') {
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');
}

// Clear any cached API responses
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
    console.log('✅ Cache API cleared');
  });
}

console.log('🎉 Browser cache cleared for fresh installation testing');
