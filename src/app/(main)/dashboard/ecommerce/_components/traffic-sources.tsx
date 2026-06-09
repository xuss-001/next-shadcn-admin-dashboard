"use client";

import { useMemo } from "react";

import { ArrowUpRight } from "lucide-react";
import { Bar, BarChart, LabelList, type LabelProps, XAxis, YAxis } from "recharts";
import { siEbay, siGoogle, siMeta, siShopify, siTiktok } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

import { generateTrafficSources, type TrafficSourceData } from "./ecommerce-filter-utils";
import { useEcommerceFilters } from "./ecommerce-filters-context";

const ICON_MAP: Record<string, typeof siMeta> = {
  meta: siMeta,
  google: siGoogle,
  shopify: siShopify,
  tiktok: siTiktok,
  ebay: siEbay,
};

const trafficSourcesConfig = {
  share: {
    label: "Visits",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type IconLabelProps = {
  height?: number | string;
  index?: number;
  width?: number | string;
  x?: number | string;
  y?: number | string;
  data?: TrafficSourceData[];
};

type SourceLabelProps = LabelProps & {
  index?: number;
  value?: number | string;
  data?: TrafficSourceData[];
};

function getNumber(value: number | string | undefined) {
  return typeof value === "number" ? value : Number(value);
}

function TrafficSourceIconLabel({ height, index, width, x, y, data }: IconLabelProps) {
  if (typeof index !== "number" || !data) {
    return null;
  }

  const source = data[index];
  const xValue = getNumber(x);
  const yValue = getNumber(y);
  const widthValue = getNumber(width);
  const heightValue = getNumber(height);

  if (
    !source ||
    Number.isNaN(xValue) ||
    Number.isNaN(yValue) ||
    Number.isNaN(widthValue) ||
    Number.isNaN(heightValue)
  ) {
    return null;
  }

  const icon = ICON_MAP[source.iconKey];
  if (!icon) {
    return null;
  }

  const iconSize = 16;
  const iconX = Math.max(xValue + 10, xValue + widthValue - iconSize - 10);
  const iconY = yValue + (heightValue - iconSize) / 2;

  return (
    <foreignObject height={iconSize} x={iconX} y={iconY} width={iconSize}>
      <SimpleIcon icon={icon} className="size-4 fill-foreground" />
    </foreignObject>
  );
}

function TrafficSourceNameLabel({ height, index, x, y, data }: SourceLabelProps) {
  if (typeof index !== "number" || !data) {
    return null;
  }

  const source = data[index];
  const xValue = getNumber(x);
  const yValue = getNumber(y);
  const heightValue = getNumber(height);

  if (!source || Number.isNaN(xValue) || Number.isNaN(yValue) || Number.isNaN(heightValue)) {
    return null;
  }

  return (
    <text dominantBaseline="middle" textAnchor="start" x={2} y={yValue + heightValue / 2}>
      <tspan className="fill-foreground font-medium" fontSize={13} x={2} y={yValue + heightValue / 2 - 7}>
        {source.name}
      </tspan>
      <tspan className="fill-muted-foreground" fontSize={12} x={2} y={yValue + heightValue / 2 + 11}>
        {source.visits}
      </tspan>
    </text>
  );
}

function TrafficSourceChangeLabel({ height, value, y }: SourceLabelProps) {
  const yValue = getNumber(y);
  const heightValue = getNumber(height);

  if (typeof value !== "string" || Number.isNaN(yValue) || Number.isNaN(heightValue)) {
    return null;
  }

  const isNegative = value.startsWith("-");

  return (
    <text
      className={isNegative ? "fill-destructive" : "fill-green-700 dark:fill-green-300"}
      dominantBaseline="middle"
      dx={-6}
      fontSize={13}
      textAnchor="end"
      x="100%"
      y={yValue + heightValue / 2}
    >
      {value}
    </text>
  );
}

export function TrafficSources() {
  const filters = useEcommerceFilters();

  const adjustedData = useMemo(() => generateTrafficSources(filters), [filters]);

  const totalVisits = useMemo(
    () => adjustedData.reduce((sum, s) => sum + parseInt(s.visits.replace(",", ""), 10), 0),
    [adjustedData],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Traffic Sources</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {(totalVisits / 1000).toFixed(1)}K visits
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent>
        <ChartContainer config={trafficSourcesConfig} className="h-54 w-full">
          <BarChart
            accessibilityLayer
            barCategoryGap={12}
            data={adjustedData}
            layout="vertical"
            margin={{ bottom: 0, left: 100, right: 50, top: 0 }}
          >
            <defs>
              <pattern
                height="4"
                id="ecommerce-traffic-source-background-pattern"
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
                width="4"
              >
                <rect height="6" width="6" fill="var(--muted)" fillOpacity="0.5" />
                <line
                  stroke="var(--muted-foreground)"
                  strokeOpacity="0.10"
                  strokeWidth="1.25"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="6"
                />
              </pattern>
            </defs>
            <XAxis dataKey="share" domain={[0, 100]} hide type="number" />
            <YAxis dataKey="name" hide type="category" />
            <Bar
              background={{ fill: "url(#ecommerce-traffic-source-background-pattern)", radius: 8 }}
              barSize={36}
              dataKey="share"
              fill="var(--color-share)"
              fillOpacity={0.5}
              name="Visits"
              radius={8}
              stroke="var(--color-share)"
              strokeOpacity={0.1}
              strokeWidth={0.5}
            >
              <LabelList content={<TrafficSourceNameLabel data={adjustedData} />} dataKey="name" />
              <LabelList content={<TrafficSourceIconLabel data={adjustedData} />} dataKey="share" />
              <LabelList content={<TrafficSourceChangeLabel />} dataKey="change" />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
