import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Users } from "lucide-react";
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
  const bottomRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [currentUser?.id, currentUser?._id]);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const users = await apiClient.getUsers();
      const currentUserId = currentUser.id || currentUser._id;
      setAllUsers(users.filter((u) => (u.id || u._id) !== currentUserId));
      setConversations(users.filter((u) => (u.id || u._id) !== currentUserId));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const fetchMessages = async (userId) => {
    if (!userId || !currentUser) return;
    try {
      const currentUserId = currentUser.id || currentUser._id;
      const msgs = await apiClient.getDirectMessages(currentUserId, userId);
      setMessages(msgs || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id || selectedUser._id);
  }, [selectedUser?.id, selectedUser?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || !currentUser) return;
    try {
      await apiClient.createDirectMessage({
        content: newMessage.trim(),
        authorId: currentUser.id || currentUser._id,
        recipientId: selectedUser.id || selectedUser._id,
      });
      setNewMessage("");
      await fetchMessages(selectedUser.id || selectedUser._id);
      if (!conversations.find((u) => (u.id || u._id) === (selectedUser.id || selectedUser._id))) {
        setConversations((prev) => [...prev, selectedUser]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEdit = async (id, content) => {
    try {
      await apiClient.updateDirectMessage(id, { content, edited: true });
      await fetchMessages(selectedUser.id || selectedUser._id);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.deleteDirectMessage(id);
      await fetchMessages(selectedUser.id || selectedUser._id);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const filteredUsers = allUsers.filter((u) =>
    (u.username || u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex" style={{ background: "hsl(var(--chat-bg))" }}>
      {/* DM sidebar */}
      <div className="w-60 flex flex-col border-r border-border" style={{ background: "hsl(var(--sidebar-channels))" }}>
        <div className="px-3 py-4 border-b border-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Direct Messages</p>
          <Input
            placeholder="Find or start a DM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-xs bg-input border-border"
          />
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {conversations.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-1">Conversations</p>
              {conversations.map((u) => {
                const userId = u.id || u._id;
                const selectedId = selectedUser?.id || selectedUser?._id;
                return (
                  <button
                    key={userId}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors
                      ${selectedId === userId ? "bg-secondary" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                      {(u.username || u.email || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm truncate">{u.username || u.email}</span>
                  </button>
                );
              })}
            </div>
          )}

          {searchQuery && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 py-1">Users</p>
              {filteredUsers.map((u) => {
                const userId = u.id || u._id;
                const selectedId = selectedUser?.id || selectedUser?._id;
                return (
                  <button
                    key={userId}
                    onClick={() => { setSelectedUser(u); setSearchQuery(""); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors
                      ${selectedId === userId ? "bg-secondary" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/70 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(u.username || u.email || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm truncate">{u.username || u.email}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold">
              {(selectedUser.username || selectedUser.email || "U").slice(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-sm">{selectedUser.username || selectedUser.email}</span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-0.5">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-semibold text-foreground">Start a conversation!</p>
                <p className="text-sm">Send a message to {selectedUser.username || selectedUser.email}.</p>
              </div>
            )}
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
          </div>

          <div className="px-4 py-4">
            <div className="flex items-center gap-2 bg-input rounded-lg px-3 py-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Message ${selectedUser.username || selectedUser.email}`}
                className="border-0 bg-transparent focus-visible:ring-0 p-0 text-sm"
              />
              <Button size="sm" onClick={handleSend} disabled={!newMessage.trim()} className="h-7 w-7 p-0 rounded">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">Your Direct Messages</p>
            <p className="text-sm">Search for a user above to start chatting.</p>
          </div>
        </div>
      )}
    </div>
  );
}