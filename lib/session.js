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

export async function setSpellingWord(word, points) {
      await update(ref(db, "session/spellingBee"), {
              word,
              points: points || 1,
              currentPlayerId: null,
      });
}

export async function setSpellingTurn(playerId) {
      await update(ref(db, "session/spellingBee"), { currentPlayerId: playerId });
}

export async function setSpellingRound(round) {
      await update(ref(db, "session/spellingBee"), { round });
}

export async function markSpellingCorrect(playerId, points) {
      await addLeaderboardPoints(playerId, points || 1);
      await update(ref(db, "session/spellingBee"), { currentPlayerId: null, word: "", points: 0 });
}

export async function markSpellingIncorrect() {
      await update(ref(db, "session/spellingBee"), { currentPlayerId: null });
}

export async function resetSpellingBee() {
      await set(ref(db, "session/spellingBee"), { word: "", points: 0, currentPlayerId: null, round: 1 });
}

export function listenPartnerGame(callback) {
      return onValue(ref(db, "session/partnerGame"), (snap) => {
              callback(snap.val() || null);
      });
}

export async function addPartnerPair(playerAId, playerBId) {
      const pairId = "pair_" + Math.random().toString(36).slice(2, 10);
      await set(ref(db, `session/partnerGame/pairs/${pairId}`), { a: playerAId, b: playerBId });
}

export async function removePartnerPair(pairId) {
      await remove(ref(db, `session/partnerGame/pairs/${pairId}`));
}

export async function setPartnerQuestion(questionText) {
      await update(ref(db, "session/partnerGame"), {
              questionText,
              revealed: false,
              answers: {},
      });
}

export async function submitPartnerAnswer(playerId, ownAnswer, guessAnswer) {
      await set(ref(db, `session/partnerGame/answers/${playerId}`), {
              own: ownAnswer,
              guess: guessAnswer,
      });
}

export async function revealPartnerAnswers() {
      await update(ref(db, "session/partnerGame"), { revealed: true });
}

export async function awardPartnerMatch(playerAId, playerBId) {
      await addLeaderboardPoints(playerAId, 1);
      await addLeaderboardPoints(playerBId, 1);
}

export function listenTeamGame(callback) {
      return onValue(ref(db, "session/teamGame"), (snap) => {
              callback(snap.val() || null);
      });
}

export async function setPlayerTeam(playerId, team) {
      await set(ref(db, `session/teamGame/assignments/${playerId}`), team);
}

export async function setTeamName(team, name) {
      await update(ref(db, "session/teamGame"), { [`teamNames/${team}`]: name });
}

export async function setTeamPrompt(promptText) {
      await update(ref(db, "session/teamGame"), { prompt: promptText, revealed: false });
                       }

export async function revealTeamPrompt() {
      await update(ref(db, "session/teamGame"), { revealed: true });
}

export async function awardTeamPoints(team, amount) {
      await runTransaction(ref(db, `session/teamGame/scores/${team}`), (current) => {
              return (current || 0) + amount;
      });
}

export async function resetTeamScores() {
      await remove(ref(db, "session/teamGame/scores"));
}

export function listenGuessPhoto(callback) {
      return onValue(ref(db, "session/guessPhoto"), (snap) => {
              callback(snap.val() || null);
      });
}

export async function startGuessPhoto(avatarId, correctName) {
      await set(ref(db, "session/guessPhoto"), {
              avatarId,
              correctName,
              blurLevel: 24,
              revealed: false,
              answers: {},
      });
}

export async function setGuessPhotoBlur(blurLevel) {
      await update(ref(db, "session/guessPhoto"), { blurLevel });
}

export async function submitGuessPhotoAnswer(playerId, guessText) {
      await set(ref(db, `session/guessPhoto/answers/${playerId}`), guessText);
}

export async function revealGuessPhoto() {
      await update(ref(db, "session/guessPhoto"), { revealed: true, blurLevel: 0 });
}

export function listenWhoSent(callback) {
      return onValue(ref(db, "session/whoSent"), (snap) => {
              callback(snap.val() || null);
      });
}

export async function setWhoSentImage(imageUrl, correctSenderId) {
      await set(ref(db, "session/whoSent"), {
              imageUrl,
              correctSenderId,
              revealed: false,
              answers: {},
      });
}

export async function submitWhoSentGuess(playerId, guessedSenderId) {
      await set(ref(db, `session/whoSent/answers/${playerId}`), guessedSenderId);
}

export async function revealWhoSent() {
      const snap = await get(ref(db, "session/whoSent"));
      const data = snap.val();
      if (!data) return;
      const answers = data.answers || {};
      const correctIds = Object.entries(answers)
        .filter(([, guess]) => guess === data.correctSenderId)
        .map(([id]) => id);
      await Promise.all(correctIds.map((id) => addLeaderboardPoints(id, 1)));
      await update(ref(db, "session/whoSent"), { revealed: true });
}

export function listenKnowHost(callback) {
      return onValue(ref(db, "session/knowHost"), (snap) => {
              callback(snap.val() || null);
      });
}

export async function setKnowHostQuestion({ questionText, correctAnswer }) {
      await set(ref(db, "session/knowHost"), {
              questionText,
              correctAnswer: correctAnswer || "",
              answersOpen: false,
              revealed: false,
              answers: {},
      });
}

export async function setKnowHostAnswersOpen(open) {
      await update(ref(db, "session/knowHost"), { answersOpen: open });
}

export async function submitKnowHostAnswer(playerId, answerText) {
      await set(ref(db, `session/knowHost/answers/${playerId}`), answerText);
}

export async function revealKnowHost() {
      await update(ref(db, "session/knowHost"), { revealed: true, answersOpen: false });
}

export async function awardKnowHostPoint(playerId) {
      await addLeaderboardPoints(playerId, 1);
}

export async function clearKnowHostAnswers() {
      await remove(ref(db, "session/knowHost/answers"));
      await update(ref(db, "session/knowHost"), { revealed: false, answersOpen: false });
}
