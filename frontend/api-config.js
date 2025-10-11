// Configurazione API Backend
const API_URL = 'https://portulu-api.onrender.com'; // SOSTITUISCI con il tuo URL Render

// Helper per chiamate API
const api = {
  async call(endpoint, options = {}) {
    const token = localStorage.getItem('portulu_token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Errore di rete');
    }
    
    return response.json();
  },
  
  get(endpoint) {
    return this.call(endpoint);
  },
  
  post(endpoint, data) {
    return this.call(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  patch(endpoint, data) {
    return this.call(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};
