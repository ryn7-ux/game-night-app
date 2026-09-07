"use client";
import { useEffect, useState, useRef } from "react";
import {
  listenCasino,
  listenPlayers,
  listenLeaderboard,
  endGameNight,
  setCasinoStatus,
  setCasinoResult,
  addLeaderboardPoints,
  resetCasino,
} from "../lib/session";

const CHIP_MULTIPLIER = 100;
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

function numberColor(n) {
  if (n === 0) return "green";
  return RED_NUMBERS.has(n) ? "red" : "black";
}

function evaluateBet(bet, winningNumber, color) {
  const { type, number } = bet;
  if (type === "number") return number === winningNumber ? 36 : 0;
  if (color === "green") return 0;
  switch (type) {
    case "red":
      return color === "red" ? 2 : 0;
    case "black":
      return color === "black" ? 2 : 0;
    case "odd":
      return winningNumber % 2 === 1 ? 2 : 0;
    case "even":
      return winningNumber !== 0 && winningNumber % 2 === 0 ? 2 : 0;
    case "low":
      return winningNumber >= 1 && winningNumber <= 18 ? 2 : 0;
    case "high":
      return winningNumber >= 19 && winningNumber <= 36 ? 2 : 0;
    case "dozen1":
      return winningNumber >= 1 && winningNumber <= 12 ? 3 : 0;
    case "dozen2":
      return winningNumber >= 13 && winningNumber <= 24 ? 3 : 0;
    case "dozen3":
      return winningNumber >= 25 && winningNumber <= 36 ? 3 : 0;
    case "col1":
      return winningNumber > 0 && winningNumber % 3 === 1 ? 3 : 0;
    case "col2":
      return winningNumber > 0 && winningNumber % 3 === 2 ? 3 : 0;
    case "col3":
      return winningNumber > 0 && winningNumber % 3 === 0 ? 3 : 0;
    default:
      return 0;
  }
}

export default function CasinoHost() {
  const [casino, setCasino] = useState({ status: "idle" });
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState({});
  const [text1, setText1] = useState("Wait a minute... isn't this whole night a little unfair?");
  const [text2, setText2] = useState("The night is still young...");
  const timerRef = useRef(null);

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
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (casino.status === "cutscene1") {
      timerRef.current = setTimeout(() => setCasinoStatus("cutscene2"), 3000);
    } else if (casino.status === "cutscene2") {
      timerRef.current = setTimeout(() => setCasinoStatus("cutscene3"), 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [casino.status]);

  async function handleSpin() {
    const winningNumber = Math.floor(Math.random() * 37);
    const color = numberColor(winningNumber);
    await setCasinoStatus("spinning", { winningNumber, color });
  }

  async function handleReveal() {
    const bets = casino.bets || {};
    const wn = casino.winningNumber;
    const col = casino.color;
    for (const [playerId, bet] of Object.entries(bets)) {
      const mult = evaluateBet(bet, wn, col);
      const totalChips = bet.amountChips * mult;
      const netChips = totalChips - bet.amountChips;
      const netRealPoints = Math.round(netChips / CHIP_MULTIPLIER);
      if (netRealPoints !== 0) {
        await addLeaderboardPoints(playerId, netRealPoints);
      }
      await setCasinoResult(playerId, { multiplier: mult, totalChips, netRealPoints });
    }
    await setCasinoStatus("resolved", {});
  }

  const nameOf = (id) => players.find((p) => p.id === id)?.name || "?";
  const status = casino.status || "idle";

  return (
    <div className="card" style={{ marginBottom: 20, border: "2px solid #ffd54a" }}>
      <p className="card-label">TL Casino (Finale)</p>

      {status === "idle" && (
        <button className="btn-primary" onClick={() => endGameNight()}>
          End Game
        </button>
      )}

      {status === "leaderboard" && (
        <>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
            Players are looking at the leaderboard. Customize the cutscene lines if you want, then start the transition.
          </p>
          <input
            type="text"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            type="text"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <button className="btn-primary" onClick={() => setCasinoStatus("cutscene1", { text1, text2 })}>
            Start Transition
          </button>
        </>
      )}

      {(status === "cutscene1" || status === "cutscene2") && (
        <>
          <p style={{ marginBottom: 8 }}>Playing: "{status === "cutscene1" ? casino.text1 : casino.text2}"</p>
          <button
            className="btn-secondary"
            onClick={() => setCasinoStatus(status === "cutscene1" ? "cutscene2" : "cutscene3")}
          >
            Skip Ahead
          </button>
        </>
      )}

      {status === "cutscene3" && (
        <>
          <p style={{ marginBottom: 8 }}>Playing the "Welcome to TL Casino" reveal...</p>
          <button className="btn-primary" onClick={() => setCasinoStatus("open", { bets: null, results: null, winningNumber: null, color: null })}>
            Begin / Open Casino
          </button>
        </>
      )}

      {status === "open" && (
        <>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Bets placed so far:</p>
          {Object.entries(casino.bets || {}).length === 0 && <p style={{ color: "var(--muted)" }}>Waiting for bets...</p>}
          {Object.entries(casino.bets || {}).map(([playerId, bet]) => (
            <p key={playerId} style={{ margin: "4px 0" }}>
              {nameOf(playerId)}: {bet.amountChips} chips on {bet.type === "number" ? `number ${bet.number}` : bet.type}
            </p>
          ))}
          <button className="btn-primary" style={{ marginTop: 10 }} onClick={() => setCasinoStatus("closed")}>
            Close Betting
          </button>
        </>
      )}

      {status === "closed" && (
        <>
          <p style={{ marginBottom: 8 }}>Betting closed. {Object.keys(casino.bets || {}).length} bet(s) locked in.</p>
          <button className="btn-primary" onClick={handleSpin}>
            Spin the Wheel
          </button>
        </>
      )}

      {status === "spinning" && (
        <>
          <p style={{ marginBottom: 8 }}>
            Result: {casino.winningNumber} ({casino.color})
          </p>
          <button className="btn-primary" onClick={handleReveal}>
            Reveal Results
          </button>
        </>
      )}

      {status === "resolved" && (
        <>
          <p style={{ marginBottom: 8, fontWeight: 700 }}>
            Winning number: {casino.winningNumber} ({casino.color})
          </p>
          {Object.entries(casino.results || {}).map(([playerId, r]) => (
            <p key={playerId} style={{ margin: "4px 0" }}>
              {nameOf(playerId)}: {r.netRealPoints >= 0 ? `+${r.netRealPoints}` : r.netRealPoints} pts
            </p>
          ))}
          <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => resetCasino()}>
            Close Casino
          </button>
        </>
      )}
    </div>
  );
}
