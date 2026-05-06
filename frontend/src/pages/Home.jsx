import { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import ServerSidebar from "@/components/layout/ServerSidebar";
import ChannelSidebar from "@/components/layout/ChannelSidebar";
import ChatArea from "@/components/chat/ChatArea";
import DMArea from "@/components/chat/DMArea";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [servers, setServers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showDMs, setShowDMs] = useState(false);

  useEffect(() => {
    loadUser();
    loadServers();
    
    // Poll for servers every 2 seconds (real-time updates)
    const serverInterval = setInterval(loadServers, 2000);
    
    return () => clearInterval(serverInterval);
  }, [authUser]);

  const loadUser = async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const loadServers = async () => {
    try {
      const data = await apiClient.getServers();
      setServers(data || []);
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  };

  const loadChannels = async (server) => {
    if (!server) return;
    try {
      const data = await apiClient.getChannels(server.id || server._id);
      setChannels(data || []);
      setSelectedChannel(null);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  // Load channels when a server is selected (no polling to avoid interrupting typing)
  useEffect(() => {
    if (!selectedServer) return;
    
    loadChannels(selectedServer);
  }, [selectedServer?.id, selectedServer?._id]);

  const handleSelectServer = (server) => {
    setSelectedServer(server);
    setShowDMs(false);
    loadChannels(server);
  };

  const handleSelectDMs = () => {
    setShowDMs(true);
    setSelectedServer(null);
    setSelectedChannel(null);
    setChannels([]);
  };

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Server list */}
      <ServerSidebar
        servers={servers}
        selectedServerId={selectedServer?.id || selectedServer?._id}
        onSelectServer={handleSelectServer}
        onSelectDMs={handleSelectDMs}
        showDMs={showDMs}
        onServerCreated={loadServers}
        currentUser={currentUser}
      />

      {/* Channel sidebar — only when server is selected */}
      {selectedServer && !showDMs && (
        <ChannelSidebar
          server={selectedServer}
          channels={channels}
          selectedChannelId={selectedChannel?.id || selectedChannel?._id}
          onSelectChannel={handleChannelSelect}
          onChannelsChanged={() => loadChannels(selectedServer)}
          currentUser={currentUser}
        />
      )}

      {/* DM sidebar user info — only on DMs view */}
      {showDMs && !selectedServer && (
        <DMArea currentUser={currentUser} />
      )}

      {/* Chat area */}
      {!showDMs && (
        <ChatArea channel={selectedChannel} currentUser={currentUser} />
      )}
    </div>
  );
}