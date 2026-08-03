"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type LoadPhase = "loading" | "exiting" | "done";

interface LoadingContextValue {
  phase: LoadPhase;
  ready: boolean;
}

const LoadingContext = createContext<LoadingContextValue>({
  phase: "done",
  ready: true,
});

const SESSION_KEY = "killo-loaded";
const CONTENT_MS = 1900;
const EXIT_MS = 800;

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<LoadPhase>("loading");

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — ignore */
    }
    setPhase("done");
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* ignore */
    }

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const delay = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      timers.add(t);
    };

    if (seen) {
      delay(50, () => setPhase("exiting"));
      delay(50 + EXIT_MS, finish);
    } else {
      delay(CONTENT_MS, () => setPhase("exiting"));
      delay(CONTENT_MS + EXIT_MS, finish);
    }

    return () => timers.forEach(clearTimeout);
  }, [finish]);

  return (
    <LoadingContext.Provider value={{ phase, ready: phase === "done" }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
