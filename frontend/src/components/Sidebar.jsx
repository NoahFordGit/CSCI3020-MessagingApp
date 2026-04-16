import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Sidebar({ onSelectServer }) {
  const [servers, setServers] = useState([]);

  useEffect(() => {
    api.getServers().then((data) => {
      if (Array.isArray(data)) setServers(data);
    });
  }, []);

  return (
    <aside style={{ width: "220px", borderRight: "1px solid #e5e7eb", padding: "24px" }}>
      <h2>Servers</h2>
      {servers.length === 0 ? (
        <p>Loading servers…</p>
      ) : (
        servers.map((server) => (
          <button
            key={server._id}
            type="button"
            style={{ display: "block", width: "100%", margin: "10px 0" }}
            onClick={() => onSelectServer(server._id)}
          >
            {server.name}
          </button>
        ))
      )}
    </aside>
  );
}
