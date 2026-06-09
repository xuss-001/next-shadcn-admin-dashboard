"use client";

import * as React from "react";

export function useSessionStorageState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(() =>
    typeof initialValue === "function" ? (initialValue as () => T)() : initialValue,
  );
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored) as T);
      }
    } catch {
      // ignore read errors
    }
    setIsHydrated(true);
  }, [key]);

  React.useEffect(() => {
    if (!isHydrated) return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write errors
    }
  }, [key, state, isHydrated]);

  return [state, setState];
}
