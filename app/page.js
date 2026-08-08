import Link from "next/link";

export default function Home() {
    return (
          <div className="center-screen">
            <div className="logo-badge">🎉</div>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800 }}>Game Night</h1>
      <p className="subtitle">Players: use the join link your host sent you.</p>
      <Link href="/join" className="btn-primary link-btn" style={{ padding: "14px 28px", borderRadius: 12, fontSize: 16 }}>
        Join the game
          </Link>
          </div>
  );
}
