import { useState } from "react";
import { api } from "../api/api";

export default function MessageInput({ channelId, user }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!channelId || !text.trim() || !user) return;

    setSending(true);
    await api.sendMessage(channelId, text.trim(), user._id);
    setText("");
    setSending(false);
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center", paddingTop: "16px" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={channelId ? "Type a message..." : "Select a channel first"}
        disabled={!channelId || !user}
      />
      <button type="button" onClick={handleSend} disabled={!text.trim() || !channelId || sending}>
        {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
