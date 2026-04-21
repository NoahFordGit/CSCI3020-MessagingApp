import { appParams } from '@/lib/app-params';

const BASE_URL = appParams.apiUrl;

class APIClient {
  constructor() {
    this.baseURL = BASE_URL;
    this.currentUser = null;
    this.subscriptions = new Map();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json().catch(() => ({}));
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Users API
  async getCurrentUser() {
    try {
      // Since we don't have authentication yet, return a mock user
      // This should be updated when authentication is implemented
      return this.currentUser || { id: 'u1', username: 'Guest', email: 'guest@example.com' };
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  async getUsers() {
    return this.request('/users');
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Servers API
  async getServers() {
    return this.request('/servers');
  }

  async getServer(serverId) {
    return this.request(`/servers/${serverId}`);
  }

  async createServer(serverData) {
    return this.request('/servers', {
      method: 'POST',
      body: JSON.stringify(serverData),
    });
  }

  async updateServer(serverId, serverData) {
    return this.request(`/servers/${serverId}`, {
      method: 'PUT',
      body: JSON.stringify(serverData),
    });
  }

  async deleteServer(serverId) {
    return this.request(`/servers/${serverId}`, {
      method: 'DELETE',
    });
  }

  // Channels API
  async getChannels(serverId) {
    return this.request(`/channels?server_id=${serverId}`);
  }

  async getChannel(channelId) {
    return this.request(`/channels/${channelId}`);
  }

  async createChannel(channelData) {
    return this.request('/channels', {
      method: 'POST',
      body: JSON.stringify(channelData),
    });
  }

  async updateChannel(channelId, channelData) {
    return this.request(`/channels/${channelId}`, {
      method: 'PUT',
      body: JSON.stringify(channelData),
    });
  }

  async deleteChannel(channelId) {
    return this.request(`/channels/${channelId}`, {
      method: 'DELETE',
    });
  }

  // Messages API
  async getMessages(channelId, limit = 100) {
    return this.request(`/messages?channel_id=${channelId}&limit=${limit}`);
  }

  async createMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async updateMessage(messageId, messageData) {
    return this.request(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(messageData),
    });
  }

  async deleteMessage(messageId) {
    return this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // Direct Messages API
  async getDirectMessages(userId, otherUserId) {
    return this.request(`/direct-messages?user_id=${userId}&other_user_id=${otherUserId}`);
  }

  async createDirectMessage(dmData) {
    return this.request('/direct-messages', {
      method: 'POST',
      body: JSON.stringify(dmData),
    });
  }

  async updateDirectMessage(dmId, dmData) {
    return this.request(`/direct-messages/${dmId}`, {
      method: 'PUT',
      body: JSON.stringify(dmData),
    });
  }

  async deleteDirectMessage(dmId) {
    return this.request(`/direct-messages/${dmId}`, {
      method: 'DELETE',
    });
  }

  // Subscription system (for real-time updates - simplified)
  subscribe(entity, callback) {
    if (!this.subscriptions.has(entity)) {
      this.subscriptions.set(entity, []);
    }
    this.subscriptions.get(entity).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(entity);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  notify(entity, event) {
    const callbacks = this.subscriptions.get(entity) || [];
    callbacks.forEach(callback => callback(event));
  }

  // Utility method to set current user after auth
  setCurrentUser(user) {
    this.currentUser = user;
  }
}

export const apiClient = new APIClient();

// Export the API client as a singleton
export default apiClient;
