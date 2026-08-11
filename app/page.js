"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WELCOME_TEXT = "Welcome to Game Night";
const EVENT_DATE = "15th August 2026";

export default function WelcomePage() {
        const router = useRouter();
        const [step, setStep] = useState("welcome");
        const [noPos, setNoPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
            const letterCount = WELCOME_TEXT.length;
            const totalMs = letterCount * 70 + 900;
            const timer = setTimeout(() => setStep("ready"), totalMs);
            return () => clearTimeout(timer);
  }, []);

  function dodgeNo() {
            const x = Math.random() * 240 - 120;
            const y = Math.random() * 90 - 45;
            setNoPos({ x, y });
  }

  return (
            <div className="center-screen">
              <div className="site-topbar">
                <span className="topbar-signature">RYN</span>
              <span className="topbar-date">{EVENT_DATE}</span>
        </div>

      {step === "welcome" && (
                    <h1 className="welcome-title">
      {WELCOME_TEXT.split("").map((ch, i) => (
                        <span
                                                key={i}
                     className="welcome-letter"
                     style={{ animationDelay: `${i * 70}ms` }}
                  >
      {ch === " " ? " " : ch}
        </span>
                ))}
</h1>
      )}

{step === "ready" && (
              <div className="fade-up">
                <h2 style={{ marginBottom: 28 }}>Are you ready?</h2>
          <div className="ready-zone">
                  <button
              className="btn-primary"
              onClick={() => setStep("choose")}
            >
                                  Yes
                    </button>
            <button
              className="no-button"
              style={{
                                    top: "50%",
                                    left: "50%",
                                    transform: `translate(calc(-50% + ${noPos.x}px), calc(-50% + ${noPos.y}px - 64px))`,
              }}
              onMouseEnter={dodgeNo}
              onTouchStart={dodgeNo}
              onClick={dodgeNo}
            >
                                  No
                    </button>
                    </div>
                    </div>
      )}

{step === "choose" && (
              <div className="fade-up">
                <h2 style={{ marginBottom: 28 }}>How are you joining?</h2>
          <div className="form-row">
                  <button
              className="btn-primary"
              onClick={() => router.push("/host")}
            >
                                  Host
                    </button>
            <button
              className="btn-primary"
              onClick={() => router.push("/join")}
            >
                                  Player
                    </button>
                    </div>
                    </div>
      )}
</div>
  );
}
