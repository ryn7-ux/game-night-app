"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getPlayerId,
    listenRound1,
    submitRound1Answer,
} from "../../lib/session";
import Leaderboard from "../../components/Leaderboard";

export default function PlayPage() {
    const [playerId, setPlayerId] = useState(null);
    const [round1, setRound1] = useState(null);
    const [answer, setAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();

  useEffect(() => {
        const id = getPlayerId();
        if (!id) {
                router.push("/join");
                return;
        }
        setPlayerId(id);
        const unsub = listenRound1(setRound1);
        return () => unsub();
  }, []);

  useEffect(() => {
        if (round1 && round1.answersOpen) {
                setSubmitted(false);
                setAnswer("");
        }
  }, [round1?.questionText, round1?.answersOpen]);

  async function handleSubmit(e) {
        e.preventDefault();
        if (!answer.trim() || !playerId) return;
        await submitRound1Answer(playerId, answer.trim());
        setSubmitted(true);
  }

  return (
        <div>
          <div className="top-bar">
            <Leaderboard />
    </div>

      <div className="center-screen" style={{ minHeight: "calc(100vh - 70px)" }}>
{!round1 && <h2 style={{ color: "var(--muted)", fontWeight: 600 }}>Waiting for the host to start...</h2>}

{round1 && (
            <div className="card" style={{ maxWidth: 500, width: "100%" }}>
            <h2 style={{ marginTop: 0, fontSize: 22 }}>{round1.questionText}</h2>

{!round1.revealed && round1.answersOpen && !submitted && (
                <form onSubmit={handleSubmit} className="form-row" style={{ marginTop: 12 }}>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={round1.questionType === "truefalse" ? "True or False" : "Your answer"}
                  autoFocus
                    style={{ flex: 1, minWidth: 160 }}
                />
                <button className="btn-primary" type="submit">Submit</button>
                  </form>
            )}

{!round1.revealed && round1.answersOpen && submitted && (
                <p style={{ color: "var(--good)", fontWeight: 600 }}>✅ Answer locked in — waiting for everyone else...</p>
            )}

{!round1.answersOpen && !round1.revealed && (
                <p style={{ color: "var(--muted)" }}>Get ready — answers aren't open yet.</p>
              )}

{round1.revealed && (
                <div>
                  <p style={{ color: "var(--muted)", marginBottom: 4 }}>Correct answer:</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "var(--good)" }}>
{round1.correctAnswer}
</p>
  </div>
            )}
</div>
        )}
</div>
  </div>
   );
  }
  
