import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for authentication and logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response) {
      console.error('Error response:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

// Helper function to create headers with authentication
const getAuthHeaders = (token) => {
  return token ? { Authorization: `Token ${token}` } : {};
};

export const gameAPI = {
  // Start a new game (authenticated)
  startGame: async (token) => {
    try {
      const response = await apiClient.post('/games/start_game/', {}, {
        headers: getAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to start game: ${error.message}`);
    }
  },

  // Update game state (authenticated)
  updateGame: async (gameId, gameData, token) => {
    try {
      const response = await apiClient.post(`/games/${gameId}/update_game/`, gameData, {
        headers: getAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update game: ${error.message}`);
    }
  },

  // End game (authenticated)
  endGame: async (gameId, token) => {
    try {
      const response = await apiClient.post(`/games/${gameId}/end_game/`, {}, {
        headers: getAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to end game: ${error.message}`);
    }
  },

  // Get high scores (can be called with or without auth)
  getHighScores: async (token = null) => {
    try {
      const headers = token ? getAuthHeaders(token) : {};
      const response = await apiClient.get('/games/high_scores/', { headers });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch high scores:', error.message);
      return []; // Return empty array if high scores can't be fetched
    }
  },

  // Generate random food position
  generateFood: async () => {
    try {
      const response = await apiClient.get('/games/generate_food/');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to generate food: ${error.message}`);
    }
  },

  // Get game session details (authenticated)
  getGame: async (gameId, token) => {
    try {
      const response = await apiClient.get(`/games/${gameId}/`, {
        headers: getAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get game: ${error.message}`);
    }
  },

  // Get user's game sessions (authenticated)
  getUserGames: async (token) => {
    try {
      const response = await apiClient.get('/games/', {
        headers: getAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get games: ${error.message}`);
    }
  },

  // Authentication endpoints
  auth: {
    // Register new user
    register: async (userData) => {
      try {
        const response = await apiClient.post('/auth/register/', userData);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: error.message };
      }
    },

    // Login user
    login: async (credentials) => {
      try {
        const response = await apiClient.post('/auth/login/', credentials);
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: error.message };
      }
    },

    // Logout user
    logout: async (token) => {
      try {
        await apiClient.post('/auth/logout/', {}, {
          headers: getAuthHeaders(token)
        });
      } catch (error) {
        console.warn('Logout request failed:', error.message);
      }
    },

    // Get user profile
    getProfile: async (token) => {
      try {
        const response = await apiClient.get('/auth/profile/', {
          headers: getAuthHeaders(token)
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || { error: error.message };
      }
    }
  },

  // Online players endpoints
  getOnlinePlayers: async (token) => {
    try {
      const response = await apiClient.get('/online-players/', {
        headers: getAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch online players:', error.message);
      return [];
    }
  },

  // Send ping to update online status
  ping: async (token) => {
    try {
      await apiClient.post('/ping/', {}, {
        headers: getAuthHeaders(token)
      });
    } catch (error) {
      console.warn('Ping failed:', error.message);
    }
  }
};

export default gameAPI;
