"use client";

import type { EcommerceChannel, EcommerceFilters, EcommercePeriod } from "./ecommerce-filters-context";

const PERIOD_MULTIPLIERS: Record<EcommercePeriod, number> = {
  "this-month": 1,
  "last-month": 0.92,
  "last-30-days": 1.05,
  "year-to-date": 11.5,
};

const CHANNEL_MULTIPLIERS: Record<EcommerceChannel, number> = {
  "all-channels": 1,
  "online-store": 0.45,
  marketplace: 0.3,
  social: 0.15,
  retail: 0.1,
};

export function getFilterMultiplier(filters: EcommerceFilters): number {
  return PERIOD_MULTIPLIERS[filters.period] * CHANNEL_MULTIPLIERS[filters.channel];
}

export function adjustNumber(value: number, filters: EcommerceFilters): number {
  const multiplier = getFilterMultiplier(filters);
  return Math.round(value * multiplier);
}

export function adjustCurrency(value: number, filters: EcommerceFilters): string {
  const adjusted = adjustNumber(value, filters);
  return `$${adjusted.toLocaleString()}`;
}

export function adjustPercentChange(value: number, filters: EcommerceFilters): string {
  const multiplier = getFilterMultiplier(filters);
  const adjusted = value * (0.8 + multiplier * 0.4);
  const sign = adjusted >= 0 ? "+" : "";
  return `${sign}${adjusted.toFixed(1)}%`;
}

const PERIOD_LABELS: Record<EcommercePeriod, string> = {
  "this-month": "This Month",
  "last-month": "Last Month",
  "last-30-days": "Last 30 Days",
  "year-to-date": "Year to Date",
};

const CHANNEL_LABELS: Record<EcommerceChannel, string> = {
  "all-channels": "All Channels",
  "online-store": "Online Store",
  marketplace: "Marketplace",
  social: "Social",
  retail: "Retail",
};

export function getPeriodLabel(period: EcommercePeriod): string {
  return PERIOD_LABELS[period];
}

export function getChannelLabel(channel: EcommerceChannel): string {
  return CHANNEL_LABELS[channel];
}
