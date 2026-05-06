import { useState, useEffect, useRef } from "react";
import { Hash, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/apiClient";
import MessageItem from "./MessageItem";

export default function ChatArea({ channel, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    if (!channel) return;
    try {
      const channelId = channel.id || channel._id;
      const msgs = await apiClient.getMessages(channelId, 100);
      setMessages(msgs || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000); // Poll every 1 second for real-time updates
    return () => clearInterval(interval);
  }, [channel?.id, channel?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !channel || !currentUser) return;
    setLoading(true);
    try {
      await apiClient.createMessage({
        content: newMessage.trim(),
        channelId: channel.id || channel._id,
        authorId: currentUser.id || currentUser._id || "unknown",
      });
      setNewMessage("");
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, content) => {
    try {
      await apiClient.updateMessage(id, { content, edited: true });
      await fetchMessages();
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.deleteMessage(id);
      await fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "hsl(var(--chat-bg))" }}>
        <div className="text-center text-muted-foreground">
          <Hash className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Select a channel to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ background: "hsl(var(--chat-bg))" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Hash className="w-5 h-5 text-muted-foreground" />
        <span className="font-semibold">{channel.name}</span>
        {channel.description && (
          <span className="text-sm text-muted-foreground ml-2 border-l border-border pl-2">{channel.description}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-0.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Hash className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-semibold text-foreground">Welcome to #{channel.name}!</p>
            <p className="text-sm">This is the beginning of the channel.</p>
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

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <Input
          placeholder={`Message #${channel.name}`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="flex-1 bg-input border-border"
        />
        <Button onClick={handleSend} disabled={loading || !newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}