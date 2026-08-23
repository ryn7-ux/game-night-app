"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getPlayerId,
  listenRound1,
  submitRound1Answer,
  listenSelfPlayer,
  listenCurrentGame,
  listenLeaderboardVisible,
  listenRoundScoresVisible,
  listenSpellingBee,
  listenPlayers,
  listenKnowHost,
  submitKnowHostAnswer,
  tryClaimKnowHostEasterEgg,
  listenPartnerGame,
  submitPartnerAnswer,
  listenTeamGame,
  setCaptainOrder,
  listenGuessPhoto,
  submitGuessPhotoAnswer,
  listenWhoSent,
  submitWhoSentGuess,
} from "../../lib/session";
import Leaderboard from "../../components/Leaderboard";
import Avatar from "../../components/Avatar";

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
  const [spectator, setSpectator] = useState(false);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [roundScoresVisible, setRoundScoresVisible] = useState(false);

  const [knowHost, setKnowHost] = useState(null);
  const [knowHostAnswer, setKnowHostAnswer] = useState("");
  const [knowHostOrder, setKnowHostOrder] = useState([]);
  const [knowHostSubmitted, setKnowHostSubmitted] = useState(false);
  const [knowHostTierAssign, setKnowHostTierAssign] = useState({});
  const [knowHostEasterEggOpen, setKnowHostEasterEggOpen] = useState(false);
  const [knowHostEasterEggGuess, setKnowHostEasterEggGuess] = useState("");
  const [knowHostEasterEggResult, setKnowHostEasterEggResult] = useState(null);
  const [knowHostGuessList, setKnowHostGuessList] = useState(["", "", "", "", ""]);

  const [partnerGame, setPartnerGame] = useState(null);
  const [partnerOwnAnswer, setPartnerOwnAnswer] = useState("");
  const [partnerGuessAnswer, setPartnerGuessAnswer] = useState("");
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  const [teamGame, setTeamGame] = useState(null);
  const [captainOrderDraft, setCaptainOrderDraft] = useState(null);
  const [captainOrderSubmitted, setCaptainOrderSubmitted] = useState(false);

  const [guessPhoto, setGuessPhoto] = useState(null);
  const [guessPhotoAnswer, setGuessPhotoAnswer] = useState("");
  const [guessPhotoSubmitted, setGuessPhotoSubmitted] = useState(false);

  const [whoSent, setWhoSent] = useState(null);
  const [whoSentGuess, setWhoSentGuess] = useState("");
  const [whoSentSubmitted, setWhoSentSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSpectator = params.get("spectator") === "1";
    setSpectator(isSpectator);
    const id = getPlayerId();
    if (!id && !isSpectator) {
      router.push("/join");
      return;
    }
    setPlayerId(id);
    const unsub = listenRound1(setRound1);
    const unsubCG = listenCurrentGame(setCurrentGameState);
    const unsubLV = listenLeaderboardVisible(setLeaderboardVisible);
    const unsubRSV = listenRoundScoresVisible(setRoundScoresVisible);
    const unsubSB = listenSpellingBee(setSpellingBeeState);
    const unsubP = listenPlayers(setPlayers);
    const unsubKH = listenKnowHost(setKnowHost);
    const unsubPG = listenPartnerGame(setPartnerGame);
    const unsubTG = listenTeamGame(setTeamGame);
    const unsubGP = listenGuessPhoto(setGuessPhoto);
    const unsubWS = listenWhoSent(setWhoSent);
    const unsubSelf = id
      ? listenSelfPlayer(id, (exists) => {
          if (exists) {
            sawSelfRef.current = true;
          } else if (sawSelfRef.current) {
            setRemoved(true);
          }
        })
      : () => {};
    return () => {
      unsub();
      unsubCG();
      unsubLV();
      unsubRSV();
      unsubSB();
      unsubP();
      unsubKH();
      unsubPG();
      unsubTG();
      unsubGP();
      unsubWS();
      unsubSelf();
    };
  }, []);

  useEffect(() => {
    if (round1 && round1.answersOpen) {
      setSubmitted(false);
      setAnswer("");
    }
  }, [round1?.questionText, round1?.answersOpen]);

  useEffect(() => {
    setKnowHostSubmitted(false);
    setKnowHostAnswer("");
    setKnowHostOrder([]);
    setKnowHostTierAssign({});
    setKnowHostEasterEggOpen(false);
    setKnowHostEasterEggGuess("");
    setKnowHostEasterEggResult(null);
    setKnowHostGuessList(["", "", "", "", ""]);
  }, [knowHost?.prompt]);

  useEffect(() => {
    setPartnerSubmitted(false);
    setPartnerOwnAnswer("");
    setPartnerGuessAnswer("");
  }, [partnerGame?.questionText]);

  useEffect(() => {
    setGuessPhotoSubmitted(false);
    setGuessPhotoAnswer("");
  }, [guessPhoto?.avatarId]);

  useEffect(() => {
    setWhoSentSubmitted(false);
    setWhoSentGuess("");
  }, [whoSent?.imageUrl]);

  useEffect(() => {
    setCaptainOrderSubmitted(false);
    setCaptainOrderDraft(null);
  }, [teamGame?.orderingOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!answer.trim() || !playerId) return;
    await submitRound1Answer(playerId, answer.trim());
    setSubmitted(true);
  }

  async function handleKnowHostSubmit(e) {
    e.preventDefault();
    if (!knowHostAnswer.trim() || !playerId) return;
    await submitKnowHostAnswer(playerId, knowHostAnswer.trim());
    setKnowHostSubmitted(true);
  }

  function toggleKnowHostOrderItem(item) {
    setKnowHostOrder((prev) => {
      if (prev.includes(item)) return prev.filter((x) => x !== item);
      const limit = knowHost?.type === "rank" ? (knowHost.items?.length || 0) : (knowHost?.pickCount || 0);
      if (prev.length >= limit) return prev;
      return [...prev, item];
    });
  }

  async function handleKnowHostOrderSubmit() {
    if (!playerId || knowHostOrder.length === 0) return;
    await submitKnowHostAnswer(playerId, knowHostOrder);
    setKnowHostSubmitted(true);
  }

  async function handleKnowHostMcqSubmit(i) {
    if (!playerId) return;
    await submitKnowHostAnswer(playerId, i);
    setKnowHostSubmitted(true);
  }

  function cycleKnowHostTier(item) {
    setKnowHostTierAssign((prev) => {
      const tiers = knowHost?.tiers || [];
      const order = tiers.map((t) => t.id);
      const counts = {};
      order.forEach((id) => (counts[id] = 0));
      Object.entries(prev).forEach(([it, tid]) => {
        if (it !== item && counts[tid] !== undefined) counts[tid]++;
      });
      const current = prev[item];
      const startIdx = current ? order.indexOf(current) + 1 : 0;
      for (let i = 0; i < order.length; i++) {
        const idx = (startIdx + i) % order.length;
        const tid = order[idx];
        const cap = tiers.find((t) => t.id === tid)?.capacity || 0;
        if (counts[tid] < cap) {
          return { ...prev, [item]: tid };
        }
      }
      const next = { ...prev };
      delete next[item];
      return next;
    });
  }

  async function handleKnowHostTierSubmit() {
    if (!playerId) return;
    await submitKnowHostAnswer(playerId, knowHostTierAssign);
    setKnowHostSubmitted(true);
  }

  async function handleKnowHostEasterEggSubmit(e) {
    e.preventDefault();
    if (!playerId || !knowHost?.easterEgg) return;
    const guess = knowHostEasterEggGuess.trim().toLowerCase();
    const correct = guess === (knowHost.easterEgg.answer || "").trim().toLowerCase();
    if (!correct) {
      setKnowHostEasterEggResult("wrong");
      return;
    }
    const claimed = await tryClaimKnowHostEasterEgg(playerId, knowHost.easterEgg.points);
    setKnowHostEasterEggResult(claimed ? "found" : "already");
  }

  function updateKnowHostGuess(index, value) {
    setKnowHostGuessList((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleKnowHostGuessListSubmit() {
    if (!playerId) return;
    const filled = knowHostGuessList.map((g) => g.trim()).filter((g) => g.length > 0);
    if (filled.length === 0) return;
    await submitKnowHostAnswer(playerId, filled);
    setKnowHostSubmitted(true);
  }

  async function handlePartnerSubmit(e) {
    e.preventDefault();
    if (!partnerOwnAnswer.trim() || !partnerGuessAnswer.trim() || !playerId) return;
    await submitPartnerAnswer(playerId, partnerOwnAnswer.trim(), partnerGuessAnswer.trim());
    setPartnerSubmitted(true);
  }

  async function handleGuessPhotoSubmit(e) {
    e.preventDefault();
    if (!guessPhotoAnswer.trim() || !playerId) return;
    await submitGuessPhotoAnswer(playerId, guessPhotoAnswer.trim());
    setGuessPhotoSubmitted(true);
  }

  async function handleWhoSentSubmit(e) {
    e.preventDefault();
    if (!whoSentGuess || !playerId) return;
    await submitWhoSentGuess(playerId, whoSentGuess);
    setWhoSentSubmitted(true);
  }

  const myTeam = teamGame?.assignments?.[playerId];
  const isCaptain = myTeam && teamGame?.captains?.[myTeam] === playerId;
  const myTeamRoster = teamGame
    ? Object.entries(teamGame.assignments || {})
        .filter(([, t]) => t === myTeam)
        .map(([id]) => id)
    : [];

  function moveCaptainDraft(index, dir) {
    setCaptainOrderDraft((prev) => {
      const arr = [...(prev || myTeamRoster)];
      const j = index + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[index], arr[j]] = [arr[j], arr[index]];
      return arr;
    });
  }

  async function handleCaptainOrderSubmit() {
    if (!myTeam) return;
    const order = captainOrderDraft || myTeamRoster;
    await setCaptainOrder(myTeam, order);
    setCaptainOrderSubmitted(true);
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
      {spectator && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "#f2c94c",
            color: "#161200",
            textAlign: "center",
            padding: "6px 0",
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: 0.5,
            zIndex: 999,
          }}
        >
          👁 PLAYER VIEW PREVIEW — HOST ONLY, NOT A REAL SUBMISSION
        </div>
      )}
      {leaderboardVisible && (
        <div
          style={{
            position: "fixed",
            top: spectator ? 34 : 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "#05070f",
            zIndex: 500,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            overflowY: "auto",
          }}
        >
          <h2 style={{ marginBottom: 16 }}>🏆 Leaderboard</h2>
          <div style={{ width: "100%", maxWidth: 600 }}>
            <Leaderboard />
          </div>
        </div>
      )}

      {roundScoresVisible && currentGame && (() => {
        let title = "";
        let entries = [];
        if (currentGame === "guess-the-real-place") {
          title = "🔍 Team Scores";
          entries = [
            { name: teamGame?.teamNames?.A || "Team A", score: teamGame?.scores?.A || 0 },
            { name: teamGame?.teamNames?.B || "Team B", score: teamGame?.scores?.B || 0 },
          ];
        } else {
          const map = {
            trivia: ["🧠 Trivia", round1?.scores],
            "spelling-bee": ["🐝 Spelling Bee", spellingBee?.scores],
            "know-your-host": ["🎙️ Know Your Host", knowHost?.scores],
            "know-your-partner": ["💞 Know Your Partner", partnerGame?.scores],
            "guess-the-photo": ["📸 Guess the Photo", guessPhoto?.scores],
            "who-sent-this": ["🕵️ Who Sent This?", whoSent?.scores],
          };
          const found = map[currentGame];
          if (!found) return null;
          title = found[0];
          const scores = found[1] || {};
          entries = [...players]
            .map((p) => ({ name: p.name, score: scores[p.id] || 0 }))
            .sort((a, b) => b.score - a.score);
        }
        return (
          <div
            style={{
              position: "fixed",
              top: spectator ? 34 : 0,
              left: 0,
              right: 0,
              zIndex: 400,
              background: "#111a3d",
              borderBottom: "1px solid #333",
              padding: "10px 16px",
              display: "flex",
              gap: 16,
              alignItems: "center",
              overflowX: "auto",
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>{title}</span>
            {entries.map((e, i) => (
              <span key={i} style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                {e.name}: {e.score}
              </span>
            ))}
          </div>
        );
      })()}

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
                disabled={spectator}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" type="submit" disabled={spectator}>Submit</button>
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
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: -8, marginBottom: 12 }}>Round {spellingBee?.round || 1} of 3</p>
          {spellingBee?.currentPlayerId === playerId ? (
            <p style={{ color: "var(--good)", fontSize: 20, fontWeight: 700 }}>🎤 Your turn! Spell it out loud.</p>
          ) : spellingBee?.currentPlayerId ? (
            <p style={{ color: "var(--muted)" }}>
              {(players.find((p) => p.id === spellingBee.currentPlayerId) || {}).name || "Someone"}'s turn - listen up!
            </p>
          ) : (
            <p style={{ color: "var(--muted)" }}>Waiting for the host to call the next player...</p>
          )}
          {spellingBee?.revealed && spellingBee?.word && (
            <p style={{ marginTop: 14, color: "var(--good)", fontWeight: 700, fontSize: 18 }}>
              The word was: {spellingBee.word} ({spellingBee.points || 1} pt{(spellingBee.points || 1) === 1 ? "" : "s"})
            </p>
          )}
        </div>
      )}

      {currentGame === "know-your-host" && (
        <div className="card" style={{ maxWidth: 500, width: "100%" }}>
          <h2 style={{ marginTop: 0 }}>🎙️ Know Your Host</h2>
          {knowHost?.prompt ? (
            <>
              <p style={{ fontSize: 18, fontWeight: 600 }}>{knowHost.prompt}</p>

              {knowHost.type === "text" && !knowHost.revealed && knowHost.answersOpen && !knowHostSubmitted && (
                <form onSubmit={handleKnowHostSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input
                    type="text"
                    value={knowHostAnswer}
                    onChange={(e) => setKnowHostAnswer(e.target.value)}
                    placeholder="Your guess"
                    autoFocus
                    disabled={spectator}
                    style={{ flex: 1 }}
                  />
                  <button className="btn-primary" type="submit" disabled={spectator}>Submit</button>
                </form>
              )}

              {(knowHost.type === "rank" || knowHost.type === "pick-rank") &&
                !knowHost.revealed && knowHost.answersOpen && !knowHostSubmitted && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>
                    Tap items in order{knowHost.type === "pick-rank" ? ` (pick ${knowHost.pickCount})` : ""}. Tap again to remove.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {(knowHost.type === "rank" ? knowHost.items : knowHost.pool || []).map((item) => {
                      const pos = knowHostOrder.indexOf(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          disabled={spectator}
                          onClick={() => toggleKnowHostOrderItem(item)}
                          className={pos >= 0 ? "btn-primary" : "btn-secondary"}
                          style={{ fontSize: 13 }}
                        >
                          {pos >= 0 ? `${pos + 1}. ` : ""}{item}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="btn-good"
                    style={{ marginTop: 12 }}
                    disabled={
                      spectator ||
                      knowHostOrder.length === 0 ||
                      (knowHost.type === "rank" && knowHostOrder.length !== (knowHost.items?.length || 0)) ||
                      (knowHost.type === "pick-rank" && knowHostOrder.length !== knowHost.pickCount)
                    }
                    onClick={handleKnowHostOrderSubmit}
                  >
                    Submit Order
                  </button>
                </div>
              )}

              {knowHost.type === "mcq" && !knowHost.revealed && knowHost.answersOpen && !knowHostSubmitted && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {(knowHost.options || []).map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={spectator}
                      className="btn-secondary"
                      onClick={() => handleKnowHostMcqSubmit(i)}
                      style={{ textAlign: "left" }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {knowHost.type === "tier" && !knowHost.revealed && knowHost.answersOpen && !knowHostSubmitted && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>
                    Tap a movie to cycle it through the tiers: {(knowHost.tiers || []).map((t) => t.label).join(" → ")}.
                  </p>
                  <div style={{ display: "flex", flexWrap": "wrap", gap: 8, marginTop: 8 }}>
                    {(knowHost.items || []).map((item) => {
                      const tid = knowHostTierAssign[item];
                      const label = tid ? knowHost.tiers?.find((t) => t.id === tid)?.label : null;
                      return (
                        <button
                          key={item}
                          type="button"
                          disabled={spectator}
                          onClick={() => cycleKnowHostTier(item)}
                          className={tid ? "btn-primary" : "btn-secondary"}
                          style={{ fontSize: 13 }}
                        >
                          {item}{label ? ` (${label})` : ""}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="btn-good"
                    style={{ marginTop: 12 }}
                    disabled={
                      spectator ||
                      Object.keys(knowHostTierAssign).length !== (knowHost.items?.length || 0)
                    }
                    onClick={handleKnowHostTierSubmit}
                >
                    Submit Tiers
                  </button>

                  {knowHost.easterEgg && (
                    <div style={{ marginTop: 22, textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => setKnowHostEasterEggOpen((v) => !v)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(255,255,255,0.18)",
                          fontSize: 12,
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        ⭐
                      </button>
                      {knowHostEasterEggOpen && (
                        <form onSubmit={handleKnowHostEasterEggSubmit} style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <input
                            type="text"
                            value={knowHostEasterEggGuess}
                            onChange={(e) => setKnowHostEasterEggGuess(e.target.value)}
                            placeholder={knowHost.easterEgg.prompt}
                            disabled={spectator}
                            style={{ flex: 1, fontSize: 12 }}
                          />
                          <button className="btn-secondary" type="submit" disabled={spectator} style={{ fontSize: 12 }}>
                            Guess
                          </button>
                        </form>
                      )}
                      {knowHostEasterEggResult === "found" && (
                        <p style={{ color: "var(--good)", fontSize: 12, marginTop: 4 }}>
                          🎉 Found it! +{knowHost.easterEgg.points} pts
                        </p>
                      )}
                      {knowHostEasterEggResult === "already" && (
                        <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>Already claimed by someone.</p>
                      )}
                      {knowHostEasterEggResult === "wrong" && (
                        <p style={{ color: "var(--bad)", fontSize: 12, marginTop: 4 }}>Not quite.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {knowHost.type === "guess-list" && !knowHost.revealed && knowHost.answersOpen && !knowHostSubmitted && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>
                    Fill in as many as you want (up to {knowHost.maxGuesses || 5}). Order matters for bonus points.
                  </p>
                  {knowHostGuessList.map((g, i) => (
                    <input
                      key={i}
                      type="text"
                      value={g}
                      onChange={(e) => updateKnowHostGuess(i, e.target.value)}
                      placeholder={`Guess #${i + 1}`}
                      disabled={spectator}
                      style={{ width: "100%", marginTop: 8 }}
                    />
                  ))}
                  <button
                    className="btn-good"
                    style={{ marginTop: 12 }}
                    disabled={spectator || knowHostGuessList.every((g) => !g.trim())}
                    onClick={handleKnowHostGuessListSubmit}
                  >
                    Submit Guesses
                  </button>
                </div>
              )}

              {!knowHost.revealed && knowHost.answersOpen && knowHostSubmitted && (
                <p style={{ color: "var(--good)" }}>Answer locked in - waiting for everyone else...</p>
              )}
              {!knowHost.answersOpen && !knowHost.revealed && (
                <p style={{ color: "var(--muted)" }}>Get ready - answers aren't open yet.</p>
              )}
              {knowHost.revealed && (
                <div>
                  <p style={{ color: "var(--muted)" }}>Correct answer:</p>
                  {knowHost.type === "text" && (
                    <p style={{ fontSize: 22, fontWeight: 700, color: "var(--good)" }}>{knowHost.answer}</p>
                  )}
                  {(knowHost.type === "rank" || knowHost.type === "pick-rank") && (
                    <p style={{ fontSize: 18, fontWeight: 700, color: "var(--good)" }}>
                      {(knowHost.answerOrder || []).join(" → ")}
                    </p>
                  )}
                  {knowHost.type === "mcq" && (
                    <p style={{ fontSize: 22, fontWeight: 700, color: "var(--good)" }}>
                      {knowHost.options?.[knowHost.correctIndex]}
                    </p>
                  )}
                  {knowHost.type === "tier" && (
                    <div style={{ fontSize: 14 }}>
                      {(knowHost.tiers || []).map((t) => (
                        <p key={t.id} style={{ margin: "4px 0" }}>
                          <strong style={{ color: "var(--good)" }}>{t.label}:</strong>{" "}
                          {(knowHost.items || []).filter((it) => knowHost.answerTiers?.[it] === t.id).join(", ")}
                        </p>
                      ))}
                    </div>
                  )}
                  {knowHost.type === "guess-list" && (
                    <p style={{ fontSize: 18, fontWeight: 700, color: "var(--good)" }}>
                      {(knowHost.answerOrder || []).join(" → ")}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>Waiting for the host to ask a question...</p>
          )}
        </div>
      )}

      {currentGame === "know-your-partner" && (
        <div className="card" style={{ maxWidth: 500, width: "100%" }}>
          <h2 style={{ marginTop: 0 }}>💞 Know Your Partner</h2>
          {partnerGame?.questionText ? (
            <>
              <p style={{ fontSize: 18, fontWeight: 600 }}>{partnerGame.questionText}</p>
              {!partnerGame.revealed && !partnerSubmitted && (
                <form onSubmit={handlePartnerSubmit} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  <input
                    type="text"
                    value={partnerOwnAnswer}
                    onChange={(e) => setPartnerOwnAnswer(e.target.value)}
                    placeholder="Your answer"
                    autoFocus
                    disabled={spectator}
                  />
                  <input
                    type="text"
                    value={partnerGuessAnswer}
                    onChange={(e) => setPartnerGuessAnswer(e.target.value)}
                    placeholder="What do you think your partner said?"
                    disabled={spectator}
                  />
                  <button className="btn-primary" type="submit" disabled={spectator}>Submit Both</button>
                </form>
              )}
              {(partnerSubmitted || partnerGame.revealed) && (
                <p style={{ color: "var(--good)" }}>Locked in - waiting for the host to reveal...</p>
              )}
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>Waiting for the host to ask a question...</p>
          )}
        </div>
      )}

      {currentGame === "guess-the-real-place" && (
        <div className="card" style={{ maxWidth: 500, width: "100%" }}>
          <h2 style={{ marginTop: 0 }}>🔍 Real or Fake?</h2>
          <p style={{ color: "var(--muted)" }}>
            You're on {myTeam ? `Team ${myTeam}` : "no team yet"}{isCaptain ? " - you're the captain ⭐" : ""}.
          </p>

          {teamGame?.round ? (
            <>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{teamGame.round.category}</p>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                {(teamGame.teamNames?.[teamGame.round.currentTurn] || `Team ${teamGame.round.currentTurn}`)}'s turn - call one out, the host will click it.
              </p>
              <div style={{ display: "flex", flexWrap": "wrap", gap: 8, marginTop: 8 }}>
                {teamGame.round.options.map((opt, i) => {
                  const claimedBy = teamGame.round.results && teamGame.round.results[i];
                  let style = { padding: "6px 10px", borderRadius: 8, fontSize: 13, border: "1px solid var(--border)" };
                  if (claimedBy) {
                    style = opt.isReal
                      ? { ...style, background: "var(--good)", color: "#04240f" }
                      : { ...style, background: "var(--bad)", color: "#2a0505" };
                  }
                  return (
                    <div key={i} style={style}>
                      {opt.text}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>Waiting for the host to push the next round...</p>
          )}

          {teamGame?.orderingOpen && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              {!isCaptain ? (
                <p style={{ color: "var(--muted)" }}>Waiting for your captain to decide your team's point order...</p>
              ) : captainOrderSubmitted ? (
                <p style={{ color: "var(--good)" }}>Order submitted - waiting for the host to finalize.</p>
              ) : (
                <>
                  <p style={{ fontWeight: 700 }}>Rank your team for bonus points</p>
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>Top of the list gets the most points. Use the arrows to reorder.</p>
                  {(captainOrderDraft || myTeamRoster).map((id, i) => {
                    const p = players.find((pl) => pl.id === id);
                    return (
                      <div key={id} className="answer-row">
                        <div style={{ flex: 1, fontWeight: 600 }}>{i + 1}. {p ? p.name : "?"}</div>
                        <button className="btn-secondary" onClick={() => moveCaptainDraft(i, -1)} disabled={i === 0}>↑</button>
                        <button className="btn-secondary" onClick={() => moveCaptainDraft(i, 1)} disabled={i === (captainOrderDraft || myTeamRoster).length - 1}>↓</button>
                      </div>
                    );
                  })}
                  <button className="btn-good" style={{ marginTop: 12 }} onClick={handleCaptainOrderSubmit}>
                    Submit Order
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {currentGame === "guess-the-photo" && (
        <div className="card" style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
          <h2 style={{ marginTop: 0 }}>📸 Guess the Photo</h2>
          {guessPhoto?.avatarId ? (
            <>
              <div style={{ display: "inline-block", filter: `blur(${guessPhoto.blurLevel || 0}px)`, transition: "filter 0.3s" }}>
                <Avatar avatarId={guessPhoto.avatarId} size="lg" />
              </div>
              {!guessPhoto.revealed && !guessPhotoSubmitted && (
                <form onSubmit={handleGuessPhotoSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <input
                    type="text"
                    value={guessPhotoAnswer}
                    onChange={(e) => setGuessPhotoAnswer(e.target.value)}
                    placeholder="Who is it?"
                    autoFocus
                    disabled={spectator}
                    style={{ flex: 1 }}
                />
                  <button className="btn-primary" type="submit" disabled={spectator}>Submit</button>
                </form>
              )}
              {!guessPhoto.revealed && guessPhotoSubmitted && (
                <p style={{ color: "var(--good)", marginTop: 12 }}>Guess locked in - waiting for the reveal...</p>
              )}
              {guessPhoto.revealed && (
                <p style={{ marginTop: 12, fontWeight: 700, color: "var(--good)" }}>It's {guessPhoto.correctName}!</p>
              )}
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>Waiting for the host to start a round...</p>
          )}
        </div>
      )}

      {currentGame === "who-sent-this" && (
        <div className="card" style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
          <h2 style={{ marginTop: 0 }}>🕵️ Who Sent This?</h2>
          {whoSent?.imageUrl ? (
            <>
              <img src={whoSent.imageUrl} alt="Guess who sent this" style={{ maxWidth: "100%", maxHeight: 260, borderRadius: 12 }} />
              {!whoSent.revealed && !whoSentSubmitted && (
                <form onSubmit={handleWhoSentSubmit} style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <select value={whoSentGuess} onChange={(e) => setWhoSentGuess(e.target.value)} disabled={spectator} style={{ flex: 1 }}>
                    <option value="">Who sent it?</option>
                    {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button className="btn-primary" type="submit" disabled={spectator}>Submit</button>
                </form>
              )}
              {!whoSent.revealed && whoSentSubmitted && (
                <p style={{ color: "var(--good)", marginTop: 12 }}>Guess locked in - waiting for the reveal...</p>
              )}
              {whoSent.revealed && (
                <p style={{ marginTop: 12, fontWeight: 700, color: "var(--good)" }}>
                  Sent by {players.find((p) => p.id === whoSent.correctSenderId)?.name || "?"}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>Waiting for the host to post an image...</p>
          )}
        </div>
      )}
    </div>
  );
}
