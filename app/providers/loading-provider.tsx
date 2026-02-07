"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface LoadingContextValue {
  /** Whether a global loading operation is in progress */
  isLoading: boolean;
  /** Set the global loading state */
  setLoading: (loading: boolean) => void;
  /** Track concurrent requests – increments/decrements an internal counter */
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const startLoading = useCallback(() => setCount((c) => c + 1), []);
  const stopLoading = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);
  const setLoading = useCallback((loading: boolean) => {
    setCount(loading ? 1 : 0);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading: count > 0, setLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return ctx;
}
