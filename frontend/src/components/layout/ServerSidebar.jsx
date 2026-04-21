import { useState } from "react";
import { Server, MessageSquare, Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/api/apiClient";

export default function ServerSidebar({ servers, selectedServerId, onSelectServer, onSelectDMs, showDMs, onServerCreated }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newServerName, setNewServerName] = useState("");

  const handleCreateServer = async () => {
    if (!newServerName.trim()) return;
    try {
      await apiClient.createServer({ 
        name: newServerName.trim(), 
        description: "",
        ownerId: "u1", // TODO: Use actual current user ID
        channelIds: [],
        users: []
      });
      setNewServerName("");
      setShowCreate(false);
      onServerCreated();
    } catch (error) {
      console.error('Failed to create server:', error);
    }
  };

  return (
    <div className="w-20 flex flex-col items-center bg-sidebar-background border-r border-border py-3 gap-2">
      {/* DM Button */}
      <button
        onClick={onSelectDMs}
        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors
          ${showDMs 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        title="Direct Messages"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Divider */}
      <div className="w-8 h-px bg-border my-1"></div>

      {/* Servers List */}
      <div className="flex flex-col gap-2">
        {servers.map((server) => {
          const serverId = server.id || server._id;
          return (
            <button
              key={serverId}
              onClick={() => onSelectServer(server)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-colors
                ${selectedServerId === serverId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground"}`}
              title={server.name}
            >
              {(server.name || "S").slice(0, 2).toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Create Server Button */}
      <button
        onClick={() => setShowCreate(true)}
        className="w-12 h-12 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-auto"
        title="Create Server"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Server Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create Server</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Server name"
            value={newServerName}
            onChange={(e) => setNewServerName(e.target.value)}
            className="bg-input border-border"
            onKeyDown={(e) => e.key === "Enter" && handleCreateServer()}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateServer} disabled={!newServerName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}