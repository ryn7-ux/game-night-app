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
  listenSpellingBee,
  listenPlayers,
  listenKnowHost,
  submitKnowHostAnswer,
  listenPartnerGame,
  submitPartnerAnswer,
  listenTeamGame,
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

  const [knowHost, setKnowHost] = useState(null);
  const [knowHostAnswer, setKnowHostAnswer] = useState("");
  const [knowHostOrder, setKnowHostOrder] = useState([]);
  const [knowHostSubmitted, setKnowHostSubmitted] = useState(false);

  const [partnerGame, setPartnerGame] = useState(null);
  const [partnerOwnAnswer, setPartnerOwnAnswer] = useState("");
  const [partnerGuessAnswer, setPartnerGuessAnswer] = useState("");
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  const [teamGame, setTeamGame] = useState(null);

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
          <h2 style={{ marginTop: 0 }}>🗺️ Guess the Real Place</h2>
          <p style={{ color: "var(--muted)" }}>
            You're on {myTeam ? `Team ${myTeam}` : "no team yet"}.
          </p>
          {teamGame?.prompt && teamGame?.revealed ? (
            <p style={{ fontSize: 18, fontWeight: 600 }}>{teamGame.prompt}</p>
          ) : (
            <p style={{ color: "var(--muted)" }}>Waiting for the host to reveal the next clue...</p>
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
