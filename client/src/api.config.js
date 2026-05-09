const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://senitel-ai-production-6e18.up.railway.app';
export default API_BASE_URL;
