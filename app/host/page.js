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
    resetRound1Scores,
    removePlayer,
        listenCurrentGame,
        setCurrentGame,
        listenSpellingBee,
        setSpellingWord,
        setSpellingTurn,
        markSpellingCorrect,
        markSpellingIncorrect,
        resetSpellingBee,
} from "../../lib/session";
import Leaderboard from "../../components/Leaderboard";
import Avatar from "../../components/Avatar";

const GAMES = [
  {
        id: "trivia",
        name: "Trivia Round",
        icon: "🧠",
        tagline: "True/false, numeric & short-answer questions",
        status: "live",
        swatch: "linear-gradient(135deg, #1f56c9, #f2c94c)",
  },
  {
        id: "spelling-bee",
        name: "Spelling Bee",
        icon: "🐝",
        tagline: "Spell it right before time runs out",
        status: "live",
        swatch: "linear-gradient(135deg, #f2c94c, #111111)",
        theme: {
                bg: "linear-gradient(180deg, #f6d365 0%, #f2c94c 55%, #d4a017 100%)",
                fg: "#161200",
                accent: "#161200",
                border: "#161200",
        },
  },
  {
        id: "charades",
        name: "Charades",
        icon: "🎭",
        tagline: "Act it out — no talking allowed",
        status: "soon",
        swatch: "linear-gradient(135deg, #ff6b9d, #6b5bff)",
        theme: {
                bg: "linear-gradient(180deg, #2a1a4a, #12081f)",
                fg: "#f5e9ff",
                accent: "#c9a6ff",
                border: "rgba(201,166,255,0.4)",
        },
  },
  {
        id: "would-you-rather",
        name: "Would You Rather",
        icon: "🤔",
        tagline: "Pick a side, defend your choice",
        status: "soon",
        swatch: "linear-gradient(135deg, #34d399, #0d2f78)",
        theme: {
                bg: "linear-gradient(180deg, #0f3d2e, #051a13)",
                fg: "#e8fff5",
                accent: "#34d399",
                border: "rgba(52,211,153,0.4)",
        },
  },
  ];

export default function HostPage() {
    return <HostControls />;
      }

function HostControls() {
    const [selectedGame, setSelectedGame] = useState(null);
    const [players, setPlayers] = useState([]);
    const [round1, setRound1] = useState(null);
    const [confirmRemoveId, setConfirmRemoveId] = useState(null);
        const [spellingBee, setSpellingBee] = useState(null);
        const [spellingWordInput, setSpellingWordInput] = useState("");

  const [questionText, setQuestionText] = useState("");
    const [questionType, setQuestionType] = useState("truefalse");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [pointInputs, setPointInputs] = useState({});
    const [roundFinalized, setRoundFinalized] = useState(false);

  useEffect(() => {
        const unsubP = listenPlayers(setPlayers);
        const unsubR = listenRound1(setRound1);
              const unsubSB = listenSpellingBee(setSpellingBee);
        return () => {
                unsubP();
                unsubR();
                            unsubSB();
        };
  }, []);

  useEffect(() => {
        setRoundFinalized(false);
  }, [round1?.questionText]);

  async function pushQuestion() {
        if (!questionText.trim()) return;
        await setRound1Question({ questionText, questionType, correctAnswer });
        setQuestionText("");
        setCorrectAnswer("");
  }

  async function handleRemovePlayer(playerId) {
        await removePlayer(playerId);
        setConfirmRemoveId(null);
  }

      function selectGame(id) {
              setSelectedGame(id);
              setCurrentGame(id);
      }

      function backToGames() {
              setSelectedGame(null);
              setCurrentGame(null);
      }

      async function pushSpellingWord() {
              if (!spellingWordInput.trim()) return;
              await setSpellingWord(spellingWordInput.trim());
              setSpellingWordInput("");
      }

      async function handleSpellingCorrect(playerId) {
              await markSpellingCorrect(playerId);
      }

      async function handleSpellingIncorrect() {
              await markSpellingIncorrect();
      }

  const answers = round1?.answers || {};
    const scores = round1?.scores || {};

  const standings = [...players]
      .map((p) => ({ ...p, score: scores[p.id] || 0 }))
      .sort((a, b) => b.score - a.score)
      .map((p, i, arr) => ({ ...p, points: arr.length - i }));

  async function finalizeRound() {
        if (players.length === 0 || roundFinalized) return;
        await Promise.all(standings.map((s) => addLeaderboardPoints(s.id, s.points)));
        await resetRound1Scores();
        setRoundFinalized(true);
  }

  if (!selectedGame) {
        return (
                <div className="page-wrap">
                  <h1 className="page-title">🎙️ Host Control</h1>
            <p className="page-subtitle">Pick a game to run</p>
            <div className="card">
                    <p className="card-label">Leaderboard (whole night)</p>
              <Leaderboard />
          </div>
            <div className="card">
                    <p className="card-label">Players Joined ({players.length})</p>
    {players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
    {players.map((p) => (
                  <div key={p.id} className="answer-row">
                    <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
{confirmRemoveId === p.id ? (
                  <div className="form-row" style={{ justifyContent: "flex-end" }}>
                  <span style={{ color: "var(--muted)", fontSize: 13, alignSelf: "center" }}>Remove {p.name}?</span>
                  <button className="btn-bad" onClick={() => handleRemovePlayer(p.id)}>Confirm</button>
                  <button className="btn-secondary" onClick={() => setConfirmRemoveId(null)}>Cancel</button>
  </div>
              ) : (
                                <button
                                  className="btn-bad"
                                  onClick={() => setConfirmRemoveId(p.id)}
                >
                  Remove
                    </button>
              )}
</div>
          ))}
            </div>
        <GamesDashboard games={GAMES} onSelect={selectGame} />
            </div>
    );
}

  const game = GAMES.find((g) => g.id === selectedGame);

  if (game.status === "soon") {
        return (
                <div className="page-wrap">
                  <ComingSoonView game={game} onBack={() => backToGames()} />
    </div>
    );
}

  if (game.id === "spelling-bee") {
          return (
                    <div className="page-wrap">
                      <button className="btn-secondary" onClick={() => backToGames()} style={{ marginBottom: 16 }}>
          ← Back to Games
              </button>
        <h1 className="page-title">🐝 Spelling Bee</h1>
        <p className="page-subtitle">Say the word out loud, host judges live</p>

        <div className="card">
                        <p className="card-label">Leaderboard (whole night)</p>
          <Leaderboard />
              </div>

        <div className="card">
                        <p className="card-label">Set Word</p>
          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>
            Type the word for your own reference and read it out loud - players never see it typed here.
                </p>
          <div className="form-row" style={{ justifyContent: "flex-start" }}>
            <input
              type="text"
              placeholder="Word to spell"
              value={spellingWordInput}
              onChange={(e) => setSpellingWordInput(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <button className="btn-primary" onClick={pushSpellingWord}>Set Word</button>
                </div>
{spellingBee?.word && (
                <p style={{ marginTop: 10 }}>
              Current word: <strong>{spellingBee.word}</strong>
                  </p>
          )}
              </div>

        <div className="card">
                        <p className="card-label">Whose Turn</p>
{players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
{players.map((p) => (
                <div key={p.id} className="answer-row">
                  <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
{spellingBee?.currentPlayerId === p.id ? (
                    <span className="status-pill on"><span className="dot" /> Up now</span>
                  ) : (
                    <button className="btn-secondary" onClick={() => setSpellingTurn(p.id)}>Give Turn</button>
              )}
                  </div>
          ))}
              </div>

{spellingBee?.currentPlayerId && (
              <div className="card">
                <p className="card-label">Judge the Attempt</p>
             <p style={{ color: "var(--muted)" }}>
{players.find((p) => p.id === spellingBee.currentPlayerId)?.name || "Player"} is spelling - did they get it right?
    </p>
            <div className="form-row" style={{ justifyContent: "flex-start" }}>
              <button className="btn-good" onClick={() => handleSpellingCorrect(spellingBee.currentPlayerId)}>✓ Correct (+1)</button>
              <button className="btn-bad" onClick={() => handleSpellingIncorrect()}>✗ Incorrect</button>
    </div>
    </div>
        )}
            </div>
    );
}

  return (
        <div className="page-wrap">
          <button className="btn-secondary" onClick={() => backToGames()} style={{ marginBottom: 16 }}>
        ← Back to Games
          </button>
      <h1 className="page-title">🧠 Trivia Round</h1>
      <p className="page-subtitle">Round 1</p>

      <div className="card">
                  <p className="card-label">Leaderboard (whole night)</p>
        <Leaderboard />
          </div>

      <div className="card">
                  <p className="card-label">Set Question</p>
        <input
          type="text"
          placeholder="Question text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <div className="form-row" style={{ justifyContent: "flex-start", marginBottom: 10 }}>
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
            style={{ flex: 1, minWidth: 200 }}
          />
            </div>
        <button className="btn-primary" onClick={pushQuestion}>Push New Question</button>
            </div>

{round1 && (
          <>
            <div className="card">
              <p className="card-label">Current Question</p>
             <p style={{ fontSize: 19, fontWeight: 700, marginTop: 0 }}>{round1.questionText}</p>
            <p style={{ color: "var(--muted)" }}>Correct answer: {round1.correctAnswer || "(not set)"}</p>
            <div className="form-row" style={{ justifyContent: "flex-start" }}>
              <button className="btn-good" onClick={() => setAnswersOpen(true)}>Open Answers</button>
              <button className="btn-bad" onClick={() => setAnswersOpen(false)}>Lock Answers</button>
              <button className="btn-primary" onClick={() => revealRound1()}>Reveal to Everyone</button>
              <button className="btn-secondary" onClick={() => clearRound1Answers()}>Reset for Next Question</button>
  </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <span className={`status-pill ${round1.answersOpen ? "on" : "off"}`}>
                <span className="dot" /> Answers {round1.answersOpen ? "Open" : "Closed"}
</span>
              <span className={`status-pill ${round1.revealed ? "on" : "off"}`}>
                <span className="dot" /> {round1.revealed ? "Revealed" : "Hidden"}
</span>
  </div>
  </div>

          <div className="card">
              <p className="card-label">Answers Received</p>
              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>Type points in the box, then hit Award — nothing is scored automatically.</p>
{players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
{players.map((p) => (
                <div key={p.id} className="answer-row">
                  <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                <div style={{ flex: 2, color: answers[p.id] ? "var(--text)" : "var(--muted)" }}>
{answers[p.id] || "no answer yet"}
</div>
                <div style={{ width: 55, textAlign: "center", fontWeight: 700 }}>{scores[p.id] || 0} pts</div>
                <input
                  type="number"
                  placeholder="+/-"
                  style={{ width: 64 }}
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
                          <p className="card-label">Round Standings</p>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: -6 }}>
              Ranked by in-game score above. Finalizing awards leaderboard points automatically — 1st place gets {players.length || 0}, last place gets 1.
                </p>
{standings.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
{standings.map((s, i) => (
                <div key={s.id} className="answer-row">
                  <div style={{ width: 32, fontWeight: 800, color: "var(--gold)" }}>#{i + 1}</div>
                <Avatar avatarId={s.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{s.name}</div>
                <div style={{ width: 110, textAlign: "center", color: "var(--muted)" }}>{s.score} round pts</div>
                <div style={{ width: 130, textAlign: "center", fontWeight: 700, color: "var(--good)" }}>+{s.points} leaderboard</div>
  </div>
            ))}
            <button
              className="btn-good"
              onClick={finalizeRound}
              disabled={players.length === 0 || roundFinalized}
              style={{ marginTop: 12 }}
            >
{roundFinalized ? "✅ Points Awarded" : "🏆 Finalize Round & Award Points"}
</button>
  </div>
  </>
      )}
</div>
  );
}

function GamesDashboard({ games, onSelect }) {
    return (
          <div className="card">
            <p className="card-label">Choose a Game</p>
        <div className="game-grid">
    {games.map((g) => (
                <button key={g.id} className="game-card" onClick={() => onSelect(g.id)}>
            <div className="game-card-swatch" style={{ background: g.swatch }} />
            <div className="game-card-icon">{g.icon}</div>
            <div className="game-card-name">{g.name}</div>
            <div className="game-card-tagline">{g.tagline}</div>
            <span className={`status-pill ${g.status === "live" ? "on" : "off"}`}>
              <span className="dot" /> {g.status === "live" ? "Ready to Play" : "Coming Soon"}
</span>
  </button>
        ))}
          </div>
          </div>
  );
}

function ComingSoonView({ game, onBack }) {
    const t = game.theme;
    return (
          <div>
            <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Back to Games
          </button>
      <div
        className="card"
        style={{
                    background: t.bg,
          border: `1px solid ${t.border}`,
                    textAlign: "center",
                    padding: 48,
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>{game.icon}</div>
        <h2 style={{ color: t.fg, textShadow: "none", margin: "0 0 8px" }}>{game.name}</h2>
        <p style={{ color: t.fg, opacity: 0.75, margin: 0 }}>{game.tagline}</p>
        <p style={{ marginTop: 24, fontWeight: 800, color: t.accent, letterSpacing: 1 }}>🚧 COMING SOON</p>
        </div>
        </div>
  );
}
