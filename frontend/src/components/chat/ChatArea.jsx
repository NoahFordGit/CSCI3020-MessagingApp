import { useState, useEffect, useRef } from "react";
import { Hash, Send, X, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/apiClient";
import MessageItem from "./MessageItem";

export default function ChatArea({ channel, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, content, author, time
  const [searchContent, setSearchContent] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [authors, setAuthors] = useState([]); // Array of {id, username}
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState("");

  const fetchMessages = async () => {
    if (!channel) return;
    try {
      setFilterError("");
      const channelId = channel.id || channel._id;
      const msgs = await apiClient.getMessages(channelId, 100);
      setMessages(msgs || []);
      
      // Extract unique authors and fetch their usernames
      const authorIds = new Set();
      msgs?.forEach(msg => {
        const authorId = msg.authorId || msg.author_id;
        if (authorId) authorIds.add(authorId);
      });
      
      // Get usernames for each author
      const authorList = [];
      for (const authorId of Array.from(authorIds)) {
        try {
          const userInfo = await apiClient.getUserInfo(authorId);
          authorList.push({
            id: authorId,
            username: userInfo.username || authorId
          });
        } catch (error) {
          authorList.push({
            id: authorId,
            username: authorId
          });
        }
      }
      setAuthors(authorList.sort((a, b) => a.username.localeCompare(b.username)));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setFilterError("Failed to load messages");
    }
  };

  const handleApplyFilter = async () => {
    if (filterType === "all") {
      await fetchMessages();
      setIsFiltering(false);
      return;
    }

    try {
      setFilterLoading(true);
      setFilterError("");
      const channelId = channel.id || channel._id;
      let filteredMessages = [];

      if (filterType === "content" && searchContent.trim()) {
        filteredMessages = await apiClient.searchChannelMessages(searchContent, channelId);
      } else if (filterType === "author" && selectedAuthor) {
        const selectedAuthorObj = authors.find(a => a.id === selectedAuthor);
        const username = selectedAuthorObj?.username || selectedAuthor;
        filteredMessages = await apiClient.searchMessagesByAuthor(username, channelId);
      } else if (filterType === "time") {
        filteredMessages = await apiClient.searchMessagesByTimeRange(channelId, startDate, endDate);
      }

      setMessages(filteredMessages || []);
      setIsFiltering(true);
    } catch (error) {
      console.error('Failed to filter messages:', error);
      setFilterError(`Failed to filter by ${filterType}: ${error.message}`);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleClearFilter = async () => {
    setFilterType("all");
    setSearchContent("");
    setSelectedAuthor("");
    setStartDate("");
    setEndDate("");
    setFilterError("");
    setIsFiltering(false);
    await fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      if (!isFiltering) {
        fetchMessages();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [channel?.id, channel?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !channel || !currentUser) return;
    
    // Extract user ID - must have a valid ID
    const userId = currentUser.id || currentUser._id;
    if (!userId) {
      console.error('Cannot send message: user ID is missing');
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.createMessage({
        content: newMessage.trim(),
        channelId: channel.id || channel._id,
        authorId: userId,
      });
      setNewMessage("");
      // Clear filter to see new message
      if (isFiltering) {
        await handleClearFilter();
      } else {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, content) => {
    try {
      await apiClient.updateMessage(id, { content, edited: true });
      if (isFiltering) {
        await handleApplyFilter();
      } else {
        await fetchMessages();
      }
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.deleteMessage(id);
      if (isFiltering) {
        await handleApplyFilter();
      } else {
        await fetchMessages();
      }
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
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">{channel.name}</span>
          {channel.description && (
            <span className="text-sm text-muted-foreground ml-2 border-l border-border pl-2">{channel.description}</span>
          )}
          {isFiltering && (
            <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">Filtered</span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowFilter(!showFilter)}
          className={isFiltering ? "bg-secondary" : ""}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="px-4 py-3 border-b border-border bg-muted/30 space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType("all")}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  filterType === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("content")}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  filterType === "content"
                    ? "bg-blue-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setFilterType("author")}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  filterType === "author"
                    ? "bg-blue-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Author
              </button>
              <button
                onClick={() => setFilterType("time")}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  filterType === "time"
                    ? "bg-blue-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Date Range
              </button>
            </div>
          </div>

          {filterType === "content" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Content</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter keywords..."
                  value={searchContent}
                  onChange={(e) => setSearchContent(e.target.value)}
                  className="flex-1 h-8 text-xs bg-input border-border"
                  onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
                />
                <Button 
                  size="sm" 
                  onClick={handleApplyFilter}
                  disabled={filterLoading || !searchContent.trim()}
                  className="h-8"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {filterType === "author" && authors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Author</label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full h-8 text-xs bg-input border border-border rounded px-2 py-1"
              >
                <option value="">Choose an author...</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.username}
                  </option>
                ))}
              </select>
              <Button 
                size="sm" 
                onClick={handleApplyFilter}
                disabled={filterLoading || !selectedAuthor}
                className="w-full h-8"
              >
                Apply
              </Button>
            </div>
          )}

          {filterType === "time" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs bg-input border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-8 text-xs bg-input border-border"
                  />
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleApplyFilter}
                disabled={filterLoading || (!startDate && !endDate)}
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

          {isFiltering && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleClearFilter}
              className="w-full h-8"
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-0.5">
        {filterLoading && (
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            <div className="text-sm">Searching messages...</div>
          </div>
        )}
        {!filterLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Hash className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-semibold text-foreground">
              {isFiltering ? "No messages match your filter" : `Welcome to #${channel.name}!`}
            </p>
            <p className="text-sm">{isFiltering ? "Try adjusting your search" : "This is the beginning of the channel."}</p>
          </div>
        )}
        {!filterLoading && messages.map((msg) => (
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