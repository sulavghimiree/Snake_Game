// Clear User Data Utility
// Run this in the browser console at localhost:3000 to clear all stored user data

console.log('Clearing all user data...');

// Clear localStorage
localStorage.removeItem('authToken');
localStorage.removeItem('username');
localStorage.removeItem('userId');
localStorage.removeItem('userProfile');

// Clear sessionStorage
sessionStorage.clear();

// Clear any other game-related data
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('snake') || key.includes('game') || key.includes('user'))) {
        keysToRemove.push(key);
    }
}

keysToRemove.forEach(key => localStorage.removeItem(key));

console.log('User data cleared successfully!');
console.log('Please refresh the page to see changes.');

// Optionally reload the page
// window.location.reload();
