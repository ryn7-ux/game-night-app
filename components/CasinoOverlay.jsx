"use client";
import { useEffect, useState, useRef } from "react";
import {
  getPlayerId,
  listenCasino,
  listenPlayers,
  listenLeaderboard,
  placeCasinoBet,
} from "../lib/session";

const CHIP_MULTIPLIER = 100;
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

const SOUND_JACKPOT = "https://assets.mixkit.co/active_storage/sfx/1991/1991-preview.mp3";
const SOUND_WHEEL = "https://assets.mixkit.co/active_storage/sfx/1932/1932-preview.mp3";
const SOUND_WIN = "https://assets.mixkit.co/active_storage/sfx/1928/1928-preview.mp3";

function playSound(url, volume) {
  try {
    const a = new Audio(url);
    a.volume = volume == null ? 0.6 : volume;
    a.play().catch(() => {});
  } catch (e) {}
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "linear-gradient(160deg, #0b0f1a, #1a0e05)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  textAlign: "center",
  overflowY: "auto",
};

export default function CasinoOverlay() {
  const [casino, setCasino] = useState({ status: "idle" });
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState({});
  const [betType, setBetType] = useState("red");
  const [betNumber, setBetNumber] = useState(0);
  const [betAmount, setBetAmount] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const myId = getPlayerId();
  const spunFor = useRef(null);
  const playedSoundFor = useRef(null);

  useEffect(() => {
    const u1 = listenCasino(setCasino);
    const u2 = listenPlayers(setPlayers);
    const u3 = listenLeaderboard(setLeaderboard);
    return () => {
      u1 && u1();
      u2 && u2();
      u3 && u3();
    };
  }, []);

  useEffect(() => {
    if (casino.status === "spinning" && casino.winningNumber != null && spunFor.current !== casino.winningNumber) {
      spunFor.current = casino.winningNumber;
      const idx = WHEEL_ORDER.indexOf(casino.winningNumber);
      const segAngle = 360 / WHEEL_ORDER.length;
      const targetAngle = 360 * 6 + (360 - idx * segAngle);
      setWheelRotation(targetAngle);
    }
    if (casino.status !== "spinning" && casino.status !== "resolved") {
      spunFor.current = null;
      setWheelRotation(0);
    }
  }, [casino.status, casino.winningNumber]);

  useEffect(() => {
    if (playedSoundFor.current === casino.status) return;
    if (casino.status === "cutscene3") {
      playedSoundFor.current = casino.status;
      playSound(SOUND_JACKPOT, 0.7);
    } else if (casino.status === "spinning") {
      playedSoundFor.current = casino.status;
      playSound(SOUND_WHEEL, 0.6);
    } else if (casino.status === "resolved") {
      playedSoundFor.current = casino.status;
      const myId2 = getPlayerId();
      const myResult = casino.results && casino.results[myId2];
      if (myResult && myResult.netRealPoints > 0) playSound(SOUND_WIN, 0.7);
    }
  }, [casino.status]);

  if (!casino.status || casino.status === "idle") return null;

  const myScore = leaderboard[myId] || 0;
  const myChips = myScore * CHIP_MULTIPLIER;
  const myBet = casino.bets && casino.bets[myId];
  const myResult = casino.results && casino.results[myId];

  if (casino.status === "leaderboard") {
    const rows = players
      .map((p) => ({ ...p, score: leaderboard[p.id] || 0 }))
      .sort((a, b) => b.score - a.score);
    return (
      <div style={overlayStyle}>
        <h2 style={{ marginBottom: 16 }}>Leaderboard</h2>
        {rows.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              gap: 12,
              width: 260,
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #333",
            }}
          >
            <span>{i + 1}. {p.name}</span>
            <span>{p.score}</span>
          </div>
        ))}
        <p style={{ marginTop: 20, opacity: 0.7, fontSize: 13 }}>Waiting on the host...</p>
      </div>
    );
  }

  if (casino.status === "cutscene1") {
    return (
      <div style={overlayStyle}>
        <h2>{casino.text1 || "Wait a minute... isn't this whole night a little unfair?"}</h2>
      </div>
    );
  }

  if (casino.status === "cutscene2") {
    return (
      <div style={overlayStyle}>
        <h2>{casino.text2 || "The night is still young..."}</h2>
      </div>
    );
  }

  if (casino.status === "cutscene3") {
    return (
      <div style={overlayStyle}>
        <h1 style={{ fontSize: 40, color: "#ffd54a", textShadow: "0 0 20px rgba(255,213,74,0.6)" }}>
          Welcome to TL Casino
        </h1>
      </div>
    );
  }

  if (casino.status === "open") {
    return (
      <div style={overlayStyle}>
        <h2 style={{ marginBottom: 4 }}>TL Casino</h2>
        <p style={{ opacity: 0.8, marginBottom: 16 }}>Your stack: {myChips} chips ({myScore} pts)</p>
        {myBet ? (
          <div className="card" style={{ background: "#1e1e1e", maxWidth: 320 }}>
            <p>Bet locked in: {myBet.amountChips} chips on {myBet.type === "number" ? `number ${myBet.number}` : myBet.type}</p>
            <p style={{ opacity: 0.7, fontSize: 12 }}>Waiting for the table to close...</p>
          </div>
        ) : (
          <div className="card" style={{ background: "#1e1e1e", maxWidth: 340, width: "100%" }}>
            <select value={betType} onChange={(e) => setBetType(e.target.value)} style={{ width: "100%", marginBottom: 8 }}>
              <option value="red">Red (1:1)</option>
              <option value="black">Black (1:1)</option>
              <option value="odd">Odd (1:1)</option>
              <option value="even">Even (1:1)</option>
              <option value="low">1-18 (1:1)</option>
              <option value="high">19-36 (1:1)</option>
              <option value="dozen1">1st Dozen (2:1)</option>
              <option value="dozen2">2nd Dozen (2:1)</option>
              <option value="dozen3">3rd Dozen (2:1)</option>
              <option value="col1">Column 1 (2:1)</option>
              <option value="col2">Column 2 (2:1)</option>
              <option value="col3">Column 3 (2:1)</option>
              <option value="number">Single Number (35:1)</option>
            </select>
            {betType === "number" && (
              <input
                type="number"
                min={0}
                max={36}
                value={betNumber}
                onChange={(e) => setBetNumber(Math.max(0, Math.min(36, Number(e.target.value))))}
                placeholder="Pick 0-36"
                style={{ width: "100%", marginBottom: 8 }}
              />
            )}
            <input
              type="number"
              min={1}
              max={myChips}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              placeholder="Chips to bet"
              style={{ width: "100%", marginBottom: 8 }}
            />
            <button
              className="btn-primary"
              disabled={betAmount <= 0 || betAmount > myChips}
              onClick={() =>
                placeCasinoBet(myId, {
                  type: betType,
                  number: betType === "number" ? betNumber : null,
                  amountChips: betAmount,
                })
              }
            >
              Lock In Bet
            </button>
          </div>
        )}
      </div>
    );
  }

  if (casino.status === "closed" || casino.status === "spinning") {
    return (
      <div style={overlayStyle}>
        <h2 style={{ marginBottom: 20 }}>{casino.status === "spinning" ? "Spinning..." : "Betting closed"}</h2>
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: "6px solid #ffd54a",
            position: "relative",
            transition: "transform 4s cubic-bezier(0.2,0.8,0.2,1)",
            transform: `rotate(${wheelRotation}deg)`,
            background:
              "repeating-conic-gradient(#8a1c1c 0deg 9.73deg, #111 9.73deg 19.46deg)",
          }}
        />
        <div style={{ marginTop: -14, fontSize: 24 }}>&#9660;</div>
        {myBet && (
          <p style={{ marginTop: 20 }}>
            Your bet: {myBet.amountChips} chips on {myBet.type === "number" ? `number ${myBet.number}` : myBet.type}
          </p>
        )}
      </div>
    );
  }

  if (casino.status === "resolved") {
    return (
      <div style={overlayStyle}>
        <h2>
          Winning number: {casino.winningNumber} ({casino.color})
        </h2>
        {myResult ? (
          <p
            style={{
              fontSize: 20,
              marginTop: 12,
              color: myResult.netRealPoints >= 0 ? "#4caf50" : "#e05555",
            }}
          >
            {myResult.netRealPoints >= 0 ? `+${myResult.netRealPoints}` : myResult.netRealPoints} points
          </p>
        ) : myBet ? (
          <p style={{ marginTop: 12 }}>Calculating...</p>
        ) : (
          <p style={{ marginTop: 12, opacity: 0.7 }}>You sat this one out.</p>
        )}
        <p style={{ marginTop: 30, opacity: 0.7, fontSize: 13 }}>Waiting on the host...</p>
      </div>
    );
  }

  return null;
}
