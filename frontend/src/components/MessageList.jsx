import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function MessageList({ channelId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      return;
    }

    api.getMessages(channelId).then((data) => {
      if (Array.isArray(data)) setMessages(data);
    });
  }, [channelId]);

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingRight: "12px" }}>
      {channelId == null ? (
        <p>Select a channel to view messages.</p>
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        messages.map((message) => (
          <div key={message._id} style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              <strong>{message.authorId}</strong>
            </div>
            <div>{message.content}</div>
          </div>
        ))
      )}
    </div>
  );
}
