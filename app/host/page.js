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
  listenLeaderboardVisible,
  setLeaderboardVisible,
  listenRoundScoresVisible,
  setRoundScoresVisible,
  addGameScore,
  resetGameScore,
  finalizeGameScores,
  clearRound1Answers,
  resetRound1Scores,
  removePlayer,
  listenCurrentGame,
  setCurrentGame,
  listenSpellingBee,
  setSpellingWord,
  setSpellingTurn,
  setSpellingRound,
  markSpellingCorrect,
  markSpellingIncorrect,
  revealSpellingWord,
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
  setTeamCaptain,
  pushRealOrFakeRound,
  claimRealOrFakeItem,
  setCurrentTurn,
  clearRealOrFakeRound,
  openCaptainOrdering,
  resetRealOrFakeGame,
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
        name: "Real or Fake?",
    icon: "🔍",
    tagline: "Team battle - spot the real 10 of 20",
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

const KNOW_HOST_QUESTIONS = [
  {
    id: "birthday",
    type: "text",
    prompt: "What's my birthday?",
    answer: "February 9, 2002",
  },
  {
    id: "lockscreen",
    type: "text",
    prompt: "Who's on my lock screen?",
    answer: "Lando Norris or Ronaldo",
  },
    {
    id: "malayalam-movies-tier",
    type: "tier",
    prompt: "Sort these Malayalam movies into my tiers:",
    tiers: [
      { id: "S", label: "S Tier", capacity: 1 },
      { id: "good", label: "Good", capacity: 3 },
      { id: "enjoyed", label: "Enjoyed", capacity: 3 },
      { id: "meh", label: "Meh", capacity: 3 },
      { id: "stop", label: "Please Stop", capacity: 2 },
    ],
    items: [
      "Memories",
      "Trance",
      "Mollywood Times",
      "Anjaam Pathira",
      "Khalifa",
      "Premam",
      "Mukundan Unni Associates",
      "Vaazha 2",
      "Padakkalam",
      "King Liar",
      "Neerali",
      "Hridayam",
    ],
    answerTiers: {
      Memories: "S",
      Trance: "good",
      "Mollywood Times": "good",
      "Anjaam Pathira": "good",
      Khalifa: "enjoyed",
      Premam: "enjoyed",
      "Mukundan Unni Associates": "enjoyed",
      "Vaazha 2": "meh",
      Padakkalam: "meh",
      "King Liar": "meh",
      Neerali: "stop",
      Hridayam: "stop",
    },
    maxPoints: 12,
    easterEgg: {
      prompt: "Best movie ever watched with the boys?",
      answer: "sharknado",
      points: 3,
    },
  },
  {
    id: "athlete",
    type: "text",
    prompt: "What's my favorite athlete/sportsperson?",
    answer: "Cristiano Ronaldo",
  },
  {
    id: "sports-pick-rank",
    type: "pick-rank",
    prompt: "Out of these sports, pick my top 5 favorites and rank them in order:",
    pool: [
      "Football",
      "F1",
      "Tennis",
      "Basketball",
      "Volleyball",
      "Golf",
      "Cricket",
      "Padel",
      "Table Tennis",
      "Baseball",
      "Badminton",
    ],
    pickCount: 5,
    answerOrder: ["Football", "F1", "Tennis", "Volleyball", "Golf"],
    maxPoints: 10,
  },
  {
    id: "not-true",
    type: "mcq",
    prompt: "Which of the following is NOT true about me?",
    options: [
      "I have a medal in 800m track",
      "I have received an honour roll in school",
      "I have acted in a play",
      "I attended a session of therapy",
    ],
    correctIndex: 3,
    maxPoints: 1,
  },
  {
    id: "leaders-rank",
    type: "rank",
    prompt: "Rank these leaders from most to least interesting to me:",
    items: [
      "Adolf Hitler",
      "Kim Jong Un",
      "Donald Trump",
      "Genghis Khan",
      "Pinarayi Vijayan",
      "Narendra Modi",
    ],
    answerOrder: [
      "Adolf Hitler",
      "Kim Jong Un",
      "Donald Trump",
      "Genghis Khan",
      "Pinarayi Vijayan",
      "Narendra Modi",
    ],
    maxPoints: 6,
  },
  {
    id: "chocolate-rank",
    type: "rank",
    prompt: "Rank these chocolate bars from my favorite to least favorite:",
    items: [
      "Snickers",
      "Bounty",
      "Galaxy Smooth Milk",
      "Dairy Milk",
      "Flake",
    ],
    answerOrder: [
      "Snickers",
      "Galaxy Smooth Milk",
      "Flake",
      "Bounty",
      "Dairy Milk",
    ],
    maxPoints: 5,
  },
  {
    id: "first-car-age",
    type: "text",
    prompt: "At what age did I drive my first car?",
    answer: "14",
  },
  {
    id: "youtube-artists",
    type: "guess-list",
    prompt: "Name my top 5 favorite artists on YouTube Music. Send as many guesses as you want (up to 5) - order matters for bonus points!",
    maxGuesses: 5,
    answerOrder: ["Bruno Mars", "Drake", "OneRepublic", "Charlie Puth", "KSI"],
    maxPoints: 10,
  },
];

function normalizeGuess(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Each category: 10 real items + 10 made-up items for the "Real or Fake?" team battle.
const REAL_OR_FAKE_BANK = {
  "Places": [
    { text: "Truth or Consequences, New Mexico", isReal: true },
    { text: "Hell, Michigan", isReal: true },
    { text: "Boring, Oregon", isReal: true },
    { text: "Intercourse, Pennsylvania", isReal: true },
    { text: "Weiner, Arkansas", isReal: true },
    { text: "Rough and Ready, California", isReal: true },
    { text: "Toad Suck, Arkansas", isReal: true },
    { text: "Chicken, Alaska", isReal: true },
    { text: "Climax, Michigan", isReal: true },
    { text: "Accident, Maryland", isReal: true },
    { text: "Mudbucket, Idaho", isReal: false },
    { text: "Snoreville, Vermont", isReal: false },
    { text: "Lower Wigglesworth, England", isReal: false },
    { text: "Duckpond Hollow, Kentucky", isReal: false },
    { text: "New Boredom, Ohio", isReal: false },
    { text: "Wobblestone, Wales", isReal: false },
    { text: "Half Mustache, Montana", isReal: false },
    { text: "Sockington, Maine", isReal: false },
    { text: "Grumbleshire, England", isReal: false },
    { text: "Left Sandwich, Nevada", isReal: false },
  ],
  "Food": [
    { text: "Century egg", isReal: true },
    { text: "Casu marzu (maggot cheese)", isReal: true },
    { text: "Surstromming (fermented herring)", isReal: true },
    { text: "Haggis", isReal: true },
    { text: "Balut", isReal: true },
    { text: "Vegemite", isReal: true },
    { text: "Natto", isReal: true },
    { text: "Hakarl (fermented shark)", isReal: true },
    { text: "Rocky Mountain oysters", isReal: true },
    { text: "Escamoles (ant larvae)", isReal: true },
    { text: "Blorpfruit", isReal: false },
    { text: "Smoked cloud jelly", isReal: false },
    { text: "Wobblecheese", isReal: false },
    { text: "Pickled moonbeans", isReal: false },
    { text: "Crunchy fog crisps", isReal: false },
    { text: "Butterscotch eel jerky", isReal: false },
    { text: "Static bread", isReal: false },
    { text: "Velvet ash pudding", isReal: false },
    { text: "Whistling kelp chips", isReal: false },
    { text: "Sunken honey bark", isReal: false },
  ],
  "Sex Positions": [
    { text: "Missionary", isReal: true },
    { text: "Doggy style", isReal: true },
    { text: "Cowgirl", isReal: true },
    { text: "Reverse cowgirl", isReal: true },
    { text: "Spooning", isReal: true },
    { text: "69", isReal: true },
    { text: "Wheelbarrow", isReal: true },
    { text: "Lotus", isReal: true },
    { text: "Standing", isReal: true },
    { text: "Butterfly", isReal: true },
    { text: "The Confused Pretzel", isReal: false },
    { text: "Downward Flamingo", isReal: false },
    { text: "The Sleepy Kangaroo", isReal: false },
    { text: "Reverse Umbrella", isReal: false },
    { text: "The Nervous Giraffe", isReal: false },
    { text: "Sideways Taco", isReal: false },
    { text: "The Polite Handshake", isReal: false },
    { text: "Upside-Down Bicycle", isReal: false },
    { text: "The Wandering Compass", isReal: false },
    { text: "Backwards Cartwheel", isReal: false },
  ],
  "Chinese Celebrities": [
    { text: "Jackie Chan", isReal: true },
    { text: "Jet Li", isReal: true },
    { text: "Zhang Ziyi", isReal: true },
    { text: "Gong Li", isReal: true },
    { text: "Chow Yun-fat", isReal: true },
    { text: "Yao Ming", isReal: true },
    { text: "Fan Bingbing", isReal: true },
    { text: "Donnie Yen", isReal: true },
    { text: "Liu Yifei", isReal: true },
    { text: "Tony Leung", isReal: true },
    { text: "Wang Chu Lin", isReal: false },
    { text: "Li Feng Hua", isReal: false },
    { text: "Chen Bo Yun", isReal: false },
    { text: "Zhou Da Ming", isReal: false },
    { text: "Huang Wei Jie", isReal: false },
    { text: "Ma Xiu Ying", isReal: false },
    { text: "Sun Le Fan", isReal: false },
    { text: "Deng Hao Ran", isReal: false },
    { text: "Lin Jia Qi", isReal: false },
    { text: "Xu Tian Yu", isReal: false },
  ],
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


function computeKnowHostScore(q, answer) {
  if (!q || answer === undefined || answer === null || answer === "") return null;
  if (q.type === "rank") {
    const order = q.answerOrder || q.items || [];
    if (!Array.isArray(answer)) return 0;
    let score = 0;
    order.forEach((item, i) => {
      if (answer[i] === item) score += 1;
    });
    return score;
  }
  if (q.type === "pick-rank") {
    const order = q.answerOrder || [];
    if (!Array.isArray(answer)) return 0;
    let score = 0;
    answer.forEach((item, i) => {
      if (order.includes(item)) score += 1;
      if (order[i] === item) score += 1;
    });
    return score;
  }
  if (q.type === "guess-list") {
    const order = (q.answerOrder || []).map(normalizeGuess);
    if (!Array.isArray(answer)) return 0;
    let score = 0;
    answer.forEach((raw, i) => {
      const item = normalizeGuess(raw);
      if (!item) return;
      if (order.includes(item)) score += 1;
      if (order[i] === item) score += 1;
    });
    return score;
  }
  if (q.type === "mcq") {
    return answer === q.correctIndex ? q.maxPoints || 1 : 0;
  }
  if (q.type === "tier") {
    const key = q.answerTiers || {};
    if (!answer || typeof answer !== "object") return 0;
    let score = 0;
    Object.keys(key).forEach((item) => {
      if (answer[item] === key[item]) score += 1;
    });
    return score;
  }
  return null;
}

// Shared placement math: groups playerIds into tiers by their raw in-game score
// (ties share a tier), then converts tiers into fixed leaderboard points that
// scale with player count - top tier gets N points, next gets N minus that
// tier's size, and so on. Mirrors what finalizeGameScores does server-side.
function buildTiers(playerIds, scoresMap) {
  const withScores = playerIds.map((id) => ({ id, score: scoresMap[id] || 0 }));
  withScores.sort((a, b) => b.score - a.score);
  const tiers = [];
  let i = 0;
  while (i < withScores.length) {
    const score = withScores[i].score;
    const tier = [];
    while (i < withScores.length && withScores[i].score === score) {
      tier.push(withScores[i].id);
      i++;
    }
    tiers.push(tier);
  }
  return tiers;
}

function tiersToPoints(tiers) {
  const total = tiers.reduce((sum, t) => sum + t.length, 0);
  let pts = total;
  const map = {};
  for (const tier of tiers) {
    for (const id of tier) map[id] = pts;
    pts -= tier.length;
  }
  return map;
}

// Same idea but for the 2-team battle: rank the teams (A/B) by score, tie if equal,
// then expand each team-tier into its member playerIds.
function buildTeamTiers(playerIds, assignments, teamScores) {
  const teams = ["A", "B"];
  const scoreOf = (t) => teamScores[t] || 0;
  const sortedTeams = [...teams].sort((a, b) => scoreOf(b) - scoreOf(a));
  const tiers = [];
  let i = 0;
  while (i < sortedTeams.length) {
    const score = scoreOf(sortedTeams[i]);
    const grouped = [];
    while (i < sortedTeams.length && scoreOf(sortedTeams[i]) === score) {
      grouped.push(sortedTeams[i]);
      i++;
    }
    const tierPlayers = playerIds.filter((id) => grouped.includes(assignments[id]));
    if (tierPlayers.length) tiers.push(tierPlayers);
  }
  return tiers;
}

const PARTNER_QUESTIONS = [
  "What's your favorite food, and what do you think your partner's favorite food is?",
  "What's your dream destination, and what do you think your partner's dream destination is?",
  "What's your go-to comfort movie or show, and what do you think your partner's is?",
  "What's your biggest pet peeve, and what do you think your partner's is?",
  "What's your favorite way to spend a lazy Sunday, and what do you think your partner's is?",
  "What would be your last meal ever, and what do you think your partner's would be?",
  "What's your guilty pleasure snack, and what do you think your partner's is?",
  "What's your favorite season, and what do you think your partner's is?",
  "What's one thing on your bucket list, and what do you think is on your partner's?",
  "What's your go-to karaoke song, and what do you think your partner's is?",
  "If you won the lottery, what would your first purchase be, and what do you think your partner's would be?",
];

const SPELLING_WORDS = {
  a: [
    { n: 1, word: "mnemonic", points: 3, origin: "Greek", sentence: "She used a mnemonic device to remember the planets in order." },
    { n: 2, word: "weird", points: 1, origin: "Old English", sentence: "It felt weird to be back in the empty house." },
    { n: 3, word: "restaurant", points: 2, origin: "French", sentence: "We booked a table at the new restaurant downtown." },
    { n: 4, word: "curmudgeon", points: 3, origin: "English (origin unclear)", sentence: "The old curmudgeon complained about everything at the meeting." },
    { n: 5, word: "mountain", points: 1, origin: "Old French", sentence: "They hiked to the top of the mountain before sunset." },
    { n: 6, word: "glowup", points: 2, origin: "Internet slang", sentence: "Everyone was shocked by his glowup after high school." },
    { n: 7, word: "chiaroscuro", points: 3, origin: "Italian", sentence: "The painter was famous for his use of chiaroscuro." },
    { n: 8, word: "cap", points: 1, origin: "Internet / AAVE slang", sentence: "That story is cap, there's no way that happened." },
    { n: 9, word: "embarrass", points: 2, origin: "French", sentence: "He didn't want to embarrass himself in front of the class." },
    { n: 10, word: "bombardillo crocodillo", points: 3, origin: "Italian AI brainrot meme", sentence: "In the video, Bombardillo Crocodillo flew over the ocean." },
    { n: 11, word: "thorough", points: 1, origin: "Old English", sentence: "She gave the report a thorough review before submitting it." },
    { n: 12, word: "exaggerate", points: 2, origin: "Latin", sentence: "Please don't exaggerate how bad the trip really was." },
    { n: 13, word: "byzantine", points: 3, origin: "Greek / Latin", sentence: "The tax code is famously byzantine and hard to follow." },
    { n: 14, word: "mid", points: 1, origin: "Internet slang", sentence: "The movie was kind of mid, not great not terrible." },
    { n: 15, word: "ohio", points: 2, origin: "Internet meme (US state name)", sentence: "Only in Ohio would something that weird happen." },
    { n: 16, word: "gyatt", points: 3, origin: "Internet slang", sentence: "The crowd yelled gyatt when he walked by." },
    { n: 17, word: "neighbor", points: 1, origin: "Old English", sentence: "Our neighbor waved to us from across the street." },
    { n: 18, word: "maintenance", points: 2, origin: "French", sentence: "The building needs regular maintenance to stay safe." },
    { n: 19, word: "camaraderie", points: 3, origin: "French", sentence: "There was a real sense of camaraderie on the team." },
    { n: 20, word: "surprise", points: 1, origin: "French", sentence: "They threw her a surprise party for her birthday." },
  ],
  b: [
    { n: 21, word: "sigma", points: 2, origin: "Greek letter / internet slang", sentence: "He called himself a sigma after watching the video." },
    { n: 22, word: "sesquipedalian", points: 3, origin: "Latin", sentence: "The professor was known for his sesquipedalian vocabulary." },
    { n: 23, word: "occasion", points: 1, origin: "Latin", sentence: "We dressed up for the special occasion." },
    { n: 24, word: "rhythm", points: 2, origin: "Greek", sentence: "The drummer kept a steady rhythm throughout the song." },
    { n: 25, word: "chungus", points: 3, origin: "Internet meme", sentence: "They called the giant rabbit a big chungus." },
    { n: 26, word: "based", points: 1, origin: "Internet slang", sentence: "People said his honest answer was based." },
    { n: 27, word: "unnecessary", points: 2, origin: "Latin", sentence: "That extra step in the process felt unnecessary." },
    { n: 28, word: "onomatopoeia", points: 3, origin: "Greek", sentence: "Words like buzz and hiss are examples of onomatopoeia." },
    { n: 29, word: "similar", points: 1, origin: "Latin", sentence: "The two paintings looked very similar at first glance." },
    { n: 30, word: "necessary", points: 2, origin: "Latin", sentence: "Water is necessary for all living things." },
    { n: 31, word: "ubiquitous", points: 3, origin: "Latin", sentence: "Smartphones have become ubiquitous in modern life." },
    { n: 32, word: "drip", points: 1, origin: "Internet / hip-hop slang", sentence: "Everyone complimented his drip at the party." },
    { n: 33, word: "gaslight", points: 2, origin: "From the play/film Gas Light", sentence: "He tried to gaslight her into doubting what she saw." },
    { n: 34, word: "phlegm", points: 3, origin: "Greek", sentence: "The cough left a lot of phlegm in his throat." },
    { n: 35, word: "mysterious", points: 1, origin: "Greek", sentence: "A mysterious package arrived on their doorstep." },
    { n: 36, word: "questionnaire", points: 2, origin: "French", sentence: "Please fill out the questionnaire before your appointment." },
    { n: 37, word: "skibidi", points: 3, origin: "Internet meme (YouTube series)", sentence: "The little kids kept singing the skibidi song." },
    { n: 38, word: "beautiful", points: 1, origin: "French", sentence: "The sunset over the ocean was absolutely beautiful." },
    { n: 39, word: "controversial", points: 2, origin: "Latin", sentence: "The new policy turned out to be quite controversial." },
    { n: 40, word: "shmlawg", points: 3, origin: "Internet / streamer slang", sentence: "He shouted his own nickname, shmlawg, on the stream." },
  ],
  c: [
    { n: 41, word: "calendar", points: 1, origin: "Latin", sentence: "She marked the date on her calendar." },
    { n: 42, word: "occurrence", points: 2, origin: "Latin", sentence: "Lateness became a common occurrence that month." },
    { n: 43, word: "idiosyncrasy", points: 3, origin: "Greek", sentence: "Everyone has some little idiosyncrasy that makes them unique." },
    { n: 44, word: "flex", points: 1, origin: "Internet / hip-hop slang", sentence: "He couldn't resist a chance to flex his new shoes." },
    { n: 45, word: "unbothered", points: 2, origin: "English", sentence: "She stayed unbothered by all the online criticism." },
    { n: 46, word: "connoisseur", points: 3, origin: "French", sentence: "He was a true connoisseur of fine coffee." },
    { n: 47, word: "decision", points: 1, origin: "Latin", sentence: "It was a hard decision to make on such short notice." },
    { n: 48, word: "hierarchy", points: 2, origin: "Greek", sentence: "The company has a clear hierarchy of management." },
    { n: 49, word: "quandale", points: 3, origin: "Internet meme (Quandale Dingle)", sentence: "The class couldn't stop laughing about Quandale Dingle." },
    { n: 50, word: "separate", points: 1, origin: "Latin", sentence: "Please keep the two piles of laundry separate." },
    { n: 51, word: "gigachad", points: 2, origin: "Internet meme", sentence: "The comments called the strongman a total gigachad." },
    { n: 52, word: "sacrilegious", points: 3, origin: "Latin", sentence: "Some found the joke to be almost sacrilegious." },
    { n: 53, word: "various", points: 1, origin: "Latin", sentence: "The store sells various types of candy." },
    { n: 54, word: "definitely", points: 2, origin: "Latin", sentence: "I will definitely be there on time tomorrow." },
    { n: 55, word: "xenophobia", points: 3, origin: "Greek", sentence: "The documentary explored the roots of xenophobia in the city." },
    { n: 56, word: "guarantee", points: 1, origin: "French", sentence: "The store offered a guarantee on all electronics." },
    { n: 57, word: "privilege", points: 2, origin: "Latin", sentence: "Getting front row seats felt like a privilege." },
    { n: 58, word: "pseudonym", points: 3, origin: "Greek", sentence: "The author wrote the novel under a pseudonym." },
    { n: 59, word: "yeet", points: 1, origin: "Internet slang", sentence: "He decided to yeet the ball across the yard." },
    { n: 60, word: "acquaintance", points: 2, origin: "French", sentence: "She ran into an old acquaintance at the coffee shop." },
  ],
  special: [
    { n: 1, word: "son", points: 10, origin: "Old English", sentence: "Their son just turned ten years old." },
    { n: 2, word: "flower", points: 10, origin: "Old French", sentence: "She picked a flower from the garden." },
    { n: 3, word: "praise", points: 10, origin: "Old French", sentence: "The coach gave the team high praise after the win." },
    { n: 4, word: "allowed", points: 10, origin: "Old French", sentence: "Pets are not allowed inside the building." },
    { n: 5, word: "board", points: 10, origin: "Old English", sentence: "He wrote the homework on the board." },
    { n: 6, word: "break", points: 10, origin: "Old English", sentence: "Let's take a short break before the next round." },
    { n: 7, word: "cell", points: 10, origin: "Latin", sentence: "The prisoner sat alone in his cell." },
    { n: 8, word: "dear", points: 10, origin: "Old English", sentence: "She started the letter with Dear Grandma." },
    { n: 9, word: "fair", points: 10, origin: "Old English", sentence: "It didn't seem fair that he got two turns." },
    { n: 10, word: "hair", points: 10, origin: "Old English", sentence: "Her hair was tied back in a ponytail." },
    { n: 11, word: "mail", points: 10, origin: "Old French", sentence: "The mail arrives around noon every day." },
    { n: 12, word: "pair", points: 10, origin: "Old French", sentence: "He bought a new pair of sneakers." },
    { n: 13, word: "plain", points: 10, origin: "Old French", sentence: "She ordered a plain bagel with butter." },
    { n: 14, word: "wait", points: 10, origin: "Old French", sentence: "Please wait here until your name is called." },
    { n: 15, word: "wring", points: 10, origin: "Old English", sentence: "She had to wring out the wet towel." },
    { n: 16, word: "knight", points: 10, origin: "Old English", sentence: "The knight rode into the castle at dawn." },
    { n: 17, word: "bare", points: 10, origin: "Old English", sentence: "He walked across the sand with bare feet." },
    { n: 18, word: "capital", points: 10, origin: "Latin", sentence: "Paris is the capital of France." },
    { n: 19, word: "currant", points: 10, origin: "Anglo-Norman", sentence: "The muffin was full of dried currant fruit." },
    { n: 20, word: "principal", points: 10, origin: "Latin", sentence: "The principal called the student into her office." },
  ],
};

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
  const [usedSpellingWords, setUsedSpellingWords] = useState([]);
  const [hostRevealedEntry, setHostRevealedEntry] = useState(null);

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("truefalse");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [pointInputs, setPointInputs] = useState({});
  const [roundFinalized, setRoundFinalized] = useState(false);

  const [knowHost, setKnowHost] = useState(null);
  const [knowHostQuestionText, setKnowHostQuestionText] = useState("");
  const [knowHostAnswerInput, setKnowHostAnswerInput] = useState("");
  const [knowHostQIndex, setKnowHostQIndex] = useState(0);

  const [partnerGame, setPartnerGame] = useState(null);
  const [partnerQuestionInput, setPartnerQuestionInput] = useState("");
  const [partnerQIndex, setPartnerQIndex] = useState(0);
  const [pairPlayerA, setPairPlayerA] = useState("");
  const [pairPlayerB, setPairPlayerB] = useState("");

  const [teamGame, setTeamGame] = useState(null);
  const [teamPromptInput, setTeamPromptInput] = useState("");
  const [teamNameAInput, setTeamNameAInput] = useState("");
  const [teamNameBInput, setTeamNameBInput] = useState("");
    const [realOrFakeCategory, setRealOrFakeCategory] = useState("Places");


  const [guessPhoto, setGuessPhoto] = useState(null);
  const [guessPhotoAvatarId, setGuessPhotoAvatarId] = useState("");

  const [whoSent, setWhoSent] = useState(null);
  const [whoSentImageUrl, setWhoSentImageUrl] = useState("");
  const [whoSentSenderId, setWhoSentSenderId] = useState("");

  const [showPlayerView, setShowPlayerView] = useState(false);
  const [leaderboardVisible, setLeaderboardVisibleState] = useState(false);
  const [roundScoresVisible, setRoundScoresVisibleState] = useState(false);

  const playerViewWidget = (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      <button
        className={leaderboardVisible ? "btn-good" : "btn-primary"}
        onClick={() => setLeaderboardVisible(!leaderboardVisible)}
        style={{ borderRadius: 999, padding: "10px 18px" }}
      >
        {leaderboardVisible ? "📊 Showing on Player Screens" : "📊 Push Leaderboard"}
      </button>
      <button
        className={roundScoresVisible ? "btn-good" : "btn-secondary"}
        onClick={() => setRoundScoresVisible(!roundScoresVisible)}
        style={{ borderRadius: 999, padding: "10px 18px" }}
      >
        {roundScoresVisible ? "🔥 Hide Round Scores" : "🔥 Push Round Scores"}
      </button>
      {showPlayerView ? (
        <div
          style={{
            width: 340,
            maxWidth: "90vw",
            background: "#0b1230",
            border: "1px solid #333",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              background: "#161c3d",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13 }}>👀 Player View</span>
            <button
              className="btn-secondary"
              onClick={() => setShowPlayerView(false)}
              style={{ padding: "2px 10px", fontSize: 12 }}
            >
              Close
            </button>
          </div>
          <iframe
            src="/play?spectator=1"
            style={{ width: "100%", height: 480, border: "none", background: "#05070f" }}
          />
        </div>
      ) : (
        <button
          className="btn-primary"
          onClick={() => setShowPlayerView(true)}
          style={{ borderRadius: 999, padding: "10px 18px" }}
        >
          👀 Player View
        </button>
      )}
    </div>
  );

  useEffect(() => {
    const unsubP = listenPlayers(setPlayers);
    const unsubR = listenRound1(setRound1);
    const unsubSB = listenSpellingBee(setSpellingBee);
    const unsubKH = listenKnowHost(setKnowHost);
    const unsubPG = listenPartnerGame(setPartnerGame);
    const unsubTG = listenTeamGame(setTeamGame);
    const unsubGP = listenGuessPhoto(setGuessPhoto);
    const unsubWS = listenWhoSent(setWhoSent);
    const unsubLV = listenLeaderboardVisible(setLeaderboardVisibleState);
    const unsubRSV = listenRoundScoresVisible(setRoundScoresVisibleState);
    return () => {
      unsubP();
      unsubR();
      unsubSB();
      unsubKH();
      unsubPG();
      unsubTG();
      unsubGP();
      unsubWS();
      unsubLV();
      unsubRSV();
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

  async function pushSpellingWord(points) {
    if (!spellingWordInput.trim()) return;
    await setSpellingWord(spellingWordInput.trim(), points);
    setSpellingWordInput("");
  }

  async function pushSpellingWordFromBank(entry) {
    await setSpellingWord(entry.word, entry.points);
    setUsedSpellingWords((prev) => (prev.includes(entry.word) ? prev : [...prev, entry.word]));
    setHostRevealedEntry(entry);
  }

  async function handleSpellingCorrect(playerId, points) {
    await markSpellingCorrect(playerId, points);
  }

  async function handleSpellingIncorrect() {
    await markSpellingIncorrect();
  }

  async function handleRevealSpellingAnswer() {
    await revealSpellingWord();
  }

  async function pushKnowHostBankQuestion() {
    await setKnowHostQuestion(KNOW_HOST_QUESTIONS[knowHostQIndex]);
  }

  async function pushCustomKnowHostQuestion() {
    if (!knowHostQuestionText.trim()) return;
    await setKnowHostQuestion({
      type: "text",
      prompt: knowHostQuestionText.trim(),
      answer: knowHostAnswerInput.trim(),
    });
    setKnowHostQuestionText("");
    setKnowHostAnswerInput("");
  }

  function nextKnowHostQuestion() {
    setKnowHostQIndex((i) => Math.min(i + 1, KNOW_HOST_QUESTIONS.length - 1));
  }

  function prevKnowHostQuestion() {
    setKnowHostQIndex((i) => Math.max(i - 1, 0));
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

  async function pushPresetPartnerQuestion() {
    await setPartnerQuestion(PARTNER_QUESTIONS[partnerQIndex]);
  }

  function nextPartnerQuestion() {
    setPartnerQIndex((i) => Math.min(i + 1, PARTNER_QUESTIONS.length - 1));
  }

  async function pushTeamPrompt() {
    if (!teamPromptInput.trim()) return;
    await setTeamPrompt(teamPromptInput.trim());
    setTeamPromptInput("");
  }

    async function pushRealOrFakeCategory() {
    const bank = REAL_OR_FAKE_BANK[realOrFakeCategory];
    if (!bank) return;
    await pushRealOrFakeRound(realOrFakeCategory, shuffleArray(bank));
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

  const triviaTiers = buildTiers(players.map((p) => p.id), scores);
  const triviaPointsMap = tiersToPoints(triviaTiers);
  const standings = [...players]
    .map((p) => ({ ...p, score: scores[p.id] || 0, points: triviaPointsMap[p.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  async function finalizeRound() {
    if (players.length === 0 || roundFinalized) return;
    await finalizeGameScores("trivia", triviaTiers);
    await resetRound1Scores();
    setRoundFinalized(true);
  }

  if (!selectedGame) {
    return (
      <div className="page-wrap">
        {playerViewWidget}
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
        {playerViewWidget}
        <ComingSoonView game={game} onBack={() => backToGames()} />
      </div>
    );
  }

  if (game.id === "spelling-bee") {
    return (
      <div className="page-wrap">
        {playerViewWidget}
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
          <p className="card-label">Round</p>
          <div className="form-row" style={{ justifyContent: "flex-start", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Round {spellingBee?.round || 1} of 3</span>
            <button
              className="btn-secondary"
              onClick={() => setSpellingRound(Math.min(3, (spellingBee?.round || 1) + 1))}
              disabled={(spellingBee?.round || 1) >= 3}
            >
              Next Round →
            </button>
          </div>
        </div>

        <div className="card">
          <p className="card-label">Word Bank</p>
          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>
            Categories A, B and C are shuffled and blind - even you don't know what's behind a number until you click it. Have the player call a letter and a number, click it, and the word + origin + example sentence appear below for your eyes only. Read it out loud - nothing is ever shown on players' screens until you hit Reveal Answer.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <div>
              <p style={{ fontWeight: 800, marginBottom: 6 }}>A</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                {SPELLING_WORDS.a.map((w) => (
                  <button
                    key={w.word}
                    className="btn-secondary"
                    disabled={usedSpellingWords.includes(w.word)}
                    onClick={() => pushSpellingWordFromBank(w)}
                    style={{ opacity: usedSpellingWords.includes(w.word) ? 0.4 : 1, fontSize: 13, padding: "8px 0" }}
                  >
                    {w.n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 800, marginBottom: 6 }}>B</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                {SPELLING_WORDS.b.map((w) => (
                  <button
                    key={w.word}
                    className="btn-secondary"
                    disabled={usedSpellingWords.includes(w.word)}
                    onClick={() => pushSpellingWordFromBank(w)}
                    style={{ opacity: usedSpellingWords.includes(w.word) ? 0.4 : 1, fontSize: 13, padding: "8px 0" }}
                  >
                    {w.n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 800, marginBottom: 6 }}>C</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                {SPELLING_WORDS.c.map((w) => (
                  <button
                    key={w.word}
                    className="btn-secondary"
                    disabled={usedSpellingWords.includes(w.word)}
                    onClick={() => pushSpellingWordFromBank(w)}
                    style={{ opacity: usedSpellingWords.includes(w.word) ? 0.4 : 1, fontSize: 13, padding: "8px 0" }}
                  >
                    {w.n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 800, marginBottom: 6 }}>⭐ Special · 10pt</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                {SPELLING_WORDS.special.map((s) => (
                  <button
                    key={s.word}
                    className="btn-primary"
                    disabled={usedSpellingWords.includes(s.word)}
                    onClick={() => pushSpellingWordFromBank(s)}
                    style={{ opacity: usedSpellingWords.includes(s.word) ? 0.4 : 1, fontSize: 13, padding: "8px 0" }}
                  >
                    {s.n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hostRevealedEntry && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "var(--panel-2, rgba(255,255,255,0.06))", border: "1px solid var(--border, rgba(255,255,255,0.12))" }}>
              <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)", marginBottom: 4 }}>Revealed to you only - read it out</p>
              <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                {hostRevealedEntry.word} <span style={{ fontWeight: 600, fontSize: 14, color: "var(--muted)" }}>({hostRevealedEntry.points} pt{hostRevealedEntry.points === 1 ? "" : "s"})</span>
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>Origin: {hostRevealedEntry.origin}</p>
              <p style={{ fontSize: 13 }}>"{hostRevealedEntry.sentence}"</p>
            </div>
          )}

          <details style={{ marginTop: 14 }}>
            <summary style={{ cursor: "pointer", color: "var(--muted)", fontSize: 12 }}>Or type your own word</summary>
            <div className="form-row" style={{ justifyContent: "flex-start", marginTop: 10 }}>
              <input
                type="text"
                placeholder="Custom word"
                value={spellingWordInput}
                onChange={(e) => setSpellingWordInput(e.target.value)}
                style={{ flex: 1, minWidth: 160 }}
              />
              <button className="btn-secondary" onClick={() => pushSpellingWord(1)}>Easy</button>
              <button className="btn-secondary" onClick={() => pushSpellingWord(2)}>Medium</button>
              <button className="btn-secondary" onClick={() => pushSpellingWord(3)}>Hard</button>
              <button className="btn-primary" onClick={() => pushSpellingWord(10)}>Special</button>
            </div>
          </details>
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
              <button className="btn-good" onClick={() => handleSpellingCorrect(spellingBee.currentPlayerId, spellingBee.points || 1)}>
                ✓ Correct (+{spellingBee.points || 1})
              </button>
              <button className="btn-bad" onClick={() => handleSpellingIncorrect()}>✗ Incorrect</button>
            </div>
          </div>
        )}

        {spellingBee?.word && (
          <div className="card">
            <p className="card-label">Reveal to Players</p>
            <p style={{ color: "var(--muted)" }}>
              After they've made their attempt, reveal the correct spelling on their screens.
            </p>
            <div className="form-row" style={{ justifyContent: "flex-start" }}>
              <button
                className="btn-primary"
                onClick={() => handleRevealSpellingAnswer()}
                disabled={!!spellingBee?.revealed}
              >
                👁 {spellingBee?.revealed ? "Answer Revealed" : "Reveal Answer"}
              </button>
            </div>
          </div>
        )}

        {(() => {
          const sbScores = spellingBee?.scores || {};
          const sbTiers = buildTiers(players.map((p) => p.id), sbScores);
          const sbPointsMap = tiersToPoints(sbTiers);
          const sbStandings = [...players].sort((a, b) => (sbScores[b.id] || 0) - (sbScores[a.id] || 0));
          return (
            <div className="card">
              <p className="card-label">Spelling Bee Standings</p>
              {players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
              {sbStandings.map((p) => (
                <div key={p.id} className="answer-row">
                  <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ width: 110, textAlign: "center", color: "var(--muted)" }}>{sbScores[p.id] || 0} in-game pts</div>
                  <div style={{ width: 140, textAlign: "center", fontWeight: 700, color: "var(--good)" }}>+{sbPointsMap[p.id] || 0} leaderboard</div>
                </div>
              ))}
              <button
                className="btn-good"
                style={{ marginTop: 12 }}
                disabled={players.length === 0}
                onClick={async () => {
                  await finalizeGameScores("spelling-bee", sbTiers);
                  await resetGameScore("spellingBee");
                }}
              >
                🏆 Finalize & Award Leaderboard Points
              </button>
            </div>
          );
        })()}
      </div>
    );
  }

  if (game.id === "know-your-host") {
    const khAnswers = knowHost?.answers || {};
    const bankQ = KNOW_HOST_QUESTIONS[knowHostQIndex];
    return (
      <div className="page-wrap">
        {playerViewWidget}
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
          <p className="card-label">Question Bank ({knowHostQIndex + 1} of {KNOW_HOST_QUESTIONS.length}) - {bankQ.type}</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{bankQ.prompt}</p>
          {bankQ.type === "text" && (
            <p style={{ color: "var(--good)" }}>Answer: {bankQ.answer}</p>
          )}
          {bankQ.type === "rank" && (
            <p style={{ color: "var(--good)" }}>Correct order: {bankQ.answerOrder.join(" → ")} ({bankQ.maxPoints} pts)</p>
          )}
          {bankQ.type === "pick-rank" && (
            <>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>Pool: {bankQ.pool.join(", ")}</p>
              <p style={{ color: "var(--good)" }}>Correct: {bankQ.answerOrder.join(" → ")} ({bankQ.maxPoints} pts)</p>
            </>
          )}
          {bankQ.type === "mcq" && (
            <>
              {bankQ.options.map((opt, i) => (
                <p key={i} style={{ color: i === bankQ.correctIndex ? "var(--good)" : "var(--text)", margin: "2px 0" }}>
                  {i === bankQ.correctIndex ? "✓ " : ""}{opt}
                </p>
              ))}
            </>
          )}
          {bankQ.type === "tier" && (
            <>
              {bankQ.tiers.map((t) => (
                <p key={t.id} style={{ color: "var(--good)", margin: "2px 0", fontSize: 13 }}>
                  <strong>{t.label}:</strong>{" "}
                  {bankQ.items.filter((it) => bankQ.answerTiers[it] === t.id).join(", ")}
                </p>
              ))}
              <p style={{ color: "var(--muted)", fontSize: 13 }}>({bankQ.maxPoints} pts total)</p>
              {bankQ.easterEgg && (
                <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                  🥚 Hidden side quest: "{bankQ.easterEgg.prompt}" → {bankQ.easterEgg.answer} ({bankQ.easterEgg.points} pts)
                </p>
              )}
            </>
          )}
          {bankQ.type === "guess-list" && (
            <>
              <p style={{ color: "var(--good)" }}>Correct order: {bankQ.answerOrder.join(" → ")} ({bankQ.maxPoints} pts)</p>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>Players can send up to {bankQ.maxGuesses} free-text guesses.</p>
            </>
          )}
          <div className="form-row" style={{ justifyContent: "flex-start", marginTop: 10 }}>
            <button className="btn-secondary" onClick={prevKnowHostQuestion} disabled={knowHostQIndex <= 0}>
              ← Prev
            </button>
            <button
              className="btn-secondary"
              onClick={nextKnowHostQuestion}
              disabled={knowHostQIndex >= KNOW_HOST_QUESTIONS.length - 1}
            >
              Next →
            </button>
            <button className="btn-primary" onClick={pushKnowHostBankQuestion}>Push This Question</button>
          </div>
        </div>

        <div className="card">
          <p className="card-label">Or Ask a Custom Question</p>
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
          <button className="btn-primary" onClick={pushCustomKnowHostQuestion}>Push Custom Question</button>
        </div>

        {knowHost?.prompt && (
          <>
            <div className="card">
              <p className="card-label">Current Question ({knowHost.type})</p>
              <p style={{ fontSize: 19, fontWeight: 700, marginTop: 0 }}>{knowHost.prompt}</p>
              {knowHost.type === "text" && (
                <p style={{ color: "var(--muted)" }}>Correct answer: {knowHost.answer || "(not set)"}</p>
              )}
              {(knowHost.type === "rank" || knowHost.type === "pick-rank") && (
                <p style={{ color: "var(--muted)" }}>Correct order: {(knowHost.answerOrder || []).join(" → ")}</p>
              )}
              {knowHost.type === "mcq" && (
                <p style={{ color: "var(--muted)" }}>Correct: {knowHost.options?.[knowHost.correctIndex]}</p>
              )}
              {knowHost.type === "tier" && (
                <>
                  {(knowHost.tiers || []).map((t) => (
                    <p key={t.id} style={{ color: "var(--muted)", fontSize: 13 }}>
                      <strong>{t.label}:</strong>{" "}
                      {(knowHost.items || []).filter((it) => knowHost.answerTiers?.[it] === t.id).join(", ")}
                    </p>
                  ))}
                  {knowHost.easterEgg && (
                    <p style={{ color: "var(--muted)", fontSize: 12 }}>
                      🥚 Side quest found by:{" "}
                      {Object.keys(knowHost.easterEggClaims || {}).length === 0
                        ? "no one yet"
                        : Object.keys(knowHost.easterEggClaims || {})
                            .map((pid) => players.find((p) => p.id === pid)?.name || pid)
                            .join(", ")}
                    </p>
                  )}
                </>
              )}
              {knowHost.type === "guess-list" && (
                <p style={{ color: "var(--muted)" }}>Correct order: {(knowHost.answerOrder || []).join(" → ")}</p>
              )}
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
              {players.map((p) => {
                const ans = khAnswers[p.id];
                const hasAnswer = ans !== undefined && ans !== null && ans !== "";
                const autoScore = computeKnowHostScore(knowHost, ans);
                let displayAns = "no answer yet";
                if (hasAnswer) {
                  if (Array.isArray(ans)) displayAns = ans.join(" → ");
                  else if (knowHost.type === "mcq") displayAns = knowHost.options?.[ans] ?? String(ans);
                  else if (knowHost.type === "tier" && typeof ans === "object")
                    displayAns = Object.entries(ans)
                      .map(([item, tierId]) => `${item}: ${knowHost.tiers?.find((t) => t.id === tierId)?.label || tierId}`)
                      .join(", ");
                  else displayAns = String(ans);
                }
                return (
                  <div key={p.id} className="answer-row">
                    <Avatar avatarId={p.avatarId} size="sm" />
                    <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ flex: 2, color: hasAnswer ? "var(--text)" : "var(--muted)" }}>
                      {displayAns}
                    </div>
                    {autoScore !== null ? (
                      <button
                        className="btn-good"
                        disabled={!hasAnswer}
                        onClick={() => awardKnowHostPoint(p.id, autoScore)}
                      >
                        Award {autoScore} pt{autoScore === 1 ? "" : "s"}
                      </button>
                    ) : (
                      <>
                        <input
                          type="number"
                          placeholder="pts"
                          style={{ width: 56 }}
                          value={pointInputs[p.id] || ""}
                          onChange={(e) => setPointInputs({ ...pointInputs, [p.id]: e.target.value })}
                        />
                        <button
                          className="btn-good"
                          onClick={() => {
                            const amt = parseInt(pointInputs[p.id] || "0", 10);
                            if (!amt) return;
                            awardKnowHostPoint(p.id, amt);
                            setPointInputs({ ...pointInputs, [p.id]: "" });
                          }}
                        >
                          Award
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {(() => {
          const khScores = knowHost?.scores || {};
          const khTiers = buildTiers(players.map((p) => p.id), khScores);
          const khPointsMap = tiersToPoints(khTiers);
          const khStandings = [...players].sort((a, b) => (khScores[b.id] || 0) - (khScores[a.id] || 0));
          return (
            <div className="card">
              <p className="card-label">Know Your Host Standings</p>
              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>
                Finalize once you're done with all the questions for the night - this ranks everyone by their total across every question and awards fixed leaderboard points.
              </p>
              {players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
              {khStandings.map((p) => (
                <div key={p.id} className="answer-row">
                  <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ width: 110, textAlign: "center", color: "var(--muted)" }}>{khScores[p.id] || 0} in-game pts</div>
                  <div style={{ width: 140, textAlign: "center", fontWeight: 700, color: "var(--good)" }}>+{khPointsMap[p.id] || 0} leaderboard</div>
                </div>
              ))}
              <button
                className="btn-good"
                style={{ marginTop: 12 }}
                disabled={players.length === 0}
                onClick={async () => {
                  await finalizeGameScores("know-your-host", khTiers);
                  await resetGameScore("knowHost");
                }}
              >
                🏆 Finalize & Award Leaderboard Points
              </button>
            </div>
          );
        })()}
      </div>
    );
  }

  if (game.id === "know-your-partner") {
    const pairs = partnerGame?.pairs || {};
    const pgAnswers = partnerGame?.answers || {};
    const nameOf = (id) => players.find((p) => p.id === id)?.name || "?";
    return (
      <div className="page-wrap">
        {playerViewWidget}
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
          <p className="card-label">Questions ({partnerQIndex + 1} of {PARTNER_QUESTIONS.length})</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{PARTNER_QUESTIONS[partnerQIndex]}</p>
          <div className="form-row" style={{ justifyContent: "flex-start", marginBottom: 14 }}>
            <button className="btn-primary" onClick={pushPresetPartnerQuestion}>Push This Question</button>
            <button
              className="btn-secondary"
              onClick={nextPartnerQuestion}
              disabled={partnerQIndex >= PARTNER_QUESTIONS.length - 1}
            >
              Next Question →
            </button>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>Or write your own:</p>
          <div className="form-row" style={{ justifyContent: "flex-start" }}>
            <input
              type="text"
              placeholder="Custom question for both partners"
              value={partnerQuestionInput}
              onChange={(e) => setPartnerQuestionInput(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <button className="btn-primary" onClick={pushPartnerQuestion}>Push Custom</button>
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
                        <button className="btn-good" onClick={() => awardPartnerMatch(pair.a, pair.b)}>Match ✓</button>
                        <button className="btn-bad">No Match</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
                        <p style={{ margin: 0, flex: 1 }}>
                          {nameOf(pair.b)} said "{bAns.own || "-"}", guessed "{bAns.guess || "-"}"
                        </p>
                        <button className="btn-good" onClick={() => awardPartnerMatch(pair.a, pair.b)}>Match ✓</button>
                        <button className="btn-bad">No Match</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(() => {
          const pgScores = partnerGame?.scores || {};
          const pgTiers = buildTiers(players.map((p) => p.id), pgScores);
          const pgPointsMap = tiersToPoints(pgTiers);
          const pgStandings = [...players].sort((a, b) => (pgScores[b.id] || 0) - (pgScores[a.id] || 0));
          return (
            <div className="card">
              <p className="card-label">Know Your Partner Standings</p>
              {players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
              {pgStandings.map((p) => (
                <div key={p.id} className="answer-row">
                  <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ width: 110, textAlign: "center", color: "var(--muted)" }}>{pgScores[p.id] || 0} matches</div>
                  <div style={{ width: 140, textAlign: "center", fontWeight: 700, color: "var(--good)" }}>+{pgPointsMap[p.id] || 0} leaderboard</div>
                </div>
              ))}
              <button
                className="btn-good"
                style={{ marginTop: 12 }}
                disabled={players.length === 0}
                onClick={async () => {
                  await finalizeGameScores("know-your-partner", pgTiers);
                  await resetGameScore("partnerGame");
                }}
              >
                🏆 Finalize & Award Leaderboard Points
              </button>
            </div>
          );
        })()}
      </div>
    );
  }

  if (game.id === "guess-the-real-place") {

    const assignments = teamGame?.assignments || {};
    const teamScores = teamGame?.scores || {};
    const teamNames = teamGame?.teamNames || {};
    const captains = teamGame?.captains || {};
    const round = teamGame?.round || null;
    const captainOrder = teamGame?.captainOrder || {};
    const winningTeam = (teamScores.A || 0) >= (teamScores.B || 0) ? "A" : "B";
    const losingTeam = winningTeam === "A" ? "B" : "A";
    const bothOrdersIn = !!(captainOrder.A && captainOrder.A.length && captainOrder.B && captainOrder.B.length);
    const nameFor = (id) => (players.find((p) => p.id === id)?.name) || "?";
    return (
      <div className="page-wrap">
        {playerViewWidget}
        <button className="btn-secondary" onClick={() => backToGames()} style={{ marginBottom: 16 }}>
          ← Back to Games
        </button>
        <h1 className="page-title">🔍 Real or Fake?</h1>
        <p className="page-subtitle">Team battle - spot the real 10 of 20</p>

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
          <p className="card-label">Assign Teams &amp; Captains</p>
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
              {assignments[p.id] && (
                <button
                  className={captains[assignments[p.id]] === p.id ? "btn-good" : "btn-secondary"}
                  onClick={() => setTeamCaptain(assignments[p.id], p.id)}
                >
                  ⭐ Captain
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <p className="card-label">Push Round</p>
          <div className="form-row" style={{ justifyContent: "flex-start" }}>
            <select value={realOrFakeCategory} onChange={(e) => setRealOrFakeCategory(e.target.value)}>
              {Object.keys(REAL_OR_FAKE_BANK).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button className="btn-primary" onClick={pushRealOrFakeCategory}>Push This Round</button>
          </div>
        </div>

        {round && (
          <div className="card">
            <p className="card-label">Current Round ({round.category})</p>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Team decides which one to call out, then click it here - green means real (+1 point), red means fake. Turn passes automatically.
            </p>
            <p style={{ marginTop: 8 }}>
              Current turn: <strong>{teamNames[round.currentTurn] || `Team ${round.currentTurn}`}</strong>{" "}
              <button className="btn-secondary" style={{ fontSize: 12, marginLeft: 8 }} onClick={() => setCurrentTurn(round.currentTurn === "A" ? "B" : "A")}>
                Swap Turn
              </button>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {round.options.map((opt, i) => {
                const claimedBy = round.results && round.results[i];
                let cls = "btn-secondary";
                if (claimedBy) cls = opt.isReal ? "btn-good" : "btn-bad";
                return (
                  <button
                    key={i}
                    className={cls}
                    disabled={!!claimedBy}
                    onClick={() => claimRealOrFakeItem(i, round.currentTurn)}
                    style={{ fontSize: 13 }}
                  >
                    {opt.text}{claimedBy ? ` (${teamNames[claimedBy] || claimedBy})` : ""}
                  </button>
                );
              })}
            </div>
            <button className="btn-secondary" onClick={() => clearRealOrFakeRound()} style={{ marginTop: 12 }}>Clear Round</button>
          </div>
        )}

        <div className="card">
          <p className="card-label">Team Scores</p>
          <div className="answer-row">
            <div style={{ flex: 1, fontWeight: 600 }}>{teamNames.A || "Team A"}</div>
            <div style={{ width: 60, textAlign: "center", fontWeight: 700 }}>{teamScores.A || 0} pts</div>
          </div>
          <div className="answer-row">
            <div style={{ flex: 1, fontWeight: 600 }}>{teamNames.B || "Team B"}</div>
            <div style={{ width: 60, textAlign: "center", fontWeight: 700 }}>{teamScores.B || 0} pts</div>
          </div>
          <button className="btn-secondary" onClick={() => resetTeamScores()} style={{ marginTop: 12 }}>Reset Scores</button>
        </div>

        <div className="card">
          <p className="card-label">Captain Ordering</p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            Once all rounds are done, each captain ranks their own team on their phone for bonus placement points -
            the winning captain picks who on their team gets the highest points, then the losing captain does the same for their team.
          </p>
          <button className="btn-primary" onClick={() => openCaptainOrdering()}>
            Open Captain Ordering
          </button>
          <div style={{ marginTop: 12 }}>
            <p>
              {teamNames.A || "Team A"} ({captains.A ? nameFor(captains.A) : "no captain set"}):{" "}
              {captainOrder.A && captainOrder.A.length ? captainOrder.A.map(nameFor).join(" → ") : "waiting..."}
            </p>
            <p>
              {teamNames.B || "Team B"} ({captains.B ? nameFor(captains.B) : "no captain set"}):{" "}
              {captainOrder.B && captainOrder.B.length ? captainOrder.B.map(nameFor).join(" → ") : "waiting..."}
            </p>
          </div>
        </div>

        <div className="card">
          <p className="card-label">Finalize Team Battle</p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            {teamNames[winningTeam] || `Team ${winningTeam}`} is currently ahead ({teamScores[winningTeam] || 0} vs {teamScores[losingTeam] || 0}) and gets the higher point band; their captain's order goes first, then the other captain's order.
          </p>
          <button
            className="btn-good"
            disabled={!bothOrdersIn}
            onClick={async () => {
              const winOrder = captainOrder[winningTeam] || [];
              const loseOrder = captainOrder[losingTeam] || [];
              const tiers = [...winOrder.map((id) => [id]), ...loseOrder.map((id) => [id])];
              if (tiers.length === 0) return;
              await finalizeGameScores("guess-the-real-place", tiers);
              await resetRealOrFakeGame();
            }}
          >
            🏆 Finalize & Award Leaderboard Points
          </button>
          {!bothOrdersIn && <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>Waiting for both captains to submit their team order.</p>}
        </div>
      </div>
    );
  }


  if (game.id === "guess-the-photo") {
    const gpAnswers = guessPhoto?.answers || {};
    const photoOptions = AVATARS.filter((a) => a.photoUrl);
    return (
      <div className="page-wrap">
        {playerViewWidget}
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
                  <button className="btn-good" onClick={() => addGameScore("guessPhoto", p.id, 1)}>+1</button>
                </div>
              ))}
            </div>
          </>
        )}

        {(() => {
          const gpScores = guessPhoto?.scores || {};
          const gpTiers = buildTiers(players.map((p) => p.id), gpScores);
          const gpPointsMap = tiersToPoints(gpTiers);
          const gpStandings = [...players].sort((a, b) => (gpScores[b.id] || 0) - (gpScores[a.id] || 0));
          return (
            <div className="card">
              <p className="card-label">Guess the Photo Standings</p>
              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>
                Finalize once you're done running photo rounds for the night - ranks everyone by total correct guesses.
              </p>
              {players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
              {gpStandings.map((p) => (
                <div key={p.id} className="answer-row">
                  <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ width: 110, textAlign: "center", color: "var(--muted)" }}>{gpScores[p.id] || 0} correct</div>
                  <div style={{ width: 140, textAlign: "center", fontWeight: 700, color: "var(--good)" }}>+{gpPointsMap[p.id] || 0} leaderboard</div>
                </div>
              ))}
              <button
                className="btn-good"
                style={{ marginTop: 12 }}
                disabled={players.length === 0}
                onClick={async () => {
                  await finalizeGameScores("guess-the-photo", gpTiers);
                  await resetGameScore("guessPhoto");
                }}
              >
                🏆 Finalize & Award Leaderboard Points
              </button>
            </div>
          );
        })()}
      </div>
    );
  }

  if (game.id === "who-sent-this") {
    const wsAnswers = whoSent?.answers || {};
    return (
      <div className="page-wrap">
        {playerViewWidget}
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

        {(() => {
          const wsScores = whoSent?.scores || {};
          const wsTiers = buildTiers(players.map((p) => p.id), wsScores);
          const wsPointsMap = tiersToPoints(wsTiers);
          const wsStandings = [...players].sort((a, b) => (wsScores[b.id] || 0) - (wsScores[a.id] || 0));
          return (
            <div className="card">
              <p className="card-label">Who Sent This Standings</p>
              <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -6, marginBottom: 10 }}>
                Finalize once you're done posting images for the night - ranks everyone by total correct guesses.
              </p>
              {players.length === 0 && <p style={{ color: "var(--muted)" }}>No players joined yet.</p>}
              {wsStandings.map((p) => (
                <div key={p.id} className="answer-row">
                  <Avatar avatarId={p.avatarId} size="sm" />
                  <div style={{ flex: 1, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ width: 110, textAlign: "center", color: "var(--muted)" }}>{wsScores[p.id] || 0} correct</div>
                  <div style={{ width: 140, textAlign: "center", fontWeight: 700, color: "var(--good)" }}>+{wsPointsMap[p.id] || 0} leaderboard</div>
                </div>
              ))}
              <button
                className="btn-good"
                style={{ marginTop: 12 }}
                disabled={players.length === 0}
                onClick={async () => {
                  await finalizeGameScores("who-sent-this", wsTiers);
                  await resetGameScore("whoSent");
                }}
              >
                🏆 Finalize & Award Leaderboard Points
              </button>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="page-wrap">
      {playerViewWidget}
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
