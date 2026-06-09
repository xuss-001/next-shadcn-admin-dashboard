"use server";

import { cookies } from "next/headers";

import type { FontKey } from "@/lib/fonts/registry";
import {
  CONTENT_LAYOUT_VALUES,
  type ContentLayout,
  NAVBAR_STYLE_VALUES,
  type NavbarStyle,
  SIDEBAR_COLLAPSIBLE_VALUES,
  SIDEBAR_VARIANT_VALUES,
  type SidebarCollapsible,
  type SidebarVariant,
} from "@/lib/preferences/layout";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { THEME_MODE_VALUES, THEME_PRESET_VALUES, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";

export async function getValueFromCookie(key: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
}

export async function setValueToCookie(
  key: string,
  value: string,
  options: { path?: string; maxAge?: number } = {},
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(key, value, {
    path: options.path ?? "/",
    maxAge: options.maxAge ?? 60 * 60 * 24 * 7, // default: 7 days
  });
}

export async function getPreference<T extends string>(key: string, allowed: readonly T[], fallback: T): Promise<T> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(key);
  const value = cookie ? cookie.value.trim() : undefined;
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export type AllPreferences = {
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  font: FontKey;
  contentLayout: ContentLayout;
  navbarStyle: NavbarStyle;
  sidebarVariant: SidebarVariant;
  sidebarCollapsible: SidebarCollapsible;
};

export async function getAllPreferences(fontKeys: readonly FontKey[]): Promise<AllPreferences> {
  const [themeMode, themePreset, font, contentLayout, navbarStyle, sidebarVariant, sidebarCollapsible] =
    await Promise.all([
      getPreference("theme_mode", THEME_MODE_VALUES, PREFERENCE_DEFAULTS.theme_mode),
      getPreference("theme_preset", THEME_PRESET_VALUES, PREFERENCE_DEFAULTS.theme_preset),
      getPreference("font", fontKeys, PREFERENCE_DEFAULTS.font),
      getPreference("content_layout", CONTENT_LAYOUT_VALUES, PREFERENCE_DEFAULTS.content_layout),
      getPreference("navbar_style", NAVBAR_STYLE_VALUES, PREFERENCE_DEFAULTS.navbar_style),
      getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, PREFERENCE_DEFAULTS.sidebar_variant),
      getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, PREFERENCE_DEFAULTS.sidebar_collapsible),
    ]);

  return {
    themeMode,
    themePreset,
    font,
    contentLayout,
    navbarStyle,
    sidebarVariant,
    sidebarCollapsible,
  };
}
