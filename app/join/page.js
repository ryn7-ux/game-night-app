"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinAsPlayer } from "../../lib/session";

export default function JoinPage() {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

  async function handleJoin(e) {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        await joinAsPlayer(name.trim());
        router.push("/play");
  }

  return (
        <div className="center-screen">
          <div className="logo-badge">👋</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>What's your name?</h1>
        <p className="subtitle">This is what everyone will see on the leaderboard.</p>
      <form onSubmit={handleJoin} className="form-row" style={{ marginTop: 8 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
        />
                    <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Joining..." : "Join"}
</button>
  </form>
  </div>
  );
}
