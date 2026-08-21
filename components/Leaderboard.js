"use client";
import { useEffect, useState } from "react";
import { listenPlayers, listenLeaderboard } from "../lib/session";
import Avatar from "./Avatar";

const LB_GAMES = [
  { id: "trivia", icon: "🧠" },
  { id: "spelling-bee", icon: "🐝" },
  { id: "know-your-host", icon: "🎙️" },
  { id: "know-your-partner", icon: "💞" },
  { id: "guess-the-real-place", icon: "🗺️" },
  { id: "guess-the-photo", icon: "📸" },
  { id: "who-sent-this", icon: "🕵️" },
];

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});

  useEffect(() => {
    const unsubP = listenPlayers(setPlayers);
    const unsubL = listenLeaderboard(setScores);
    return () => {
      unsubP();
      unsubL();
    };
  }, []);

  const rows = players
    .map((p) => {
      const raw = scores[p.id];
      const perGame = raw && typeof raw === "object" ? raw : {};
      const total = LB_GAMES.reduce((sum, g) => sum + (perGame[g.id] || 0), 0);
      return { ...p, perGame, total };
    })
    .sort((a, b) => b.total - a.total);

  if (rows.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No players yet.</p>;
  }

  const rankBg = (i) =>
    i === 0
      ? "linear-gradient(135deg, #f6d365, #d4a017)"
      : i === 1
      ? "linear-gradient(135deg, #e5e7eb, #9ca3af)"
      : i === 2
      ? "linear-gradient(135deg, #f0b27a, #b5651d)"
      : "transparent";

  const rankFg = (i) => (i <= 2 ? "#161200" : "var(--text)");

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "6px 10px",
                color: "var(--muted)",
                fontSize: 11,
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              PLAYER
            </th>
            {LB_GAMES.map((g) => (
              <th key={g.id} style={{ padding: "6px 8px", fontSize: 16 }}>
                {g.icon}
              </th>
            ))}
            <th
              style={{
                padding: "6px 10px",
                color: "var(--muted)",
                fontSize: 11,
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} style={{ background: rankBg(i), color: rankFg(i) }}>
              <td style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar avatarId={r.avatarId} size="sm" />
                  {r.name}
                </div>
              </td>
              {LB_GAMES.map((g) => (
                <td key={g.id} style={{ textAlign: "center", padding: "8px 4px" }}>
                  {r.perGame[g.id] || 0}
                </td>
              ))}
              <td style={{ textAlign: "center", padding: "8px 10px", fontWeight: 800 }}>
                {r.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
