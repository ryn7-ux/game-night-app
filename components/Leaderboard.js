"use client";
import { useEffect, useState } from "react";
import { listenPlayers, listenLeaderboard } from "../lib/session";

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

const sorted = [...players].sort(
(a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
);

return (
<div className="leaderboard">
{sorted.map((p) => (
<div className="score-chip" key={p.id}>
<div className="name">{p.name}</div>
<div className="score">{scores[p.id] || 0}</div>
</div>
))}
{sorted.length === 0 && (
  <p style={{ color: "var(--muted)" }}>No players yet.</p>
)}
</div>
);
}
