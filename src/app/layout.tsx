import type { ReactNode } from "react";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/config/app-config";
import { FONT_KEYS, fontVars } from "@/lib/fonts/registry";
import type { ResolvedThemeMode } from "@/lib/preferences/theme";
import { ThemeBootScript } from "@/scripts/theme-boot";
import { getAllPreferences } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const prefs = await getAllPreferences(FONT_KEYS);

  let htmlClassName = "";
  let colorScheme: ResolvedThemeMode | undefined;
  let resolvedThemeMode: ResolvedThemeMode = "light";

  if (prefs.themeMode === "dark") {
    htmlClassName = "dark";
    colorScheme = "dark";
    resolvedThemeMode = "dark";
  } else if (prefs.themeMode === "light") {
    colorScheme = "light";
    resolvedThemeMode = "light";
  }

  return (
    <html
      lang="en"
      className={htmlClassName}
      data-theme-mode={prefs.themeMode}
      data-theme-preset={prefs.themePreset}
      data-content-layout={prefs.contentLayout}
      data-navbar-style={prefs.navbarStyle}
      data-sidebar-variant={prefs.sidebarVariant}
      data-sidebar-collapsible={prefs.sidebarCollapsible}
      data-font={prefs.font}
      style={colorScheme ? { colorScheme } : undefined}
      suppressHydrationWarning
    >
      <head>
        {/* Applies theme and layout preferences on load to avoid flicker and unnecessary server rerenders. */}
        <ThemeBootScript />
      </head>
      <body className={`${fontVars} min-h-screen antialiased`}>
        <TooltipProvider>
          <PreferencesStoreProvider
            themeMode={prefs.themeMode}
            themePreset={prefs.themePreset}
            contentLayout={prefs.contentLayout}
            navbarStyle={prefs.navbarStyle}
            font={prefs.font}
            sidebarVariant={prefs.sidebarVariant}
            sidebarCollapsible={prefs.sidebarCollapsible}
            resolvedThemeMode={resolvedThemeMode}
          >
            {children}
            <Toaster />
          </PreferencesStoreProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
