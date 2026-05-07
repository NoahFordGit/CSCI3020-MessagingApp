import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Users, X, MoreVertical, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/apiClient";
import MessageItem from "./MessageItem";

export default function DMArea({ currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastMessages, setLastMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const [showDMFilter, setShowDMFilter] = useState(false);
  const [dmFilterType, setDmFilterType] = useState("all");
  const [dmSearchContent, setDmSearchContent] = useState("");
  const [dmSearchAuthor, setDmSearchAuthor] = useState("");
  const [dmStartDate, setDmStartDate] = useState("");
  const [dmEndDate, setDmEndDate] = useState("");
  const [isFilteringDM, setIsFilteringDM] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    loadData();
    // Poll for conversations every 2 seconds (real-time updates)
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?._id]);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const users = await apiClient.getUsers();
      const currentUserId = currentUser.id || currentUser._id;
      const filteredUsers = users.filter((u) => (u.id || u._id) !== currentUserId);
      setAllUsers(filteredUsers);
      setConversations(filteredUsers);

      // Load last message for each user
      const lastMsgs = {};
      for (const user of filteredUsers) {
        const userId = user.id || user._id;
        try {
          const msgs = await apiClient.getDirectMessages(currentUserId, userId);
          if (msgs && msgs.length > 0) {
            lastMsgs[userId] = msgs[msgs.length - 1];
          }
        } catch (error) {
          console.warn(`Failed to load last message with ${userId}:`, error);
        }
      }
      setLastMessages(lastMsgs);
      
      // Simulate online users (in a real app, this would come from server)
      const onlineSet = new Set(
        filteredUsers.slice(0, Math.ceil(filteredUsers.length / 2)).map((u) => u.id || u._id)
      );
      setOnlineUsers(onlineSet);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    if (!userId || !currentUser) return;
    try {
      setFilterError("");
      const currentUserId = currentUser.id || currentUser._id;
      const msgs = await apiClient.getDirectMessages(currentUserId, userId);
      setMessages(msgs || []);
      // Update last message
      if (msgs && msgs.length > 0) {
        setLastMessages((prev) => ({
          ...prev,
          [userId]: msgs[msgs.length - 1],
        }));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setFilterError("Failed to load messages");
    }
  };

  const handleApplyDMFilter = async () => {
    if (dmFilterType === "all") {
      await fetchMessages(selectedUser.id || selectedUser._id);
      setIsFilteringDM(false);
      return;
    }

    try {
      setFilterLoading(true);
      setFilterError("");
      const selectedUserId = selectedUser.id || selectedUser._id;
      const currentUserId = currentUser.id || currentUser._id;
      let filteredMessages = [];

      if (dmFilterType === "content" && dmSearchContent.trim()) {
        const allResults = await apiClient.searchDirectMessages(dmSearchContent);
        // Filter to only messages with selected user
        filteredMessages = allResults.filter(msg => 
          (msg.author_id === selectedUserId || msg.recipientId === selectedUserId || msg.author_id === selectedUser._id || msg.recipient_id === selectedUser._id) &&
          (msg.author_id === currentUserId || msg.recipientId === currentUserId || msg.author_id === currentUser._id || msg.recipient_id === currentUser._id)
        );
      } else if (dmFilterType === "author" && dmSearchAuthor.trim()) {
        const allResults = await apiClient.searchDirectMessagesByAuthor(dmSearchAuthor);
        // Filter to only messages with selected user
        filteredMessages = allResults.filter(msg => 
          (msg.author_id === selectedUserId || msg.recipientId === selectedUserId || msg.author_id === selectedUser._id || msg.recipient_id === selectedUser._id) &&
          (msg.author_id === currentUserId || msg.recipientId === currentUserId || msg.author_id === currentUser._id || msg.recipient_id === currentUser._id)
        );
      } else if (dmFilterType === "time") {
        if (!dmStartDate && !dmEndDate) {
          setFilterError("Please select a date range");
          setFilterLoading(false);
          return;
        }
        filteredMessages = await apiClient.searchDirectMessagesByTimeRange(dmStartDate, dmEndDate);
        // Filter to only messages with selected user
        filteredMessages = filteredMessages.filter(msg => 
          (msg.author_id === selectedUserId || msg.recipientId === selectedUserId || msg.author_id === selectedUser._id || msg.recipient_id === selectedUser._id) &&
          (msg.author_id === currentUserId || msg.recipientId === currentUserId || msg.author_id === currentUser._id || msg.recipient_id === currentUser._id)
        );
      }

      setMessages(filteredMessages || []);
      setIsFilteringDM(true);
    } catch (error) {
      console.error('Failed to filter messages:', error);
      setFilterError(`Failed to filter by ${dmFilterType}: ${error.message}`);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleClearDMFilter = async () => {
    setDmFilterType("all");
    setDmSearchContent("");
    setDmSearchAuthor("");
    setDmStartDate("");
    setDmEndDate("");
    setFilterError("");
    setIsFilteringDM(false);
    if (selectedUser) {
      await fetchMessages(selectedUser.id || selectedUser._id);
    }
  };

  // Poll for direct messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;
    const userId = selectedUser.id || selectedUser._id;
    fetchMessages(userId);
    const interval = setInterval(() => {
      if (!isFilteringDM) {
        fetchMessages(userId);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedUser?.id, selectedUser?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;
    
    // Extract user IDs - must have valid IDs
    const authorId = currentUser.id || currentUser._id;
    const recipientId = selectedUser.id || selectedUser._id;
    if (!authorId || !recipientId) {
      console.error('Cannot send message: missing user IDs', { authorId, recipientId });
      return;
    }
    
    try {
      const sentMessage = await apiClient.createDirectMessage({
        content: newMessage.trim(),
        authorId,
        recipientId,
      });
      setNewMessage("");
      if (isFilteringDM) {
        await handleClearDMFilter();
      } else {
        await fetchMessages(selectedUser.id || selectedUser._id);
      }
      if (!conversations.find((u) => (u.id || u._id) === (selectedUser.id || selectedUser._id))) {
        setConversations((prev) => [selectedUser, ...prev]);
      } else {
        // Move to top
        setConversations((prev) => [
          selectedUser,
          ...prev.filter((u) => (u.id || u._id) !== (selectedUser.id || selectedUser._id)),
        ]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEdit = async (id, content) => {
    try {
      await apiClient.updateDirectMessage(id, { content, edited: true });
      if (isFilteringDM) {
        await handleApplyDMFilter();
      } else {
        await fetchMessages(selectedUser.id || selectedUser._id);
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.deleteDirectMessage(id);
      if (isFilteringDM) {
        await handleApplyDMFilter();
      } else {
        await fetchMessages(selectedUser.id || selectedUser._id);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const filteredUsers = allUsers.filter((u) =>
    (u.username || u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessagePreview = (userId) => {
    const lastMsg = lastMessages[userId];
    if (!lastMsg) return "No messages yet";
    return lastMsg.content.substring(0, 50) + (lastMsg.content.length > 50 ? "..." : "");
  };

  const ConversationItem = ({ user, isSelected, onlineStatus }) => {
    const userId = user.id || user._id;
    const isOnline = onlineUsers.has(userId);
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedUser(user);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors relative group outline-none ${
          isSelected ? "bg-secondary" : ""
        }`}
        tabIndex={-1}
      >
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {(user.username || user.email || "U").slice(0, 2).toUpperCase()}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">{user.username || user.email}</span>
            {isOnline && <span className="text-xs text-green-500 font-semibold">online</span>}
          </div>
          <p className="text-xs text-muted-foreground truncate">{getLastMessagePreview(userId)}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="flex-1 flex" style={{ background: "hsl(var(--chat-bg))" }}>
      {/* DM sidebar */}
      <div className="w-64 flex flex-col border-r border-border" style={{ background: "hsl(var(--sidebar-channels))" }}>
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Direct Messages
          </h2>
          <Input
            placeholder="Find or start a DM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs bg-input border-border"
          />
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground">
              <div className="animate-spin">...</div>
            </div>
          ) : searchQuery ? (
            <div>
              {filteredUsers.length > 0 ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2">Search Results</p>
                  {filteredUsers.map((u) => (
                    <ConversationItem
                      key={u.id || u._id}
                      user={u}
                      isSelected={(selectedUser?.id || selectedUser?._id) === (u.id || u._id)}
                    />
                  ))}
                </>
              ) : (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  <p className="text-xs">No users found</p>
                </div>
              )}
            </div>
          ) : conversations.length > 0 ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-2">Conversations</p>
              {conversations.map((u) => (
                <ConversationItem
                  key={u.id || u._id}
                  user={u}
                  isSelected={(selectedUser?.id || selectedUser?._id) === (u.id || u._id)}
                />
              ))}
            </>
          ) : (
            <div className="px-4 py-6 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-medium">No conversations yet</p>
              <p className="text-xs opacity-70 mt-1">Search for users to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {(selectedUser.username || selectedUser.email || "U").slice(0, 2).toUpperCase()}
                </div>
                {onlineUsers.has(selectedUser.id || selectedUser._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{selectedUser.username || selectedUser.email}</h3>
                  {isFilteringDM && (
                    <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded">Filtered</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {onlineUsers.has(selectedUser.id || selectedUser._id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDMFilter(!showDMFilter)}
                className={isFilteringDM ? "bg-secondary" : ""}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Panel for DMs */}
          {showDMFilter && (
            <div className="px-4 py-3 border-b border-border bg-muted/30 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setDmFilterType("all")}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      dmFilterType === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDmFilterType("content")}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      dmFilterType === "content"
                        ? "bg-blue-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    Content
                  </button>
                  <button
                    onClick={() => setDmFilterType("author")}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      dmFilterType === "author"
                        ? "bg-blue-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    Author
                  </button>
                  <button
                    onClick={() => setDmFilterType("time")}
                    className={`text-xs px-3 py-1 rounded transition-colors ${
                      dmFilterType === "time"
                        ? "bg-blue-500 text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    Date Range
                  </button>
                </div>
              </div>

              {dmFilterType === "content" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Content</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter keywords..."
                      value={dmSearchContent}
                      onChange={(e) => setDmSearchContent(e.target.value)}
                      className="flex-1 h-8 text-xs bg-input border-border"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDMFilter()}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleApplyDMFilter}
                      disabled={filterLoading || !dmSearchContent.trim()}
                      className="h-8"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {dmFilterType === "author" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search by Author Username</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter username..."
                      value={dmSearchAuthor}
                      onChange={(e) => setDmSearchAuthor(e.target.value)}
                      className="flex-1 h-8 text-xs bg-input border-border"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyDMFilter()}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleApplyDMFilter}
                      disabled={filterLoading || !dmSearchAuthor.trim()}
                      className="h-8"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {dmFilterType === "time" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">From</label>
                      <Input
                        type="date"
                        value={dmStartDate}
                        onChange={(e) => setDmStartDate(e.target.value)}
                        className="h-8 text-xs bg-input border-border"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">To</label>
                      <Input
                        type="date"
                        value={dmEndDate}
                        onChange={(e) => setDmEndDate(e.target.value)}
                        className="h-8 text-xs bg-input border-border"
                      />
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleApplyDMFilter}
                    disabled={filterLoading || (!dmStartDate && !dmEndDate)}
                    className="w-full h-8"
                  >
                    Search
                  </Button>
                </div>
              )}

              {filterError && (
                <div className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded">
                  {filterError}
                </div>
              )}

              {isFilteringDM && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleClearDMFilter}
                  className="w-full h-8"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 px-2">
            {filterLoading && (
              <div className="flex items-center justify-center h-20 text-muted-foreground">
                <div className="text-sm">Searching messages...</div>
              </div>
            )}
            {!filterLoading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-semibold text-foreground">
                  {isFilteringDM ? "No messages match your filter" : "No messages yet"}
                </p>
                <p className="text-sm">
                  {isFilteringDM ? "Try adjusting your search" : `Start a conversation with ${selectedUser.username || selectedUser.email}`}
                </p>
              </div>
            ) : !filterLoading && (
              <>
                {messages.map((msg) => (
                  <MessageItem
                    key={msg.id || msg._id}
                    message={msg}
                    currentUser={currentUser}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Message input */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center gap-2 bg-input rounded-lg px-3 py-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Message ${selectedUser.username || selectedUser.email}`}
                className="border-0 bg-transparent focus-visible:ring-0 p-0 text-sm"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="h-8 w-8 p-0 rounded flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">Your Direct Messages</p>
            <p className="text-sm">Search for a user or select a conversation to start chatting.</p>
          </div>
        </div>
      )}
    </div>
  );
}