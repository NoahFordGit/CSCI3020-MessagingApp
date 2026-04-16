import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

export default function ChannelPage() {
  const { id } = useParams();
  const { user } = useAuth();

  return (
    <div className="channel-page" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb" }}>
        <Link to="/dashboard">← Back</Link>
        <div style={{ marginTop: "12px" }}>
          <strong>Channel:</strong> {id}
        </div>
        <div style={{ color: "#6b7280", marginTop: "4px" }}>
          {user ? `Logged in as ${user.username}` : "Not logged in"}
        </div>
      </header>

      <main style={{ display: "flex", flexDirection: "column", flex: 1, padding: "24px" }}>
        <MessageList channelId={id} />
        <MessageInput channelId={id} user={user} />
      </main>
    </div>
  );
}
