"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/ui/Confetti";
import { Mascot } from "@/components/gamification/Mascot";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  newLevel: number;
  oldLevel: number;
  title?: string;
  bonusEffect?: string;
}

export function LevelUpModal({
  open,
  onClose,
  newLevel,
  oldLevel,
  title,
  bonusEffect,
}: LevelUpModalProps) {
  const [phase, setPhase] = useState<"idle" | "flash" | "confetti">("idle");
  const prevOpenRef = useRef(false);

  useEffect(() => {
    let raf: number;
    if (open && !prevOpenRef.current) {
      raf = requestAnimationFrame(() => setPhase("flash"));
      const hideTimer = setTimeout(() => setPhase("confetti"), 300);
      prevOpenRef.current = true;
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(hideTimer);
      };
    }
    if (!open && prevOpenRef.current) {
      const resetTimer = setTimeout(() => setPhase("idle"), 0);
      prevOpenRef.current = false;
      return () => clearTimeout(resetTimer);
    }
  }, [open]);

  const showFlash = phase === "flash";
  const showConfetti = phase === "confetti";

  return (
    <>
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[90] pointer-events-none"
            style={{
              background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-accent))",
            }}
          />
        )}
      </AnimatePresence>

      <Confetti active={showConfetti} duration={2} particleCount={50} />

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="border-accent-primary/50 bg-n-900 sm:max-w-md overflow-hidden"
          aria-labelledby="level-up-title"
          aria-modal="true"
        >
          <DialogHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 150, delay: 0.15 }}
              className="mx-auto mb-4"
            >
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-n-800 border border-n-700">
                <Mascot pose="celebrate" size={80} />
              </div>
            </motion.div>

            <DialogTitle className="font-display text-3xl font-bold text-accent">
              Level Up!
            </DialogTitle>

            <DialogDescription asChild>
              <div className="mt-3 space-y-3">
                <motion.div
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="text-center">
                    <p className="text-xs text-n-400 uppercase tracking-wider">Antes</p>
                    <p className="font-mono text-2xl font-bold text-n-400 line-through">
                      {oldLevel}
                    </p>
                  </div>

                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <Star className="h-8 w-8 text-accent" />
                  </motion.div>

                  <div className="text-center">
                    <p className="text-xs text-accent uppercase tracking-wider">Agora</p>
                    <motion.p
                      initial={{ scale: 2 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                      className="font-mono text-3xl font-bold text-accent"
                    >
                      {newLevel}
                    </motion.p>
                  </div>
                </motion.div>

                {title && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-n-300"
                  >
                    <span className="text-accent-secondary font-semibold">{title}</span>{" "}
                    desbloqueado
                  </motion.p>
                )}

                {bonusEffect && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-xs text-accent-accent"
                  >
                    {bonusEffect}
                  </motion.p>
                )}

                <motion.div
                  className="mx-auto mt-4 h-2 w-48 overflow-hidden rounded-full bg-n-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="flex items-center justify-center gap-1.5 text-n-500"
                >
                  <Volume2 className="h-3 w-3" />
                  <span className="text-[10px]">Level up sound</span>
                </motion.div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center mt-4"
          >
            <Button onClick={onClose} size="lg">
              <Sparkles className="mr-2 h-4 w-4" />
              Continuar
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
