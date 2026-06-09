"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function LoadingScreen({ onDone }) {
  const screenRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const barRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        onDone?.();
      },
    });

    tl.from(logoRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    })
      .from(textRef.current, { opacity: 0, y: 8, duration: 0.3 }, "-=0.1")
      .to(barRef.current, { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, "+=0.1")
      .to(screenRef.current, {
        yPercent: -100,
        duration: 0.55,
        ease: "power3.inOut",
        delay: 0.15,
      });
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: "#1e2a4a" }}
    >
      <div ref={logoRef} className="flex flex-col items-center gap-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <img src="/logo.png" alt="SmartVyapar Logo" className="w-full h-full object-cover" />
        </div>
        <div ref={textRef} className="text-center">
          <p className="text-white font-bold text-xl tracking-wide">SmartVyapar</p>
          <p className="text-sm mt-1" style={{ color: "#7b9bc8" }}>Admin Dashboard</p>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 w-full h-1"
        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          ref={barRef}
          className="h-full origin-left"
          style={{
            background: "linear-gradient(90deg, #3b82f6, #1d4ed8)",
            transform: "scaleX(0)",
          }}
        />
      </div>
    </div>
  );
}
