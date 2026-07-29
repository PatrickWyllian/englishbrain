"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type MascotPose = "idle" | "celebrate" | "think" | "speak";

interface MascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
}

export function Mascot({ pose = "idle", size = 96, className }: MascotProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all duration-300", className)}
      role="img"
      aria-label={
        pose === "celebrate"
          ? "Mascote celebrando"
          : pose === "think"
            ? "Mascote pensando"
            : pose === "speak"
              ? "Mascote falando"
              : "Mascote"
      }
      animate={
        prefersReducedMotion
          ? {}
          : {
              scale: pose === "idle" ? [1, 1.02, 1] : 1,
              rotate: pose === "celebrate" ? [0, -5, 5, -5, 0] : 0,
              y: pose === "think" ? -4 : 0,
            }
      }
      transition={{
        duration: pose === "idle" ? 3 : pose === "celebrate" ? 0.6 : 0.3,
        repeat: prefersReducedMotion ? 0 : pose === "idle" ? Infinity : 0,
        ease: "easeInOut",
      }}
    >
      {/* Body */}
      <ellipse
        cx={48}
        cy={70}
        rx={28}
        ry={18}
        fill="#292524"
        stroke="#44403C"
        strokeWidth={1.5}
      />

      {/* Head */}
      <ellipse
        cx={48}
        cy={38}
        rx={24}
        ry={22}
        fill="#292524"
        stroke="#44403C"
        strokeWidth={1.5}
      />

      {/* Wings - keyboard style */}
      <g stroke="#44403C" strokeWidth={1.5} fill="#1C1917">
        <path
          d="M20 45 Q8 35 12 25 Q16 15 24 20 Q32 25 24 35 Z"
          opacity={0.9}
        />
        <g stroke="#78716C" strokeWidth={0.5}>
          <rect x={12} y={27} width={4} height={3} rx={0.5} />
          <rect x={17} y={27} width={4} height={3} rx={0.5} />
          <rect x={12} y={31} width={4} height={3} rx={0.5} />
          <rect x={17} y={31} width={4} height={3} rx={0.5} />
        </g>
        <path
          d="M76 45 Q88 35 84 25 Q80 15 72 20 Q64 25 72 35 Z"
          opacity={0.9}
        />
      </g>

      {/* Ear tufts */}
      <ellipse cx={30} cy={18} rx={4} ry={8} fill="#292524" stroke="#44403C" strokeWidth={1.5} />
      <ellipse cx={66} cy={18} rx={4} ry={8} fill="#292524" stroke="#44403C" strokeWidth={1.5} />

      {/* Eyes - camera style */}
      <g>
        <circle cx={36} cy={38} r={10} fill="#0C0A09" stroke="#44403C" strokeWidth={2} />
        <circle cx={36} cy={38} r={6} fill="#1C1917" stroke="#06B6D4" strokeWidth={1.5} />
        <circle cx={34} cy={36} r={2.5} fill="#06B6D4" opacity={0.9} />
        <circle cx={33} cy={35} r={1} fill="#FAFAF9" opacity={0.6} />

        <circle cx={60} cy={38} r={10} fill="#0C0A09" stroke="#44403C" strokeWidth={2} />
        <circle cx={60} cy={38} r={6} fill="#1C1917" stroke="#F59E0B" strokeWidth={1.5} />
        <circle cx={58} cy={36} r={2.5} fill="#F59E0B" opacity={0.9} />
        <circle cx={57} cy={35} r={1} fill="#FAFAF9" opacity={0.6} />
      </g>

      {/* Beak / Mouth */}
      {pose === "speak" ? (
        <motion.g
          animate={
            prefersReducedMotion
              ? {}
              : { scaleY: [1, 1.3, 1] }
          }
          transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ originY: "100%", originX: "50%" }}
        >
          <path
            d="M48 50 L42 58 L54 58 Z"
            fill="#D97706"
            stroke="#B45309"
            strokeWidth={1}
          />
          <ellipse
            cx={48}
            cy={57}
            rx={5}
            ry={2}
            fill="#92400E"
            opacity={0.6}
          />
        </motion.g>
      ) : (
        <path
          d="M48 50 L44 56 L52 56 Z"
          fill="#F59E0B"
          stroke="#D97706"
          strokeWidth={1}
        />
      )}

      {/* Celebration glow ring */}
      {pose === "celebrate" && (
        <motion.circle
          cx={48}
          cy={38}
          r={32}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.3 }
              : { opacity: [0, 0.4, 0], scale: [0.8, 1.1, 0.8] }
          }
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Thought bubble for 'think' pose */}
      {pose === "think" && (
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          <ellipse
            cx={78}
            cy={16}
            rx={14}
            ry={10}
            fill="#FAFAF9"
            stroke="#E7E5E4"
            strokeWidth={1.5}
            opacity={0.95}
            filter="drop-shadow(0 2px 8px rgba(0,0,0,0.3))"
          />
          <ellipse
            cx={70}
            cy={22}
            rx={4}
            ry={4}
            fill="#FAFAF9"
            stroke="#E7E5E4"
            strokeWidth={1.5}
            opacity={0.95}
          />
          <ellipse
            cx={62}
            cy={28}
            rx={2.5}
            ry={2.5}
            fill="#FAFAF9"
            stroke="#E7E5E4"
            strokeWidth={1}
            opacity={0.95}
          />
          <text
            x={78}
            y={20}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="16"
            fontWeight="bold"
            fill="#292524"
            fontFamily="system-ui, sans-serif"
          >
            ?
          </text>
        </motion.g>
      )}

      {/* Celebration sparkles */}
      {pose === "celebrate" && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.circle
              key={i}
              cx={48 + Math.cos(i * Math.PI / 3) * 40}
              cy={38 + Math.sin(i * Math.PI / 3) * 25}
              r={3}
              fill="#F59E0B"
              initial={{ scale: 0 }}
              animate={
                prefersReducedMotion
                  ? { scale: 1 }
                  : { scale: [1, 0.5, 1] }
              }
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </motion.g>
      )}

      {/* Subtle glow around camera eye */}
      <circle cx={36} cy={38} r={12} fill="none" stroke="#06B6D4" strokeWidth={0.5} opacity={0.3}>
        <animate
          attributeName="opacity"
          values="0.3;0.5;0.3"
          dur="2s"
          repeatCount={prefersReducedMotion ? "0" : "indefinite"}
        />
      </circle>
    </motion.svg>
  );
}
