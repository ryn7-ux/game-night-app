# Game Night App

A live multiplayer party game shell built with Next.js and Firebase Realtime Database. Round 1 (write-and-reveal trivia) is fully built end-to-end: player join, host controls, live leaderboard, gated answer submission.

## Setup

1. Create a Firebase project at https://console.firebase.google.com, register a web app, and enable Realtime Database (test mode is fine for a private one-night event).
2. Copy `.env.local.example` to `.env.local` and fill in your Firebase config values plus a `NEXT_PUBLIC_HOST_PIN` of your choosing.
3. `npm install` then `npm run dev` to test locally.
4. Deploy to Vercel: import this repo, add the same environment variables in Vercel's Project Settings, and deploy.

## How it works

- Players open the site, enter their name on `/join`, and land on `/play`.
- The host unlocks `/host` with the PIN and controls everything: push a question, open/lock answers, reveal the answer, award round points, and add placement-based leaderboard points.
- Everything syncs live through Firebase Realtime Database.

## What's not built yet

Rounds 2-4 of trivia and the other 5 party games still need to be built as modules on top of this shared shell (join screen, host/participant split, leaderboard).
