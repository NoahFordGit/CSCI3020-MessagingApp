import { useState } from "react";
import { Hash, Plus, Settings, Trash2, ChevronDown } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/apiClient";

export default function ChannelSidebar({ server, channels, selectedChannelId, onSelectChannel, onChannelsChanged, currentUser }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [deleteChannel, setDeleteChannel] = useState(null);
  const [showEditServer, setShowEditServer] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      await apiClient.createChannel({ 
        name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"), 
        serverId: server.id || server._id 
      });
      setNewChannelName("");
      setShowCreate(false);
      onChannelsChanged();
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const handleDeleteChannel = async () => {
    try {
      await apiClient.deleteChannel(deleteChannel.id || deleteChannel._id);
      setDeleteChannel(null);
      onChannelsChanged();
    } catch (error) {
      console.error('Failed to delete channel:', error);
    }
  };

  const handleEditServer = async () => {
    try {
      await apiClient.updateServer(server.id || server._id, { name: editName, description: editDesc });
      setShowEditServer(false);
      onChannelsChanged();
    } catch (error) {
      console.error('Failed to edit server:', error);
    }
  };

  const openEditServer = () => {
    setEditName(server.name);
    setEditDesc(server.description || "");
    setShowEditServer(true);
  };

  if (!server) return null;

  return (
    <div className="w-60 flex flex-col" style={{ background: "hsl(var(--sidebar-channels))" }}>
      {/* Server header */}
      <button
        onClick={openEditServer}
        className="flex items-center justify-between px-4 py-4 border-b border-border hover:bg-muted/50 transition-colors group"
      >
        <span className="font-semibold text-sm truncate">{server.name}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-2">
        <div className="flex items-center justify-between px-4 py-1 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Text Channels
          </span>
          <button
            onClick={() => setShowCreate(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {channels.map((ch) => {
          const chId = ch.id || ch._id;
          return (
            <div
              key={chId}
              className={`group flex items-center justify-between mx-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors
                ${selectedChannelId === chId
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
              onClick={() => onSelectChannel(ch)}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Hash className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{ch.name}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteChannel(ch); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {channels.length === 0 && (
          <p className="text-xs text-muted-foreground px-4 py-2">No channels yet. Create one!</p>
        )}
      </div>

      {/* User info at bottom */}
      {currentUser && (
        <div className="px-2 py-3 border-t border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
            {(currentUser.username || currentUser.email || "U")?.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{currentUser.username || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
          </div>
        </div>
      )}

      {/* Create Channel Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="new-channel"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            className="bg-input border-border"
            onKeyDown={(e) => e.key === "Enter" && handleCreateChannel()}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Server Dialog */}
      <Dialog open={showEditServer} onOpenChange={setShowEditServer}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Server</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Server name" className="bg-input border-border" />
            <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" className="bg-input border-border" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditServer(false)}>Cancel</Button>
            <Button onClick={handleEditServer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Channel Alert */}
      <AlertDialog open={!!deleteChannel} onOpenChange={() => setDeleteChannel(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete #{deleteChannel?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the channel and all its messages.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChannel} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}