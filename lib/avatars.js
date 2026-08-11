// Placeholder avatar set for players to pick on the join screen.
// To swap a placeholder for a real photo later, just add a
// photoUrl field (e.g. "/avatars/filename.jpg") to that entry below --
// the Avatar component automatically prefers photoUrl when present.
export const AVATARS = [
  { id: "a1", emoji: "🦊", gradient: "linear-gradient(135deg,#f6d365,#fda085)" },
  { id: "a2", emoji: "🐼", gradient: "linear-gradient(135deg,#a1c4fd,#c2e9fb)" },
  { id: "a3", emoji: "🐸", gradient: "linear-gradient(135deg,#84fab0,#8fd3f4)" },
  { id: "a4", emoji: "🦁", gradient: "linear-gradient(135deg,#f6d365,#f2994a)" },
  { id: "a5", emoji: "🐵", gradient: "linear-gradient(135deg,#d4a373,#7c4a2d)" },
  { id: "a6", emoji: "🐨", gradient: "linear-gradient(135deg,#c9d6ff,#8e9eab)" },
  { id: "a7", emoji: "🦄", gradient: "linear-gradient(135deg,#f9a8d4,#a78bfa)" },
  { id: "a8", emoji: "🐯", gradient: "linear-gradient(135deg,#fbbf24,#1f2937)" },
  { id: "a9", emoji: "🐰", gradient: "linear-gradient(135deg,#fecdd3,#fda4af)" },
  { id: "a10", emoji: "🐙", gradient: "linear-gradient(135deg,#c4b5fd,#6d28d9)" },
  { id: "a11", emoji: "🦉", gradient: "linear-gradient(135deg,#a8edea,#5b7c99)" },
  { id: "a12", emoji: "🐢", gradient: "linear-gradient(135deg,#34d399,#0d2f78)" },
  ];

export function getAvatar(id) {
    return AVATARS.find((a) => a.id === id) || null;
}
