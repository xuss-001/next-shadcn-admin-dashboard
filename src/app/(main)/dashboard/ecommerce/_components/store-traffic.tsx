"use client";

import { useMemo } from "react";

import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { generateTrafficData, getChartYAxisMax } from "./ecommerce-filter-utils";
import { useEcommerceFilters } from "./ecommerce-filters-context";

const trafficConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--chart-3)",
  },
  anomalies: {
    label: "Anomalies",
    color: "var(--destructive)",
  },
} satisfies ChartConfig;

function formatTrafficTooltipLabel(value: string) {
  return format(new Date(value), "h:mm a, do MMMM yyyy");
}

export function StoreTraffic() {
  const filters = useEcommerceFilters();

  const trafficData = useMemo(() => generateTrafficData(filters), [filters]);

  const totalVisits = useMemo(() => trafficData.reduce((sum, item) => sum + item.visitors, 0), [trafficData]);

  const yAxisMax = useMemo(() => getChartYAxisMax(filters), [filters]);

  const firstTrafficTimestamp = trafficData[0].timestamp;
  const lastTrafficTimestamp = trafficData.at(-1)?.timestamp ?? "";

  function formatTrafficTick(value: string) {
    if (value === firstTrafficTimestamp) {
      return filters.period === "year-to-date" ? "Start" : "24h ago";
    }

    return value === lastTrafficTimestamp ? "now" : "";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Store Traffic</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {(totalVisits / 1000).toFixed(1)}K visits
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={trafficConfig} className="h-54 w-full">
          <AreaChart accessibilityLayer data={trafficData} margin={{ bottom: 0, left: 0, right: 0, top: 8 }}>
            <defs>
              <linearGradient id="fillVisitors" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="timestamp"
              tick={{ fontSize: 11 }}
              tickFormatter={formatTrafficTick}
              tickLine={false}
              tickMargin={10}
              ticks={[trafficData[0].timestamp, trafficData.at(-1)?.timestamp ?? ""]}
            />
            <YAxis
              axisLine={false}
              domain={[0, yAxisMax]}
              tickLine={false}
              tickMargin={6}
              width={36}
              yAxisId="traffic"
            />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={(value) => formatTrafficTooltipLabel(String(value))} />}
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            />
            <ChartLegend align="right" verticalAlign="top" className="justify-end" content={<ChartLegendContent />} />
            <Area
              dataKey="visitors"
              dot={false}
              fill="url(#fillVisitors)"
              stroke="var(--color-visitors)"
              strokeWidth={2}
              type="stepAfter"
              yAxisId="traffic"
            />
            <Line
              dataKey="anomalies"
              dot={false}
              stroke="var(--color-anomalies)"
              strokeLinecap="round"
              strokeWidth={1.2}
              type="stepAfter"
              yAxisId="traffic"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
