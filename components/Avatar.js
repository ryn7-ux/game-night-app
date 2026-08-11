import { getAvatar } from "../lib/avatars";

// Renders a player's avatar. Prefers a real photoUrl if one has been
// set on the avatar entry, otherwise falls back to the emoji + gradient
// placeholder. size: "sm" | "md" | "lg"
export default function Avatar({ avatarId, size = "md" }) {
    const a = getAvatar(avatarId);
    const className = `avatar-bubble avatar-${size}`;

  if (!a) {
        return (
                <div className={className} style={{ background: "linear-gradient(135deg,#2a2e3d,#171a24)" }}>
          ❓
            </div>
      );
}

  if (a.photoUrl) {
        return (
                <div
            className={className}
            style={{
                        backgroundImage: `url(${a.photoUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
            }}
      />
    );
}

  return (
        <div className={className} style={{ background: a.gradient }}>
{a.emoji}
</div>
  );
}
