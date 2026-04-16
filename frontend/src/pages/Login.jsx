import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    const trimmed = username.trim();
    if (!trimmed) return;

    setUser({ _id: `user-${Date.now()}`, username: trimmed });
    navigate("/dashboard");
  };

  return (
    <main className="login-page" style={{ padding: "48px", maxWidth: "420px", margin: "0 auto" }}>
      <h1>Welcome back</h1>
      <p>Enter your display name to start.</p>
      <label style={{ display: "block", marginTop: "24px", gap: "8px" }}>
        <span>Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your display name"
        />
      </label>
      <button type="button" onClick={handleLogin} style={{ marginTop: "16px" }}>
        Continue
      </button>
    </main>
  );
}
