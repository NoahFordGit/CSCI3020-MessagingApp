const BASE_URL = "http://localhost:8000";

export const api = {
  getServers: async () => {
    const res = await fetch(`${BASE_URL}/servers`);
    return res.json();
  },

  getChannels: async (serverId) => {
    const res = await fetch(`${BASE_URL}/servers/${serverId}/channels`);
    return res.json();
  },

  getMessages: async (channelId) => {
    const res = await fetch(`${BASE_URL}/channels/${channelId}/messages`);
    return res.json();
  },

  sendMessage: async (channelId, content, authorId) => {
    return fetch(`${BASE_URL}/channels/${channelId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, authorId }),
    });
  },
};
