// Admin Authentication Handler
// This script should be included in all admin pages

// Check if user is authenticated
function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    // Redirect to login if not authenticated
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// Store auth token after login
function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

// Get auth token
function getAuthToken() {
  return localStorage.getItem('authToken') || '';
}

// Logout function
function logout() {
  localStorage.removeItem('authToken');
  window.location.href = '/login.html';
}

// Add auth header to fetch requests
function getAuthHeaders(additionalHeaders = {}) {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...additionalHeaders,
  };
}

// Handle API errors
async function handleApiResponse(response) {
  if (response.status === 401) {
    alert('Session expired. Please login again.');
    logout();
    return null;
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Check auth on page load
// Note: Comment this out if you want to test without login
// checkAuth();
