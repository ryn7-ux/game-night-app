"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HostLoginPage() {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

  async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
                const res = await fetch("/api/host-login", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ pin }),
                });
                if (res.ok) {
                          router.push("/host");
                } else {
                          setError("Wrong PIN");
                }
        } catch (err) {
                setError("Something went wrong");
        } finally {
                setLoading(false);
        }
  }

  return (
        <div className="center-screen">
          <div className="logo-badge">Host</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>Host Access</h1>
      <form onSubmit={handleSubmit} className="form-row">
          <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Host PIN"
          autoFocus
        />
                    <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Checking..." : "Unlock"}
</button>
  </form>
{error && <p style={{ color: "var(--bad)" }}>{error}</p>}
  </div>
  );
}
