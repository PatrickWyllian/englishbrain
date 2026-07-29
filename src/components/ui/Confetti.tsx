"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  drift: number;
  duration: number;
}

const COLORS = ["#F59E0B", "#06B6D4", "#A855F7", "#22C55E", "#EF4444", "#3B82F6"];

function generateParticles(count: number, baseDuration: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.4,
    drift: (Math.random() - 0.5) * 60,
    duration: baseDuration + Math.random() * 0.5,
  }));
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
}

export function Confetti({ active, duration = 2, particleCount = 40 }: ConfettiProps) {
  const particles = useMemo(() => {
    if (active) {
      return generateParticles(particleCount, duration);
    }
    return [];
  }, [active, particleCount, duration]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              left: `${p.x}%`,
              top: "-5%",
              opacity: 1,
              rotate: 0,
              x: 0,
            }}
            animate={{
              top: "105%",
              x: p.drift,
              opacity: [1, 1, 0],
              rotate: p.rotation + 720,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "easeIn",
            }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
              borderRadius: 2,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
