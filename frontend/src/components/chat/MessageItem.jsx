import { useState, useEffect } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { apiClient } from "@/api/apiClient";

export default function MessageItem({ message, currentUser, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [authorName, setAuthorName] = useState(null);

  // Get message ID (handle both _id and id)
  const messageId = message.id || message._id;
  
  // Get author ID (handle both authorId and author_id)
  const authorId = message.authorId || message.author_id;
  const currentUserId = currentUser?.id || currentUser?._id;
  
  const isOwn = authorId === currentUserId;

  // Fetch author name if not already in message
  useEffect(() => {
    if (message.authorName) {
      setAuthorName(message.authorName);
    } else if (message.created_by) {
      setAuthorName(message.created_by);
    } else if (authorId && authorId !== currentUserId) {
      // Fetch user info from API
      apiClient.getUserInfo(authorId).then(user => {
        setAuthorName(user?.username || 'Unknown');
      }).catch(() => {
        setAuthorName('Unknown');
      });
    } else if (currentUser?.username) {
      setAuthorName(currentUser.username);
    }
  }, [message, authorId, currentUserId, currentUser]);

  const handleSave = () => {
    if (!editContent.trim()) return;
    onEdit(messageId, editContent.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setEditing(false);
  };

  // Get timestamp (handle both timestamp and created_date)
  const timestamp = message.timestamp || message.created_date
    ? format(new Date(message.timestamp || message.created_date), "MMM d, h:mm a")
    : "";

  return (
    <div className="group flex gap-3 px-4 py-1.5 hover:bg-[hsl(var(--message-hover))] rounded-md transition-colors">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
        {(authorName || "U").slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {authorName || "Unknown"}
          </span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {message.edited && <span className="text-xs text-muted-foreground italic">(edited)</span>}
        </div>

        {editing ? (
          <div className="flex gap-2 mt-1">
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
              className="bg-input border-border text-sm h-8"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 text-green-400">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0 text-muted-foreground">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-foreground/90 mt-0.5 break-words">{message.content}</p>
        )}
      </div>

      {/* Actions */}
      {isOwn && !editing && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0 transition-opacity">
          <button
            onClick={() => { setEditing(true); setEditContent(message.content); }}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(messageId)}
            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}