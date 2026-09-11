"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  joinAsPlayer,
  getPlayerId,
  playerExists,
  getOrCreateGameCode,
  getStoredGameCode,
  setStoredGameCode,
} from "../../lib/session";
import { AVATARS } from "../../lib/avatars";
import Avatar from "../../components/Avatar";

export default function JoinPage() {
      const [name, setName] = useState("");
      const [avatarId, setAvatarId] = useState(null);
      const [loading, setLoading] = useState(false);
      const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const id = getPlayerId();
      if (!id) {
        setChecking(false);
        return;
      }
      const currentCode = await getOrCreateGameCode();
      const storedCode = getStoredGameCode();
      if (storedCode && storedCode !== currentCode) {
        setChecking(false);
        return;
      }
      const alreadyIn = await playerExists(id);
      if (alreadyIn) {
        setStoredGameCode(currentCode);
        router.push("/play");
        return;
      }
      setChecking(false);
    })();
  }, []);

  async function handleJoin(e) {
          e.preventDefault();
          if (!name.trim() || !avatarId) return;
          setLoading(true);
          await joinAsPlayer(name.trim(), avatarId);
          router.push("/play");
  }

  if (checking) {
    return (
      <div className="center-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
          <div className="center-screen">
            <div className="logo-badge">👋</div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Pick your avatar</h1>
      <p className="subtitle">This is what everyone will see on the leaderboard.</p>

      <div className="avatar-grid">
{AVATARS.map((a) => (
              <button
                         type="button"
            key={a.id}
            className={`avatar-option ${avatarId === a.id ? "selected" : ""}`}
            onClick={() => setAvatarId(a.id)}
          >
            <Avatar avatarId={a.id} size="lg" />
              </button>
        ))}
            </div>

      <form onSubmit={handleJoin} className="form-row" style={{ marginTop: 8 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
        />
                      <button className="btn-primary" disabled={loading || !avatarId} type="submit">
          {loading ? "Joining..." : "Join"}
</button>
    </form>
    </div>
  );
}
