import Link from "next/link";

export default function Home() {
return (
<div className="center-screen">
<h1>Game Night</h1>
<p style={{ color: "var(--muted)" }}>
Players: use the join link your host sent you.
</p>
<Link href="/join" className="btn-primary" style={{ textDecoration: "none", padding: "12px 20px", borderRadius: 8 }}>
Join the game
</Link>
</div>
);
}
