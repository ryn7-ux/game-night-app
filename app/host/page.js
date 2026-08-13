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
      listenKnowHost,
      setKnowHostQuestion,
      setKnowHostAnswersOpen,
      revealKnowHost,
      awardKnowHostPoint,
      clearKnowHostAnswers,
      listenPartnerGame,
      addPartnerPair,
      removePartnerPair,
      setPartnerQuestion,
      revealPartnerAnswers,
      awardPartnerMatch,
      listenTeamGame,
      setPlayerTeam,
      setTeamName,
      setTeamPrompt,
      revealTeamPrompt,
      awardTeamPoints,
      resetTeamScores,
      listenGuessPhoto,
      startGuessPhoto,
      setGuessPhotoBlur,
      revealGuessPhoto,
      listenWhoSent,
      setWhoSentImage,
      revealWhoSent,
} from "../../lib/session";
import Leaderboard from "../../components/Leaderboard";
import Avatar from "../../components/Avatar";
import { AVATARS } from "../../lib/avatars";

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
            id: "know-your-host",
            name: "Know Your Host",
            icon: "🎙️",
            tagline: "How well do they really know you?",
            status: "live",
            swatch: "linear-gradient(135deg, #ff6b9d, #6b5bff)",
    },
    {
            id: "know-your-partner",
            name: "Know Your Partner",
            icon: "💞",
            tagline: "Type it together, match for a point",
            status: "live",
            swatch: "linear-gradient(135deg, #f472b6, #7c3aed)",
    },
    {
            id: "guess-the-real-place",
            name: "Guess the Real Place",
            icon: "🗺️",
            tagline: "Team battle - trust your gut",
            status: "live",
            swatch: "linear-gradient(135deg, #34d399, #0d2f78)",
    },
    {
            id: "guess-the-photo",
            name: "Guess the Photo",
            icon: "📸",
            tagline: "Zoomed in - guess who it is",
            status: "live",
            swatch: "linear-gradient(135deg, #fbbf24, #1f2937)",
    },
    {
            id: "who-sent-this",
            name: "Who Sent This?",
            icon: "🕵️",
            tagline: "Guess who sent the pic",
            status: "live",
            swatch: "linear-gradient(135deg, #60a5fa, #111111)",
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

  const [knowHost, setKnowHost] = useState(null);
      const [knowHostQuestionText, setKnowHostQuestionText] = useState("");
      const [knowHostAnswerInput, setKnowHostAnswerInput] = useState("");

  const [partnerGame, setPartnerGame] = useState(null);
      const [partnerQuestionInput, setPartnerQuestionInput] = useState("");
      const [pairPlayerA, setPairPlayerA] = useState("");
      const [pairPlayerB, setPairPlayerB] = useState("");

  const [teamGame, setTeamGame] = useState(null);
      const [teamPromptInput, setTeamPromptInput] = useState("");
      const [teamNameAInput, setTeamNameAInput] = useState("");
      const [teamNameBInput, setTeamNameBInput] = useState("");

  const [guessPhoto, setGuessPhoto] = useState(null);
      const [guessPhotoAvatarId, setGuessPhotoAvatarId] = useState("");

  const [whoSent, setWhoSent] = useState(null);
      const [whoSentImageUrl, setWhoSentImageUrl] = useState("");
      const [whoSentSenderId, setWhoSentSenderId] = useState("");

  useEffect(() => {
          const unsubP = listenPlayers(setPlayers);
          const unsubR = listenRound1(setRound1);
          const unsubSB = listenSpellingBee(setSpellingBee);
          const unsubKH = listenKnowHost(setKnowHost);
          const unsubPG = listenPartnerGame(setPartnerGame);
          const unsubTG = listenTeamGame(setTeamGame);
          const unsubGP = listenGuessPhoto(setGuessPhoto);
          const unsubWS = listenWhoSent(setWhoSent);
          return () => {
                    unsubP();
                    unsubR();
                    unsubSB();
                    unsubKH();
                    unsubPG();
                    unsubTG();
                    unsubGP();
                    unsubWS();
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

  async function pushKnowHostQuestion() {
          if (!knowHostQuestionText.trim()) return;
          await setKnowHostQuestion({
                    questionText: knowHostQuestionText.trim(),
                    correctAnswer: knowHostAnswerInput.trim(),
          });
          setKnowHostQuestionText("");
          setKnowHostAnswerInput("");
  }

  async function handleAddPair() {
          if (!pairPlayerA || !pairPlayerB || pairPlayerA === pairPlayerB) return;
          await addPartnerPair(pairPlayerA, pairPlayerB);
          setPairPlayerA("");
          setPairPlayerB("");
  }

  async function pushPartnerQuestion() {
          if (!partnerQuestionInput.trim()) return;
          await setPartnerQuestion(partnerQuestionInput.trim());
          setPartnerQuestionInput("");
  }

  async function pushTeamPrompt() {
          if (!teamPromptInput.trim()) return;
          await setTeamPrompt(teamPromptInput.trim());
          setTeamPromptInput("");
  }

  async function startPhotoRound() {
          if (!guessPhotoAvatarId) return;
          const avatar = AVATARS.find((a) => a.id === guessPhotoAvatarId);
          await startGuessPhoto(guessPhotoAvatarId, avatar ? avatar.name : "");
  }

  async function pushWhoSentImage() {
          if (!whoSentImageUrl.trim() || !whoSentSenderId) return;
          await setWhoSentImage(whoSentImageUrl.trim(), whoSentSenderId);
          setWhoSentImageUrl("");
          setWhoSentSenderId("");
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

  if (game.id === "know-your-host") {
          const khAnswers = knowHost?.answers || {};
          return (
                    <div className="page-wrap">
                      <button className="btn-secondary" onClick={() => backToGames()} style={{ marginBottom: 16 }}>
          ← Back to Games
              </button>
        <h1 className="page-title">🎙️ Know Your Host</h1>
        <p className="page-subtitle">How well do they really know you?</p>

        <div className="card">
                        <p className="card-label">Leaderboard (whole night)</p>
                        <Leaderboard />
              </div>

        <div className="card">
                        <p className="card-label">Set Question</p>
                        <input
                          type="text"
            placeholder="Question about you"
            value={knowHostQuestionText}
            onChange={(e) => setKnowHostQuestionText(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <input
            type="text"
            placeholder="Correct answer (for your reference + reveal)"
            value={knowHostAnswerInput}
            onChange={(e) => setKnowHostAnswerInput(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <button className="btn-primary" onClick={pushKnowHostQuestion}>Push New Question</button>
              </div>

{knowHost?.questionText && (
              <>
                <div className="card">
                  <p className="card-label">Current Question</p>
               <p style={{ fontSize: 19, fontWeight: 700, marginTop: 0 }}>{knowHost.questionText}</p>
              <p style={{ color: "var(--muted)" }}>Correct answer: {knowHost.correctAnswer || "(not set)"}</p>
              <div className="form-row" style={{ justifyContent: "flex-start" }}>
                <button className="btn-good" onClick={() => setKnowHostAnswersOpen(true)}>Open Answers</button>
                <button className="btn-bad" onClick={() => setKnowHostAnswersOpen(false)}>Lock Answers</button>
                <button className="btn-primary" onClick={() => revealKnowHost()}>Reveal to Everyone</button>
                <button className="btn-secondary" onClick={() => clearKnowHostAnswers()}>Reset for Next Question</button>
    </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <span className={`status-pill ${knowHost.answersOpen ? "on" : "off"}`}>
                  <span className="dot" /> Answers {knowHost.answersOpen ? "Open" : "Closed"}
</span>
                <span className={`status-pill ${knowHost.revealed ? "on" : "off"}`}>
                  <span className="dot" /> {knowHost.revealed ? "Revealed" : "Hidden"}
</span>
    </div>
    </div>

            <div className="card">
                  <p className="card-label">Answers Received</p>
{players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
{players.map((p) => (
                    <div key={p.id} className="answer-row">
                      <Avatar avatarId={p.avatarId} size="sm" />
                      <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ flex: 2, color: khAnswers[p.id] ? "var(--text)" : "var(--muted)" }}>
{khAnswers[p.id] || "no answer yet"}
</div>
                  <button className="btn-good" onClick={() => awardKnowHostPoint(p.id)}>+1</button>
    </div>
              ))}
                  </div>
                  </>
        )}
</div>
    );
}

if (game.id === "know-your-partner") {
          const pairs = partnerGame?.pairs || {};
          const pgAnswers = partnerGame?.answers || {};
          const nameOf = (id) => players.find((p) => p.id === id)?.name || "?";
          return (
                      <div className="page-wrap">
                        <button className="btn-secondary" onClick={() => backToGames()} style={{ marginBottom: 16 }}>
          ← Back to Games
                </button>
        <h1 className="page-title">💞 Know Your Partner</h1>
        <p className="page-subtitle">Answer for yourself, then guess your partner's answer - you decide if it's a match</p>

        <div className="card">
                          <p className="card-label">Leaderboard (whole night)</p>
          <Leaderboard />
                </div>

        <div className="card">
                          <p className="card-label">Set Up Pairs</p>
          <div className="form-row" style={{ justifyContent: "flex-start", marginBottom: 10 }}>
            <select value={pairPlayerA} onChange={(e) => setPairPlayerA(e.target.value)}>
              <option value="">Partner A</option>
{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
            <select value={pairPlayerB} onChange={(e) => setPairPlayerB(e.target.value)}>
              <option value="">Partner B</option>
{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
            <button className="btn-primary" onClick={handleAddPair}>Add Pair</button>
      </div>
{Object.entries(pairs).map(([pairId, pair]) => (
                  <div key={pairId} className="answer-row">
                    <div style={{ flex: 1, fontWeight: 600 }}>{nameOf(pair.a)} + {nameOf(pair.b)}</div>
              <button className="btn-bad" onClick={() => removePartnerPair(pairId)}>Remove</button>
      </div>
          ))}
                </div>

        <div className="card">
                          <p className="card-label">Set Question</p>
          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>
            e.g. "What's your dream destination?" - each partner answers for themselves AND guesses their partner's answer.
                  </p>
          <div className="form-row" style={{ justifyContent: "flex-start" }}>
            <input
              type="text"
              placeholder="Question for both partners"
              value={partnerQuestionInput}
              onChange={(e) => setPartnerQuestionInput(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <button className="btn-primary" onClick={pushPartnerQuestion}>Push Question</button>
                  </div>
                  </div>

{partnerGame?.questionText && (
                <div className="card">
                  <p className="card-label">Current Question</p>
             <p style={{ fontSize: 19, fontWeight: 700, marginTop: 0 }}>{partnerGame.questionText}</p>
            <button className="btn-primary" onClick={() => revealPartnerAnswers()} style={{ marginBottom: 14 }}>
              Reveal Answers
                    </button>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -8, marginBottom: 14 }}>
              You decide if each guess counts (e.g. "Paris" for "France" still counts) - hit Match to award the point.
                    </p>
{Object.entries(pairs).map(([pairId, pair]) => {
                    const aAns = pgAnswers[pair.a] || {};
                    const bAns = pgAnswers[pair.b] || {};
                    return (
                                          <div key={pairId} style={{ marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border, #333)" }}>
                                             <div style={{ fontWeight: 700, marginBottom: 6 }}>{nameOf(pair.a)} + {nameOf(pair.b)}</div>
{!partnerGame.revealed ? (
                          <p style={{ color: "var(--muted)", margin: 0 }}>
{nameOf(pair.a)}: {aAns.own && aAns.guess ? "answered" : "waiting"} · {nameOf(pair.b)}: {bAns.own && bAns.guess ? "answered" : "waiting"}
</p>
                  ) : (
                                            <>
                                              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                        <p style={{ margin: 0, flex: 1 }}>
{nameOf(pair.a)} said "{aAns.own || "-"}", guessed "{aAns.guess || "-"}"
      </p>
                        <button className="btn-good" onClick={() => addLeaderboardPoints(pair.a, 1)}>Match ✓ +1</button>
      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                        <p style={{ margin: 0, flex: 1 }}>
{nameOf(pair.b)} said "{bAns.own || "-"}", guessed "{bAns.guess || "-"}"
      </p>
                        <button className="btn-good" onClick={() => addLeaderboardPoints(pair.b, 1)}>Match ✓ +1</button>
      </div>
      </>
                  )}
                        </div>
              );
})}
</div>
        )}
</div>
    );
}

  if (game.id === "guess-the-real-place") {
          const assignments = teamGame?.assignments || {};
          const teamScores = teamGame?.scores || {};
          const teamNames = teamGame?.teamNames || {};
          return (
                    <div className="page-wrap">
                      <button className="btn-secondary" onClick={() => backToGames()} style={{ marginBottom: 16 }}>
          ← Back to Games
              </button>
        <h1 className="page-title">🗺️ Guess the Real Place</h1>
        <p className="page-subtitle">Team battle - default scoring, refine later</p>

        <div className="card">
                        <p className="card-label">Leaderboard (whole night)</p>
          <Leaderboard />
              </div>

        <div className="card">
                        <p className="card-label">Team Names</p>
          <div className="form-row" style={{ justifyContent: "flex-start" }}>
            <input type="text" placeholder="Team A name" value={teamNameAInput} onChange={(e) => setTeamNameAInput(e.target.value)} />
            <button className="btn-secondary" onClick={() => { setTeamName("A", teamNameAInput.trim()); setTeamNameAInput(""); }}>Set</button>
            <input type="text" placeholder="Team B name" value={teamNameBInput} onChange={(e) => setTeamNameBInput(e.target.value)} />
            <button className="btn-secondary" onClick={() => { setTeamName("B", teamNameBInput.trim()); setTeamNameBInput(""); }}>Set</button>
              </div>
              </div>

        <div className="card">
                        <p className="card-label">Assign Teams</p>
{players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
{players.map((p) => (
                <div key={p.id} className="answer-row">
                  <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
              <button className={assignments[p.id] === "A" ? "btn-good" : "btn-secondary"} onClick={() => setPlayerTeam(p.id, "A")}>
{teamNames.A || "Team A"}
</button>
              <button className={assignments[p.id] === "B" ? "btn-good" : "btn-secondary"} onClick={() => setPlayerTeam(p.id, "B")}>
{teamNames.B || "Team B"}
</button>
    </div>
          ))}
</div>

        <div className="card">
                        <p className="card-label">Set Prompt</p>
          <div className="form-row" style={{ justifyContent: "flex-start" }}>
            <input
              type="text"
              placeholder="Place / clue for this round"
              value={teamPromptInput}
              onChange={(e) => setTeamPromptInput(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <button className="btn-primary" onClick={pushTeamPrompt}>Push Prompt</button>
                </div>
{teamGame?.prompt && (
                <p style={{ marginTop: 10 }}>
              Current prompt: <strong>{teamGame.prompt}</strong>
</p>
          )}
{teamGame?.prompt && (
                <button className="btn-primary" onClick={() => revealTeamPrompt()} style={{ marginTop: 10 }}>Reveal to Everyone</button>
          )}
</div>

        <div className="card">
                        <p className="card-label">Team Scores</p>
          <div className="answer-row">
                          <div style={{ flex: 1, fontWeight: 600 }}>{teamNames.A || "Team A"}</div>
            <div style={{ width: 60, textAlign: "center", fontWeight: 700 }}>{teamScores.A || 0} pts</div>
            <button className="btn-good" onClick={() => awardTeamPoints("A", 1)}>+1</button>
            <button className="btn-bad" onClick={() => awardTeamPoints("A", -1)}>-1</button>
              </div>
          <div className="answer-row">
                          <div style={{ flex: 1, fontWeight: 600 }}>{teamNames.B || "Team B"}</div>
            <div style={{ width: 60, textAlign: "center", fontWeight: 700 }}>{teamScores.B || 0} pts</div>
            <button className="btn-good" onClick={() => awardTeamPoints("B", 1)}>+1</button>
            <button className="btn-bad" onClick={() => awardTeamPoints("B", -1)}>-1</button>
    </div>
          <button className="btn-secondary" onClick={() => resetTeamScores()} style={{ marginTop: 12 }}>Reset Scores</button>
              </div>
              </div>
    );
}

  if (game.id === "guess-the-photo") {
          const gpAnswers = guessPhoto?.answers || {};
          const photoOptions = AVATARS.filter((a) => a.photoUrl);
          return (
                    <div className="page-wrap">
                      <button className="btn-secondary" onClick={() => backToGames()} style={{ marginBottom: 16 }}>
          ← Back to Games
              </button>
        <h1 className="page-title">📸 Guess the Photo</h1>
        <p className="page-subtitle">Zoomed in - guess who it is</p>

        <div className="card">
                        <p className="card-label">Leaderboard (whole night)</p>
          <Leaderboard />
              </div>

        <div className="card">
                        <p className="card-label">Start Round</p>
          <div className="form-row" style={{ justifyContent: "flex-start" }}>
            <select value={guessPhotoAvatarId} onChange={(e) => setGuessPhotoAvatarId(e.target.value)}>
              <option value="">Pick a photo</option>
{photoOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
    </select>
            <button className="btn-primary" onClick={startPhotoRound}>Start Round</button>
    </div>
    </div>

{guessPhoto?.avatarId && (
              <>
                <div className="card" style={{ textAlign: "center" }}>
              <p className="card-label">Live Photo (host view)</p>
              <div style={{ display: "inline-block", filter: `blur(${guessPhoto.blurLevel || 0}px)`, transition: "filter 0.3s" }}>
                <Avatar avatarId={guessPhoto.avatarId} size="lg" />
    </div>
              <p style={{ marginTop: 10, color: "var(--muted)" }}>Blur level: {guessPhoto.blurLevel ?? 0}</p>
              <div className="form-row" style={{ justifyContent: "center" }}>
                <button className="btn-secondary" onClick={() => setGuessPhotoBlur(Math.min(24, (guessPhoto.blurLevel ?? 0) + 4))}>Blur +</button>
                <button className="btn-secondary" onClick={() => setGuessPhotoBlur(Math.max(0, (guessPhoto.blurLevel ?? 0) - 4))}>Sharpen -</button>
                <button className="btn-primary" onClick={() => revealGuessPhoto()}>Reveal</button>
    </div>
{guessPhoto.revealed && (
                    <p style={{ marginTop: 10, fontWeight: 700, color: "var(--good)" }}>It's {guessPhoto.correctName}!</p>
                  )}
</div>

            <div className="card">
                  <p className="card-label">Guesses</p>
{players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
{players.map((p) => (
                    <div key={p.id} className="answer-row">
                      <Avatar avatarId={p.avatarId} size="sm" />
                      <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ flex: 2, color: gpAnswers[p.id] ? "var(--text)" : "var(--muted)" }}>
{gpAnswers[p.id] || "no guess yet"}
</div>
                  <button className="btn-good" onClick={() => addLeaderboardPoints(p.id, 1)}>+1</button>
    </div>
              ))}
                  </div>
                  </>
        )}
</div>
    );
}

  if (game.id === "who-sent-this") {
                const wsAnswers = whoSent?.answers || {};
          return (
                    <div className="page-wrap">
                      <button className="btn-secondary" onClick={() => backToGames()} style={{ marginBottom: 16 }}>
          ← Back to Games
              </button>
        <h1 className="page-title">🕵️ Who Sent This?</h1>
        <p className="page-subtitle">Guess who sent the pic - rules TBD, framework only</p>

        <div className="card">
                        <p className="card-label">Leaderboard (whole night)</p>
          <Leaderboard />
              </div>

        <div className="card">
                        <p className="card-label">Post Image</p>
          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>
            Paste an image URL and pick who actually sent it.
                </p>
          <input
            type="text"
            placeholder="Image URL"
            value={whoSentImageUrl}
            onChange={(e) => setWhoSentImageUrl(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <div className="form-row" style={{ justifyContent: "flex-start" }}>
            <select value={whoSentSenderId} onChange={(e) => setWhoSentSenderId(e.target.value)}>
              <option value="">Actual sender</option>
{players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
            <button className="btn-primary" onClick={pushWhoSentImage}>Post Image</button>
    </div>
    </div>

{whoSent?.imageUrl && (
              <>
                <div className="card" style={{ textAlign: "center" }}>
              <p className="card-label">Current Image</p>
              <img src={whoSent.imageUrl} alt="Guess who sent this" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 12 }} />
              <div style={{ marginTop: 12 }}>
                <button className="btn-primary" onClick={() => revealWhoSent()}>Reveal & Award Points</button>
    </div>
{whoSent.revealed && (
                    <p style={{ marginTop: 10, fontWeight: 700, color: "var(--good)" }}>
                  Sent by {players.find((p) => p.id === whoSent.correctSenderId)?.name || "?"}
</p>
              )}
</div>

            <div className="card">
                  <p className="card-label">Guesses</p>
{players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
{players.map((p) => (
                    <div key={p.id} className="answer-row">
                      <Avatar avatarId={p.avatarId} size="sm" />
                      <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ flex: 2, color: wsAnswers[p.id] ? "var(--text)" : "var(--muted)" }}>
{wsAnswers[p.id] ? (players.find((pl) => pl.id === wsAnswers[p.id])?.name || "?") : "no guess yet"}
</div>
    </div>
              ))}
                  </div>
                  </>
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
