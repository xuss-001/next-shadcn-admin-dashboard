"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { type StoreApi, useStore } from "zustand";

import { applyThemeMode, subscribeToSystemTheme } from "@/lib/preferences/theme-utils";

import { createPreferencesStore, type PreferencesState } from "./preferences-store";

const PreferencesStoreContext = createContext<StoreApi<PreferencesState> | null>(null);

export const PreferencesStoreProvider = ({
  children,
  themeMode,
  themePreset,
  font,
  contentLayout,
  navbarStyle,
  sidebarVariant,
  sidebarCollapsible,
  resolvedThemeMode,
}: {
  children: React.ReactNode;
  themeMode: PreferencesState["themeMode"];
  themePreset: PreferencesState["themePreset"];
  font: PreferencesState["font"];
  contentLayout: PreferencesState["contentLayout"];
  navbarStyle: PreferencesState["navbarStyle"];
  sidebarVariant: PreferencesState["sidebarVariant"];
  sidebarCollapsible: PreferencesState["sidebarCollapsible"];
  resolvedThemeMode: PreferencesState["resolvedThemeMode"];
}) => {
  const [store] = useState<StoreApi<PreferencesState>>(() =>
    createPreferencesStore({
      themeMode,
      themePreset,
      font,
      contentLayout,
      navbarStyle,
      sidebarVariant,
      sidebarCollapsible,
      resolvedThemeMode,
      isSynced: true,
    }),
  );

  useEffect(() => {
    let unsubscribeMedia: (() => void) | undefined;

    const applyFromMode = (mode: PreferencesState["themeMode"]) => {
      unsubscribeMedia?.();
      const resolved = applyThemeMode(mode);
      store.setState((prev) => ({ ...prev, resolvedThemeMode: resolved }));

      if (mode === "system") {
        unsubscribeMedia = subscribeToSystemTheme(() => {
          const next = applyThemeMode("system");
          store.setState((prev) => ({ ...prev, resolvedThemeMode: next }));
        });
      }
    };

    applyFromMode(store.getState().themeMode);

    const unsubscribeStore = store.subscribe((s, p) => {
      if (s.themeMode !== p.themeMode) applyFromMode(s.themeMode);
    });

    return () => {
      unsubscribeMedia?.();
      unsubscribeStore();
    };
  }, [store]);

  return <PreferencesStoreContext.Provider value={store}>{children}</PreferencesStoreContext.Provider>;
};

export const usePreferencesStore = <T,>(selector: (state: PreferencesState) => T): T => {
  const store = useContext(PreferencesStoreContext);
  if (!store) throw new Error("Missing PreferencesStoreProvider");
  return useStore(store, selector);
};
