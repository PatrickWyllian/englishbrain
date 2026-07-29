"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { SrsState } from "@/lib/srs/sm2";

interface WorkerCard {
  contentId: string;
  contentType: string;
  word: string;
  translation: string;
  context?: string;
  tags: string[];
  srs: SrsState;
}

type WorkerMessage =
  | { type: "addCards"; cards: WorkerCard[] }
  | { type: "gradeCard"; contentId: string; grade: 0 | 1 | 2 | 3 }
  | { type: "getDueCards" }
  | { type: "getAllCards" }
  | { type: "syncFromStorage" };

type WorkerResponse =
  | { type: "cardsAdded"; count: number }
  | { type: "cardGraded"; contentId: string; newState: SrsState }
  | { type: "dueCards"; cards: WorkerCard[] }
  | { type: "allCards"; cards: WorkerCard[] }
  | { type: "synced"; cards: WorkerCard[] };

type PendingResolve = (value: WorkerResponse) => void;

const workerSupported = typeof Worker !== "undefined";

export function useSrsWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingResolve>>(new Map());
  const msgIdRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const setIsReadyRef = useRef(setIsReady);

  useEffect(() => {
    if (!workerSupported) {
      return;
    }

    const pending = pendingRef.current;
    const worker = new Worker(
      new URL("@/workers/srs-engine.worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      const key = `${msg.type}:${msg.type === "cardGraded" ? msg.contentId : ""}`;
      const resolve = pendingRef.current.get(key);
      if (resolve) {
        resolve(msg);
        pendingRef.current.delete(key);
      }
    };

    worker.onerror = () => {
      worker.terminate();
      workerRef.current = null;
      setIsReadyRef.current(false);
    };

    workerRef.current = worker;
    setIsReadyRef.current(true);

    worker.postMessage({ type: "syncFromStorage" } as WorkerMessage);

    return () => {
      worker.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, []);

  const postAndWait = useCallback(
    <T extends WorkerResponse>(
      msg: WorkerMessage,
      responseKey: string
    ): Promise<T> => {
      return new Promise((resolve) => {
        const worker = workerRef.current;
        if (!worker) {
          resolve({ type: "dueCards" } as unknown as T);
          return;
        }
        pendingRef.current.set(responseKey, resolve as PendingResolve);
        worker.postMessage(msg);
      });
    },
    []
  );

  const addCards = useCallback(
    async (newCards: WorkerCard[]): Promise<number> => {
      if (!workerRef.current) return 0;
      const id = ++msgIdRef.current;
      const res = await postAndWait<{ type: "cardsAdded"; count: number }>(
        { type: "addCards", cards: newCards },
        `cardsAdded:${id}`
      );
      return res.count;
    },
    [postAndWait]
  );

  const gradeCard = useCallback(
    async (
      contentId: string,
      grade: 0 | 1 | 2 | 3
    ): Promise<SrsState | null> => {
      if (!workerRef.current) return null;
      const res = await postAndWait<{
        type: "cardGraded";
        contentId: string;
        newState: SrsState;
      }>(
        { type: "gradeCard", contentId, grade },
        `cardGraded:${contentId}`
      );
      return res.newState;
    },
    [postAndWait]
  );

  const getDueCards = useCallback(async (): Promise<WorkerCard[]> => {
    if (!workerRef.current) return [];
    const res = await postAndWait<{ type: "dueCards"; cards: WorkerCard[] }>(
      { type: "getDueCards" },
      `dueCards:${++msgIdRef.current}`
    );
    return res.cards;
  }, [postAndWait]);

  const getAllCards = useCallback(async (): Promise<WorkerCard[]> => {
    if (!workerRef.current) return [];
    const res = await postAndWait<{ type: "allCards"; cards: WorkerCard[] }>(
      { type: "getAllCards" },
      `allCards:${++msgIdRef.current}`
    );
    return res.cards;
  }, [postAndWait]);

  return {
    isReady,
    addCards,
    gradeCard,
    getDueCards,
    getAllCards,
  };
}
