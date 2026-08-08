"use client";
import { useEffect, useState } from "react";
import {
listenPlayers,
listenRound1,
setRound1Question,
setAnswersOpen,
revealRound1,
awardRound1Points,
addLeaderboardPoints,
clearRound1Answers,
} from "../../lib/session";
import Leaderboard from "../../components/Leaderboard";

const HOST_PIN = process.env.NEXT_PUBLIC_HOST_PIN || "changeme";

export default function HostPage() {
const [unlocked, setUnlocked] = useState(false);
const [pinInput, setPinInput] = useState("");

useEffect(() => {
if (sessionStorage.getItem("gamenight_host_unlocked") === "true") {
setUnlocked(true);
}
}, []);

function tryUnlock(e) {
e.preventDefault();
if (pinInput === HOST_PIN) {
sessionStorage.setItem("gamenight_host_unlocked", "true");
setUnlocked(true);
} else {
alert("Wrong PIN");
}
}

if (!unlocked) {
return (
<div className="center-screen">
<h1>Host Access</h1>
<form onSubmit={tryUnlock} style={{ display: "flex", gap: 8 }}>
<input
type="password"
value={pinInput}
onChange={(e) => setPinInput(e.target.value)}
placeholder="Host PIN"
autoFocus
/>
<button className="btn-primary" type="submit">Unlock</button>
</form>
</div>
);
}

return <HostControls />;
}


function HostControls() {
const [players, setPlayers] = useState([]);
const [round1, setRound1] = useState(null);

const [questionText, setQuestionText] = useState("");
const [questionType, setQuestionType] = useState("truefalse");
const [correctAnswer, setCorrectAnswer] = useState("");
const [pointInputs, setPointInputs] = useState({});
const [leaderboardInputs, setLeaderboardInputs] = useState({});

useEffect(() => {
const unsubP = listenPlayers(setPlayers);
const unsubR = listenRound1(setRound1);
return () => {
unsubP();
unsubR();
};
}, []);

async function pushQuestion() {
if (!questionText.trim()) return;
await setRound1Question({ questionText, questionType, correctAnswer });
setQuestionText("");
setCorrectAnswer("");
}

const answers = round1?.answers || {};
const scores = round1?.scores || {};

return (
<div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
<h1>Host Control - Round 1</h1>
<div className="card">
<h2 style={{ marginTop: 0, fontSize: 14, color: "var(--muted)", textTransform: "uppercase" }}>Leaderboard (whole night)</h2>
<Leaderboard />
</div>

<div className="card">
<h2 style={{ marginTop: 0, fontSize: 14, color: "var(--muted)", textTransform: "uppercase" }}>Set Question</h2>
<input
type="text"
placeholder="Question text"
value={questionText}
onChange={(e) => setQuestionText(e.target.value)}
style={{ width: "100%", marginBottom: 8 }}
/>
<div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
<select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
<option value="truefalse">True / False</option>
<option value="numeric">Numeric (closest wins)</option>
<option value="shortanswer">Short answer</option>
</select>
<input
type="text"
placeholder="Correct answer (for your reference + reveal)"
value={correctAnswer}
onChange={(e) => setCorrectAnswer(e.target.value)}
style={{ flex: 1 }}
/>
</div>
<button className="btn-primary" onClick={pushQuestion}>Push New Question</button>
</div>

{round1 && (
<>
<div className="card">
<h2 style={{ marginTop: 0, fontSize: 14, color: "var(--muted)", textTransform: "uppercase" }}>Current Question</h2>
<p style={{ fontSize: 18, fontWeight: 600 }}>{round1.questionText}</p>
<p style={{ color: "var(--muted)" }}>Correct answer: {round1.correctAnswer || "(not set)"}</p>
<div style={{ display: "flex", gap: 8 }}>
<button className="btn-good" onClick={() => setAnswersOpen(true)}>Open Answers</button>
<button className="btn-bad" onClick={() => setAnswersOpen(false)}>Lock Answers</button>
<button className="btn-primary" onClick={() => revealRound1()}>Reveal to Everyone</button>
<button className="btn-secondary" onClick={() => clearRound1Answers()}>Reset for Next Question</button>
</div>
<p style={{ marginTop: 8, color: "var(--muted)" }}>
Answers open: {String(!!round1.answersOpen)} - Revealed: {String(!!round1.revealed)}
</p>
</div>

<div className="card">
<h2 style={{ marginTop: 0, fontSize: 14, color: "var(--muted)", textTransform: "uppercase" }}>Answers Received</h2>
{players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
{players.map((p) => (
<div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #232636" }}>
<div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
<div style={{ flex: 2, color: answers[p.id] ? "var(--text)" : "var(--muted)" }}>
{answers[p.id] || "no answer yet"}
</div>
<div style={{ width: 50, textAlign: "center" }}>{scores[p.id] || 0} pts</div>
<input
type="number"
placeholder="+/-"
style={{ width: 60 }}
value={pointInputs[p.id] || ""}
onChange={(e) => setPointInputs({ ...pointInputs, [p.id]: e.target.value })}
/>
<button
className="btn-primary"
onClick={() => {
const amt = parseInt(pointInputs[p.id] || "0", 10);
if (!amt) return;
awardRound1Points(p.id, amt);
setPointInputs({ ...pointInputs, [p.id]: "" });
}}
>
Award
</button>
</div>
))}
</div>

<div className="card">
<h2 style={{ marginTop: 0, fontSize: 14, color: "var(--muted)", textTransform: "uppercase" }}>
Add Placement Points to Leaderboard
</h2>
<p style={{ color: "var(--muted)", fontSize: 13 }}>
At the end of the round, decide placements yourself and add leaderboard points per player (independent of their round score above).
</p>
{players.map((p) => (
<div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
<div style={{ flex: 1 }}>{p.name}</div>
<input
type="number"
placeholder="pts"
style={{ width: 60 }}
value={leaderboardInputs[p.id] || ""}
onChange={(e) => setLeaderboardInputs({ ...leaderboardInputs, [p.id]: e.target.value })}
/>
<button
className="btn-good"
onClick={() => {
const amt = parseInt(leaderboardInputs[p.id] || "0", 10);
if (!amt) return;
addLeaderboardPoints(p.id, amt);
setLeaderboardInputs({ ...leaderboardInputs, [p.id]: "" });
}}
>
Add to Leaderboard
</button>
</div>
))}
</div>
</>
)}
</div>
);
}
