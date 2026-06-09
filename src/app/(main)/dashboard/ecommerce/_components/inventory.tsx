"use client";

import { useMemo } from "react";

import { ArrowUpRight, PackageCheck, PackageX, TriangleAlert } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

import { hashString, seededRandom } from "./ecommerce-filter-utils";
import { useEcommerceFilters } from "./ecommerce-filters-context";

const chartConfig = {
  "in-stock": {
    label: "In stock",
    color: "var(--chart-2)",
  },
  "low-stock": {
    label: "Low stock",
    color: "var(--chart-1)",
  },
  "out-of-stock": {
    label: "Out of stock",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

const BASE_INVENTORY: Record<string, { inStock: number; lowStock: number; outOfStock: number }> = {
  "all-channels": { inStock: 760, lowStock: 320, outOfStock: 160 },
  "online-store": { inStock: 520, lowStock: 180, outOfStock: 80 },
  marketplace: { inStock: 380, lowStock: 220, outOfStock: 120 },
  social: { inStock: 280, lowStock: 160, outOfStock: 180 },
  retail: { inStock: 620, lowStock: 280, outOfStock: 100 },
};

const PERIOD_INVENTORY_ADJUST: Record<string, { inStock: number; lowStock: number; outOfStock: number }> = {
  "this-month": { inStock: 1.0, lowStock: 1.0, outOfStock: 1.0 },
  "last-month": { inStock: 0.95, lowStock: 1.1, outOfStock: 1.15 },
  "last-30-days": { inStock: 1.02, lowStock: 0.98, outOfStock: 0.9 },
  "year-to-date": { inStock: 0.85, lowStock: 1.3, outOfStock: 1.5 },
};

const gaugeSegmentCount = 32;

export function Inventory() {
  const filters = useEcommerceFilters();

  const { availablePercent, gaugeSegments, inventorySummary } = useMemo(() => {
    const seed = hashString(filters.period + filters.channel + "inventory");
    const random = seededRandom(seed);

    const base = BASE_INVENTORY[filters.channel] || BASE_INVENTORY["all-channels"];
    const periodAdj = PERIOD_INVENTORY_ADJUST[filters.period] || PERIOD_INVENTORY_ADJUST["this-month"];

    const variation = () => 0.9 + random() * 0.2;

    const inStock = Math.round(base.inStock * periodAdj.inStock * variation());
    const lowStock = Math.round(base.lowStock * periodAdj.lowStock * variation());
    const outOfStock = Math.round(base.outOfStock * periodAdj.outOfStock * variation());

    const total = inStock + lowStock + outOfStock;
    const available = total > 0 ? Math.round((inStock / total) * 100) : 0;

    const inStockSegs = Math.round((inStock / total) * gaugeSegmentCount);
    const lowStockSegs = Math.round((lowStock / total) * gaugeSegmentCount);
    const segs = Array.from({ length: gaugeSegmentCount }, (_, index) => {
      const status =
        index < inStockSegs ? "in-stock" : index < inStockSegs + lowStockSegs ? "low-stock" : "out-of-stock";

      return {
        fill: `var(--color-${status})`,
        id: `segment-${index + 1}`,
        status,
        value: 1,
      };
    });

    const summary = [
      {
        icon: PackageCheck,
        label: "In stock",
        value: inStock,
      },
      {
        icon: TriangleAlert,
        label: "Low stock",
        value: lowStock,
      },
      {
        icon: PackageX,
        label: "Out",
        value: outOfStock,
      },
    ] as const;

    return {
      availablePercent: available,
      gaugeSegments: segs,
      inventorySummary: summary,
    };
  }, [filters]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Inventory</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {availablePercent}% available
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChartContainer config={chartConfig} className="mx-auto h-30 w-full">
          <PieChart>
            <Pie
              cx="50%"
              cy="100%"
              cornerRadius={6}
              data={gaugeSegments}
              dataKey="value"
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              startAngle={180}
              stroke="var(--card)"
              strokeWidth={1}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
                        <tspan
                          className="fill-foreground font-medium text-2xl tabular-nums"
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                        >
                          {availablePercent}%
                        </tspan>
                        <tspan className="fill-muted-foreground text-xs" x={viewBox.cx} y={(viewBox.cy || 0) + 38}>
                          Available
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <Separator />

        <div className="grid grid-cols-3 divide-x">
          {inventorySummary.map((item, _index) => (
            <div key={item.label} className="flex flex-col items-center gap-3 text-center">
              <div className="grid size-9 place-items-center rounded-full bg-muted">
                <item.icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-muted-foreground text-xs leading-none">{item.label}</div>
                <div className="font-medium text-sm tabular-nums">{item.value.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
