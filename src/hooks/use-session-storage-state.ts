"use client";

import * as React from "react";

export function useSessionStorageState<T>(
  key: string,
  initialValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = React.useState<T>(() =>
    typeof initialValue === "function" ? (initialValue as () => T)() : initialValue,
  );

  React.useLayoutEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored) as T);
      }
    } catch {
      // ignore read errors
    }
  }, [key]);

  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore write errors
    }
  }, [key, state]);

  return [state, setState];
}
