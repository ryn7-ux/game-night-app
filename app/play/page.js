"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
      getPlayerId,
      listenRound1,
      submitRound1Answer,
      listenSelfPlayer,
        listenCurrentGame,
        listenSpellingBee,
        listenPlayers,
} from "../../lib/session";
import Leaderboard from "../../components/Leaderboard";

export default function PlayPage() {
      const [playerId, setPlayerId] = useState(null);
      const [round1, setRound1] = useState(null);
      const [answer, setAnswer] = useState("");
      const [submitted, setSubmitted] = useState(false);
      const [removed, setRemoved] = useState(false);
      const sawSelfRef = useRef(false);
      const router = useRouter();
        const [currentGame, setCurrentGameState] = useState(null);
        const [spellingBee, setSpellingBeeState] = useState(null);
        const [players, setPlayers] = useState([]);

  useEffect(() => {
          const id = getPlayerId();
          if (!id) {
                    router.push("/join");
                    return;
          }
          setPlayerId(id);
          const unsub = listenRound1(setRound1);
            const unsubCG = listenCurrentGame(setCurrentGameState);
            const unsubSB = listenSpellingBee(setSpellingBeeState);
            const unsubP = listenPlayers(setPlayers);
          const unsubSelf = listenSelfPlayer(id, (exists) => {
                    if (exists) {
                                sawSelfRef.current = true;
                    } else if (sawSelfRef.current) {
                                setRemoved(true);
                    }
          });
          return () => {
                    unsub();
                      unsubCG();
                      unsubSB();
                      unsubP();
                    unsubSelf();
          };
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

  if (removed) {
          return (
                    <div className="center-screen">
                      <div className="logo-badge">🚫</div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>You have been removed</h1>
            <p style={{ color: "var(--muted)" }}>The host removed you from this game night session.</p>
        <button
          className="btn-primary"
          onClick={() => router.push("/join")}
        >
                        Back to Join
              </button>
              </div>
    );
}

  return (
          <div className="center-screen">
            <div style={{ position: "absolute", top: 20, width: "100%" }}>
        <Leaderboard />
      </div>

{!currentGame && <h2 style={{ color: "var(--muted)" }}>Waiting for the host to start...</h2>}

{currentGame === "trivia" && round1 && (
            <div className="card" style={{ maxWidth: 500, width: "100%" }}>
          <h2 style={{ marginTop: 0 }}>{round1.questionText}</h2>

{!round1.revealed && round1.answersOpen && !submitted && (
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={round1.questionType === "truefalse" ? "True or False" : "Your answer"}
                autoFocus
                style={{ flex: 1 }}
              />
              <button className="btn-primary" type="submit">Submit</button>
                  </form>
          )}

          {!round1.revealed && round1.answersOpen && submitted && (
                          <p style={{ color: "var(--good)" }}>Answer locked in - waiting for everyone else...</p>
                            )}

                {!round1.answersOpen && !round1.revealed && (
                                <p style={{ color: "var(--muted)" }}>Get ready - answers aren't open yet.</p>
          )}

{round1.revealed && (
                <div>
                  <p style={{ color: "var(--muted)" }}>Correct answer:</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "var(--good)" }}>
          {round1.correctAnswer}
</p>
              </div>
          )}
                    </div>
          )}

{currentGame === "spelling-bee" && (
              <div className="card" style={{ maxWidth: 500, width: "100%" }}>
                <h2 style={{ marginTop: 0 }}>🐝 Spelling Bee</h2>
{spellingBee?.currentPlayerId === playerId ? (
                  <p style={{ color: "var(--good)", fontSize: 20, fontWeight: 700 }}>🎤 Your turn! Spell it out loud.</p>
                ) : spellingBee?.currentPlayerId ? (
                                  <p style={{ color: "var(--muted)" }}>
                {(players.find((p) => p.id === spellingBee.currentPlayerId) || {}).name || "Someone"}'s turn - listen up!
                      </p>
                                ) : (
                                                  <p style={{ color: "var(--muted)" }}>Waiting for the host to call the next player...</p>
                                                )}
                                      </div>
                                            )}
</div>
                          );
}
