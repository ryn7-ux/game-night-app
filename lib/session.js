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

export function listenLeaderboardVisible(callback) {
  return onValue(ref(db, "session/leaderboardVisible"), (snap) => {
    callback(!!snap.val());
  });
}

export async function setLeaderboardVisible(visible) {
  await set(ref(db, "session/leaderboardVisible"), !!visible);
}

export function listenRoundScoresVisible(callback) {
  return onValue(ref(db, "session/roundScoresVisible"), (snap) => {
    callback(!!snap.val());
  });
}

export async function setRoundScoresVisible(visible) {
  await set(ref(db, "session/roundScoresVisible"), !!visible);
}

export async function addLeaderboardPoints(playerId, amount) {
  await runTransaction(ref(db, `session/leaderboard/${playerId}`), (current) => {
    return (current || 0) + amount;
  });
}

// Per-game in-round score, kept separate from the leaderboard until finalized.
export async function addGameScore(node, playerId, amount) {
  await runTransaction(ref(db, `session/${node}/scores/${playerId}`), (current) => {
    return (current || 0) + amount;
  });
}

export async function resetGameScore(node) {
  await remove(ref(db, `session/${node}/scores`));
}

// tiers: array of arrays of playerIds, best tier first, players within a tier tie.
// Awards a fixed number of points per tier that scales with total player count
// (top tier gets N points, next gets N-1, etc.), added into that game's leaderboard column.
export async function finalizeGameScores(gameId, tiers) {
  const totalPlayers = tiers.reduce((sum, t) => sum + t.length, 0);
  let pointsForTier = totalPlayers;
  const writes = [];
  for (const tier of tiers) {
    for (const playerId of tier) {
      writes.push(
        runTransaction(ref(db, `session/leaderboard/${playerId}/${gameId}`), (current) => {
          return (current || 0) + pointsForTier;
        })
      );
    }
    pointsForTier -= tier.length;
  }
  await Promise.all(writes);
}

export function listenRound1(callback) {
  return onValue(ref(db, "session/round1"), (snap) => {
    callback(snap.val() || null);
  });
}

export async function setRound1Question({ questionText, questionType, correctAnswer, options }) {
  await set(ref(db, "session/round1"), {
    questionText,
    questionType,
    correctAnswer: correctAnswer || "",
    options: options || null,
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

export async function removePlayer(playerId, wipeLeaderboard) {
  await remove(ref(db, `session/players/${playerId}`));
  await remove(ref(db, `session/round1/scores/${playerId}`));
  await remove(ref(db, `session/round1/answers/${playerId}`));
  if (wipeLeaderboard) {
    await remove(ref(db, `session/leaderboard/${playerId}`));
  }
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
    revealed: false,
  });
}

export async function setSpellingTurn(playerId) {
  await update(ref(db, "session/spellingBee"), { currentPlayerId: playerId });
}

export async function setSpellingRound(round) {
  await update(ref(db, "session/spellingBee"), { round });
}

export async function markSpellingCorrect(playerId, points) {
  await addGameScore("spellingBee", playerId, points || 1);
  await update(ref(db, "session/spellingBee"), { currentPlayerId: null });
}

export async function markSpellingIncorrect() {
  await update(ref(db, "session/spellingBee"), { currentPlayerId: null });
}

export async function revealSpellingWord() {
  await update(ref(db, "session/spellingBee"), { revealed: true });
}

export async function resetSpellingBee() {
  await set(ref(db, "session/spellingBee"), { word: "", points: 0, currentPlayerId: null, round: 1, revealed: false });
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
    revealStep: -1,
    answers: {},
  });
}

export async function submitPartnerAnswer(playerId, ownAnswer, guessAnswer) {
  await set(ref(db, `session/partnerGame/answers/${playerId}`), {
    own: ownAnswer,
    guess: guessAnswer,
  });
}

export async function startPartnerReveal() {
  await update(ref(db, "session/partnerGame"), { revealStep: 0 });
}

export async function advancePartnerReveal() {
  const snap = await get(ref(db, "session/partnerGame/revealStep"));
  const cur = typeof snap.val() === "number" ? snap.val() : -1;
  await update(ref(db, "session/partnerGame"), { revealStep: cur + 1 });
}

export async function awardPartnerMatch(playerId) {
  await addGameScore("partnerGame", playerId, 1);
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

export async function setTeamCaptain(team, playerId) {
  await update(ref(db, "session/teamGame"), { [`captains/${team}`]: playerId });
}

// options: array of { text, isReal } - full 20-item bank for this round.
// currentTurn tracks whose team is picking next; results maps item index -> team that claimed it.
export async function pushRealOrFakeRound(category, options) {
  await update(ref(db, "session/teamGame"), {
    round: { category, options, results: {}, currentTurn: "A" },
  });
}

// Host clicks an item on behalf of whichever team is currently picking.
// Awards a point immediately if it's real, then passes the turn to the other team.
export async function claimRealOrFakeItem(index, team) {
  const snap = await get(ref(db, "session/teamGame/round"));
  const round = snap.val();
  if (!round || !round.options || round.options[index] === undefined) return;
  if (round.results && round.results[index] !== undefined) return;
  const isReal = !!round.options[index].isReal;
  const nextTurn = team === "A" ? "B" : "A";
  await update(ref(db, "session/teamGame/round"), {
    [`results/${index}`]: team,
    currentTurn: nextTurn,
  });
  if (isReal) {
    await awardTeamPoints(team, 1);
  }
}

export async function setCurrentTurn(team) {
  await update(ref(db, "session/teamGame/round"), { currentTurn: team });
}

export async function clearRealOrFakeRound() {
  await remove(ref(db, "session/teamGame/round"));
}

export async function openCaptainOrdering() {
  await update(ref(db, "session/teamGame"), { orderingOpen: true });
}

export async function setCaptainOrder(team, orderedPlayerIds) {
  await update(ref(db, "session/teamGame"), { [`captainOrder/${team}`]: orderedPlayerIds });
}

export async function resetRealOrFakeGame() {
  await remove(ref(db, "session/teamGame/scores"));
  await remove(ref(db, "session/teamGame/round"));
  await remove(ref(db, "session/teamGame/captainOrder"));
  await update(ref(db, "session/teamGame"), { orderingOpen: false });
}

export function listenGuessPhoto(callback) {
  return onValue(ref(db, "session/guessPhoto"), (snap) => {
    callback(snap.val() || null);
  });
}

export async function startGuessPhoto(avatarId, correctName) {
  await update(ref(db, "session/guessPhoto"), {
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
  await update(ref(db, "session/whoSent"), {
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
  await Promise.all(correctIds.map((id) => addGameScore("whoSent", id, 1)));
  await update(ref(db, "session/whoSent"), { revealed: true });
}

export function listenKnowHost(callback) {
  return onValue(ref(db, "session/knowHost"), (snap) => {
    callback(snap.val() || null);
  });
}

export async function setKnowHostQuestion(question) {
  await update(ref(db, "session/knowHost"), {
    ...question,
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

export async function awardKnowHostPoint(playerId, points) {
  await addGameScore("knowHost", playerId, points || 1);
}

export async function clearKnowHostAnswers() {
  await remove(ref(db, "session/knowHost/answers"));
  await update(ref(db, "session/knowHost"), { revealed: false, answersOpen: false });
}

// One-shot hidden "side quest" claim - first correct guess wins the points,
// guarded by a per-player flag so it can't be claimed twice.
export async function tryClaimKnowHostEasterEgg(playerId, points) {
  const flagRef = ref(db, `session/knowHost/easterEggClaims/${playerId}`);
  const snap = await get(flagRef);
  if (snap.exists()) return false;
  await set(flagRef, true);
  await addGameScore("knowHost", playerId, points || 3);
  return true;
}

// Archive / new-game-night helpers.
// An archive is a full snapshot of the live "session" node, saved under archives/{id}.
export function listenArchives(callback) {
  return onValue(ref(db, "archives"), (snap) => {
    const val = snap.val() || {};
    const list = Object.entries(val)
      .map(([id, data]) => ({ id, label: data.label, archivedAt: data.archivedAt }))
      .sort((a, b) => (b.archivedAt || 0) - (a.archivedAt || 0));
    callback(list);
  });
}

export async function archiveCurrentSession(label) {
  const snap = await get(ref(db, "session"));
  const data = snap.val();
  if (!data) return null;
  const id = "archive_" + Date.now();
  await set(ref(db, `archives/${id}`), {
    ...data,
    archivedAt: Date.now(),
    label: label || new Date().toLocaleString(),
  });
  return id;
}

export async function startNewGame() {
  await archiveCurrentSession();
  await remove(ref(db, "session"));
}

export async function loadArchivedSession(archiveId) {
  const snap = await get(ref(db, `archives/${archiveId}`));
  const data = snap.val();
  if (!data) return;
  await archiveCurrentSession("Auto-backup before restore");
  const { archivedAt, label, ...sessionData } = data;
  await set(ref(db, "session"), sessionData);
}
