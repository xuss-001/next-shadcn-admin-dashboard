"use client";

import type { EcommerceChannel, EcommerceFilters, EcommercePeriod } from "./ecommerce-filters-context";

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const PERIOD_CONFIG: Record<
  EcommercePeriod,
  {
    days: number;
    intervalHours: number;
    baseTrend: "flat" | "growing" | "declining" | "volatile";
    weekendBoost: number;
    label: string;
  }
> = {
  "this-month": {
    days: 30,
    intervalHours: 24,
    baseTrend: "growing",
    weekendBoost: 1.3,
    label: "This Month",
  },
  "last-month": {
    days: 30,
    intervalHours: 24,
    baseTrend: "flat",
    weekendBoost: 1.1,
    label: "Last Month",
  },
  "last-30-days": {
    days: 30,
    intervalHours: 24,
    baseTrend: "volatile",
    weekendBoost: 1.2,
    label: "Last 30 Days",
  },
  "year-to-date": {
    days: 160,
    intervalHours: 24 * 7,
    baseTrend: "growing",
    weekendBoost: 1.0,
    label: "Year to Date",
  },
};

const CHANNEL_CONFIG: Record<
  EcommerceChannel,
  {
    trafficPattern: "even" | "evening" | "weekend" | "business";
    baseVisitors: number;
    anomalyRate: number;
    label: string;
  }
> = {
  "all-channels": {
    trafficPattern: "even",
    baseVisitors: 450,
    anomalyRate: 0.03,
    label: "All Channels",
  },
  "online-store": {
    trafficPattern: "evening",
    baseVisitors: 280,
    anomalyRate: 0.02,
    label: "Online Store",
  },
  marketplace: {
    trafficPattern: "business",
    baseVisitors: 180,
    anomalyRate: 0.04,
    label: "Marketplace",
  },
  social: {
    trafficPattern: "weekend",
    baseVisitors: 120,
    anomalyRate: 0.08,
    label: "Social",
  },
  retail: {
    trafficPattern: "business",
    baseVisitors: 80,
    anomalyRate: 0.01,
    label: "Retail",
  },
};

const CHANNEL_SOURCE_MAP: Record<
  EcommerceChannel,
  { name: string; iconKey: string; baseShare: number; baseVisits: number; change: number }[]
> = {
  "all-channels": [
    { name: "Meta", iconKey: "meta", baseShare: 38, baseVisits: 5640, change: 18 },
    { name: "Google", iconKey: "google", baseShare: 25, baseVisits: 3740, change: -6 },
    { name: "Shopify", iconKey: "shopify", baseShare: 20, baseVisits: 2960, change: 7 },
    { name: "TikTok", iconKey: "tiktok", baseShare: 10, baseVisits: 1340, change: 9 },
    { name: "eBay", iconKey: "ebay", baseShare: 7, baseVisits: 1080, change: -3 },
  ],
  "online-store": [
    { name: "Shopify", iconKey: "shopify", baseShare: 65, baseVisits: 4200, change: 12 },
    { name: "Google", iconKey: "google", baseShare: 25, baseVisits: 1600, change: 3 },
    { name: "Meta", iconKey: "meta", baseShare: 10, baseVisits: 650, change: -2 },
  ],
  marketplace: [
    { name: "eBay", iconKey: "ebay", baseShare: 55, baseVisits: 3800, change: 5 },
    { name: "Google", iconKey: "google", baseShare: 30, baseVisits: 2100, change: -8 },
    { name: "Meta", iconKey: "meta", baseShare: 15, baseVisits: 1050, change: 2 },
  ],
  social: [
    { name: "Meta", iconKey: "meta", baseShare: 58, baseVisits: 4800, change: 25 },
    { name: "TikTok", iconKey: "tiktok", baseShare: 42, baseVisits: 3500, change: 32 },
  ],
  retail: [
    { name: "Google", iconKey: "google", baseShare: 70, baseVisits: 2900, change: 1 },
    { name: "Meta", iconKey: "meta", baseShare: 30, baseVisits: 1250, change: -5 },
  ],
};

export interface TrafficDataPoint {
  timestamp: string;
  visitors: number;
  anomalies: number;
}

export function generateTrafficData(filters: EcommerceFilters): TrafficDataPoint[] {
  const periodConfig = PERIOD_CONFIG[filters.period];
  const channelConfig = CHANNEL_CONFIG[filters.channel];
  const seed = hashString(filters.period + filters.channel);
  const random = seededRandom(seed);

  const now = new Date();
  const dataPoints: TrafficDataPoint[] = [];
  const totalPoints = Math.floor((periodConfig.days * 24) / periodConfig.intervalHours);

  for (let i = totalPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * periodConfig.intervalHours * 60 * 60 * 1000);
    const dayOfWeek = timestamp.getDay();
    const hourOfDay = timestamp.getHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let trendMultiplier = 1;
    const progress = 1 - i / totalPoints;

    switch (periodConfig.baseTrend) {
      case "growing":
        trendMultiplier = 0.7 + progress * 0.6;
        break;
      case "declining":
        trendMultiplier = 1.3 - progress * 0.5;
        break;
      case "volatile":
        trendMultiplier = 0.85 + Math.sin(progress * Math.PI * 4) * 0.3;
        break;
      case "flat":
      default:
        trendMultiplier = 0.95 + Math.sin(progress * Math.PI * 2) * 0.1;
        break;
    }

    let patternMultiplier = 1;
    switch (channelConfig.trafficPattern) {
      case "evening":
        patternMultiplier = 0.6 + Math.sin(((hourOfDay - 12) / 24) * Math.PI * 2) * 0.6;
        break;
      case "weekend":
        patternMultiplier = isWeekend ? 1.8 : 0.6;
        break;
      case "business":
        patternMultiplier = isWeekend ? 0.4 : hourOfDay >= 9 && hourOfDay <= 17 ? 1.4 : 0.7;
        break;
      case "even":
      default:
        patternMultiplier = 1;
        break;
    }

    const weekendMultiplier = isWeekend ? periodConfig.weekendBoost : 1;
    const randomVariation = 0.7 + random() * 0.6;

    const baseVisitors =
      channelConfig.baseVisitors * trendMultiplier * patternMultiplier * weekendMultiplier * randomVariation;
    const visitors = Math.max(0, Math.round(baseVisitors));
    const anomalies =
      random() < channelConfig.anomalyRate
        ? Math.max(1, Math.round(baseVisitors * 0.02 * random()))
        : Math.max(0, Math.round(baseVisitors * 0.005 * random()));

    dataPoints.push({
      timestamp: timestamp.toISOString(),
      visitors,
      anomalies,
    });
  }

  return dataPoints;
}

export interface TrafficSourceData {
  name: string;
  iconKey: string;
  visits: string;
  share: number;
  change: string;
}

export function generateTrafficSources(filters: EcommerceFilters): TrafficSourceData[] {
  const sources = CHANNEL_SOURCE_MAP[filters.channel];
  const periodConfig = PERIOD_CONFIG[filters.period];
  const seed = hashString(filters.period + filters.channel + "sources");
  const random = seededRandom(seed);

  const periodMultiplier =
    filters.period === "year-to-date"
      ? 5.2
      : filters.period === "last-30-days"
        ? 1.05
        : filters.period === "last-month"
          ? 0.92
          : 1;

  const adjustedSources = sources.map((source) => {
    const visitsVariation = 0.85 + random() * 0.3;
    const adjustedVisits = Math.round(source.baseVisits * periodMultiplier * visitsVariation);
    const shareVariation = 0.9 + random() * 0.2;
    const adjustedShare = Math.round(source.baseShare * shareVariation);
    const changeVariation = 0.7 + random() * 0.6;
    const adjustedChange = Math.round(source.change * changeVariation);
    const sign = adjustedChange >= 0 ? "+" : "";

    return {
      name: source.name,
      iconKey: source.iconKey,
      visits: adjustedVisits.toLocaleString(),
      share: adjustedShare,
      change: `${sign}${adjustedChange}%`,
    };
  });

  const totalShare = adjustedSources.reduce((sum, s) => sum + s.share, 0);
  if (totalShare > 0 && totalShare !== 100) {
    const diff = 100 - totalShare;
    adjustedSources[0] = {
      ...adjustedSources[0],
      share: adjustedSources[0].share + diff,
    };
  }

  return adjustedSources.sort((a, b) => b.share - a.share);
}

export interface KPIData {
  revenue: number;
  orders: number;
  customers: number;
  conversion: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  conversionChange: number;
}

export function generateKPIData(filters: EcommerceFilters): KPIData {
  const seed = hashString(filters.period + filters.channel + "kpi");
  const random = seededRandom(seed);

  const periodMultiplier =
    filters.period === "year-to-date"
      ? 12
      : filters.period === "last-30-days"
        ? 1.02
        : filters.period === "last-month"
          ? 0.94
          : 1;

  const channelBase: Record<
    EcommerceChannel,
    { revenue: number; orders: number; customers: number; conversion: number }
  > = {
    "all-channels": { revenue: 125000, orders: 840, customers: 320, conversion: 3.2 },
    "online-store": { revenue: 58000, orders: 410, customers: 180, conversion: 2.8 },
    marketplace: { revenue: 38000, orders: 260, customers: 95, conversion: 2.1 },
    social: { revenue: 18000, orders: 120, customers: 65, conversion: 1.8 },
    retail: { revenue: 11000, orders: 50, customers: 28, conversion: 4.5 },
  };

  const base = channelBase[filters.channel];

  return {
    revenue: Math.round(base.revenue * periodMultiplier * (0.9 + random() * 0.2)),
    orders: Math.round(base.orders * periodMultiplier * (0.9 + random() * 0.2)),
    customers: Math.round(base.customers * periodMultiplier * (0.9 + random() * 0.2)),
    conversion: Number((base.conversion * (0.9 + random() * 0.2)).toFixed(1)),
    revenueChange: Math.round((random() * 30 - 10) * (filters.period === "last-month" ? 0.8 : 1)),
    ordersChange: Math.round((random() * 25 - 8) * (filters.period === "last-month" ? 0.8 : 1)),
    customersChange: Math.round((random() * 20 - 5) * (filters.period === "last-month" ? 0.8 : 1)),
    conversionChange: Number((random() * 1.5 - 0.5).toFixed(1)),
  };
}

export function getPeriodLabel(period: EcommercePeriod): string {
  return PERIOD_CONFIG[period].label;
}

export function getChannelLabel(channel: EcommerceChannel): string {
  return CHANNEL_CONFIG[channel].label;
}

export function getChartYAxisMax(filters: EcommerceFilters): number {
  return CHANNEL_CONFIG[filters.channel].baseVisitors * (filters.period === "year-to-date" ? 3 : 2);
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}%`;
}

export function getPeriodTickFormat(filters: EcommercePeriod): "day" | "week" | "month" {
  if (filters === "year-to-date") return "month";
  if (filters === "last-30-days") return "week";
  return "day";
}
