import { useState } from "react";
import { Server, MessageSquare, Plus, MessageCircle, LogOut, ChevronUp, User } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";

export default function ServerSidebar({ servers, selectedServerId, onSelectServer, onSelectDMs, showDMs, onServerCreated, currentUser }) {
  const { logout } = useAuth();
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

  const handleLogout = () => {
    logout(true);
  };

  return (
    <div className="w-20 h-screen flex flex-col items-center bg-sidebar-background border-r border-border py-3 gap-2 overflow-hidden">
      {/* DM Button with tooltip */}
      <div className="relative group w-full flex justify-center">
        <button
          onClick={onSelectDMs}
          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 relative
            ${showDMs 
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
          title="Direct Messages"
        >
          {showDMs ? (
            <MessageCircle className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </button>
        <div className="absolute left-16 bg-popover text-popover-foreground px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Direct Messages
        </div>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-border my-1"></div>

      {/* Servers List */}
      <div className="flex flex-col gap-2">
        {servers.map((server) => {
          const serverId = server.id || server._id;
          return (
            <div key={serverId} className="relative group">
              <button
                onClick={() => onSelectServer(server)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200
                  ${selectedServerId === serverId
                    ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-primary/80 hover:text-primary-foreground"}`}
                title={server.name}
              >
                {(server.name || "S").slice(0, 2).toUpperCase()}
              </button>
              <div className="absolute left-16 bg-popover text-popover-foreground px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {server.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Server Button */}
      <div className="relative group">
        <button
          onClick={() => setShowCreate(true)}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          title="Create Server"
        >
          <Plus className="w-6 h-6" />
        </button>
        <div className="absolute left-16 bg-popover text-popover-foreground px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Create Server
        </div>
      </div>

      {/* User Menu Button - Bottom */}
      <div className="relative group mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-12 h-12 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
              title="User Menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {(currentUser?.username || currentUser?.email || "U").slice(0, 2).toUpperCase()}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 ml-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              <User className="w-4 h-4 mr-2" />
              <span className="truncate">{currentUser?.email || "No email"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="absolute left-16 bg-popover text-popover-foreground px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          User Menu
        </div>
      </div>

      {/* Create Server Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Create a New Server</DialogTitle>
            <DialogDescription>
              Give your server a name. You can always change it later.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Server name (e.g., My Team)"
            value={newServerName}
            onChange={(e) => setNewServerName(e.target.value)}
            className="bg-input border-border text-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleCreateServer()}
            autoFocus
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