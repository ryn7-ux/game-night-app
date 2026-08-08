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
<h1>What's your name?</h1>
<form onSubmit={handleJoin} style={{ display: "flex", gap: 8 }}>
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
