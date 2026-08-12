// All the realtime read/write helpers for the shared game session.
import { db } from "./firebase";
import {
    ref,
    set,
    update,
    onValue,
    get,
    runTransaction,
    remove,
} from "firebase/database";

export function getPlayerId() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("gamenight_playerId");
}

export function getOrCreatePlayerId() {
    if (typeof window === "undefined") return null;
    let id = localStorage.getItem("gamenight_playerId");
    if (!id) {
          id = "p_" + Math.random().toString(36).slice(2, 10);
          localStorage.setItem("gamenight_playerId", id);
    }
    return id;
}

export async function joinAsPlayer(name, avatarId) {
    const id = getOrCreatePlayerId();
    await set(ref(db, `session/players/${id}`), {
          name,
          avatarId: avatarId || null,
          joinedAt: Date.now(),
    });
    const lbSnap = await get(ref(db, `session/leaderboard/${id}`));
    if (!lbSnap.exists()) {
          await set(ref(db, `session/leaderboard/${id}`), 0);
    }
    return id;
}

export function listenPlayers(callback) {
    return onValue(ref(db, "session/players"), (snap) => {
          const val = snap.val() || {};
          callback(
                  Object.entries(val).map(([id, data]) => ({ id, ...data }))
                );
    });
}

export function listenLeaderboard(callback) {
    return onValue(ref(db, "session/leaderboard"), (snap) => {
          const val = snap.val() || {};
          callback(val);
    });
}

export async function addLeaderboardPoints(playerId, amount) {
    await runTransaction(ref(db, `session/leaderboard/${playerId}`), (current) => {
          return (current || 0) + amount;
    });
}

export function listenRound1(callback) {
    return onValue(ref(db, "session/round1"), (snap) => {
          callback(snap.val() || null);
    });
}

export async function setRound1Question({ questionText, questionType, correctAnswer }) {
    await set(ref(db, "session/round1"), {
          questionText,
          questionType,
          correctAnswer: correctAnswer || "",
          answersOpen: false,
          revealed: false,
          answers: {},
          scores: (await get(ref(db, "session/round1/scores"))).val() || {},
    });
}

export async function setAnswersOpen(open) {
    await update(ref(db, "session/round1"), { answersOpen: open });
}

export async function submitRound1Answer(playerId, answerText) {
    await set(ref(db, `session/round1/answers/${playerId}`), answerText);
}

export async function revealRound1() {
    await update(ref(db, "session/round1"), { revealed: true, answersOpen: false });
}

export async function awardRound1Points(playerId, amount) {
    await runTransaction(ref(db, `session/round1/scores/${playerId}`), (current) => {
          return (current || 0) + amount;
    });
}

export async function clearRound1Answers() {
    await remove(ref(db, "session/round1/answers"));
    await update(ref(db, "session/round1"), { revealed: false, answersOpen: false });
}

export async function resetRound1Scores() {
    await remove(ref(db, "session/round1/scores"));
}

export async function removePlayer(playerId) {
    await remove(ref(db, `session/players/${playerId}`));
    await remove(ref(db, `session/leaderboard/${playerId}`));
    await remove(ref(db, `session/round1/scores/${playerId}`));
    await remove(ref(db, `session/round1/answers/${playerId}`));
      }

export function listenSelfPlayer(playerId, callback) {
    return onValue(ref(db, `session/players/${playerId}`), (snap) => {
          callback(snap.exists());
    });
}
export function listenCurrentGame(callback) {
        return onValue(ref(db, "session/currentGame"), (snap) => {
                    callback(snap.val() || null);
        });
}

export async function setCurrentGame(gameId) {
        await set(ref(db, "session/currentGame"), gameId);
}

export function listenSpellingBee(callback) {
        return onValue(ref(db, "session/spellingBee"), (snap) => {
                    callback(snap.val() || null);
        });
}

export async function setSpellingWord(word) {
        await update(ref(db, "session/spellingBee"), {
                    word,
                    currentPlayerId: null,
        });
}

export async function setSpellingTurn(playerId) {
        await update(ref(db, "session/spellingBee"), { currentPlayerId: playerId });
}

export async function markSpellingCorrect(playerId) {
        await addLeaderboardPoints(playerId, 1);
        await update(ref(db, "session/spellingBee"), { currentPlayerId: null, word: "" });
}

export async function markSpellingIncorrect() {
        await update(ref(db, "session/spellingBee"), { currentPlayerId: null });
}

export async function resetSpellingBee() {
        await set(ref(db, "session/spellingBee"), { word: "", currentPlayerId: null });
}
