import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChannelList from "../components/ChannelList";

export default function Dashboard() {
  const [serverId, setServerId] = useState(null);
  const navigate = useNavigate();

  const handleSelectChannel = (id) => {
    navigate(`/channel/${id}`);
  };

  return (
    <div className="dashboard-page" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar onSelectServer={setServerId} />
      <ChannelList serverId={serverId} onSelectChannel={handleSelectChannel} />
      <section style={{ flex: 1, padding: "24px" }}>
        <h2>Pick a channel</h2>
        <p>Choose a server and channel to join the conversation.</p>
      </section>
    </div>
  );
}
