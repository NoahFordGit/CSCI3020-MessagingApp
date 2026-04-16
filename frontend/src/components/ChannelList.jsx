import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function ChannelList({ serverId, onSelectChannel }) {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (!serverId) {
      setChannels([]);
      return;
    }

    api.getChannels(serverId).then((data) => {
      if (Array.isArray(data)) setChannels(data);
    });
  }, [serverId]);

  return (
    <section style={{ width: "240px", borderRight: "1px solid #e5e7eb", padding: "24px" }}>
      <h2>Channels</h2>
      {serverId == null ? (
        <p>Select a server first.</p>
      ) : channels.length === 0 ? (
        <p>Loading channels…</p>
      ) : (
        channels.map((channel) => (
          <button
            key={channel._id}
            type="button"
            style={{ display: "block", width: "100%", margin: "10px 0" }}
            onClick={() => onSelectChannel(channel._id)}
          >
            # {channel.name}
          </button>
        ))
      )}
    </section>
  );
}
