"use client";

import { useMemo } from "react";

import { format, parse } from "date-fns";
import { ArrowUpRight, DollarSign, PackageCheck, ReceiptText, RotateCcw, ShoppingBag, Users } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { formatCurrency, formatPercent, generateKPIData, hashString, seededRandom } from "./ecommerce-filter-utils";
import { useEcommerceFilters } from "./ecommerce-filters-context";

const revenueBucketRanges = ["01-05", "06-10", "11-15", "16-20", "21-25", "26-31"] as const;

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

const revenueOverviewConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--foreground)",
  },
  profit: {
    label: "Profit",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

function formatMonthTick(value: string) {
  const parts = value.split(" ");
  const range = parts.at(-1);
  const month = parts.slice(0, -1).join(" ");

  return range === "11-15" ? month : "";
}

function formatTooltipLabel(value: string) {
  const parts = value.split(" ");
  const range = parts.at(-1);
  const month = parse(parts.slice(0, -1).join(" "), "MMM yy", new Date());
  const [start, end] = String(range).split("-");
  const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startDate = new Date(month.getFullYear(), month.getMonth(), Number(start));
  const endDate = new Date(month.getFullYear(), month.getMonth(), Math.min(Number(end), lastDayOfMonth));

  return `${format(month, "MMM")} ${format(startDate, "do")} - ${format(endDate, "do")}, ${format(month, "yyyy")}`;
}

function formatCurrencyTooltipValue(value: unknown) {
  return typeof value === "number" ? `$${value.toLocaleString()}` : String(value ?? "");
}

function generateChartData(filters: ReturnType<typeof useEcommerceFilters>) {
  const seed = hashString(filters.period + filters.channel + "chart");
  const random = seededRandom(seed);

  const currentMonth = new Date();
  currentMonth.setDate(1);

  const baseRevenueByChannel: Record<string, number> = {
    "all-channels": 6500,
    "online-store": 4200,
    marketplace: 3200,
    social: 2800,
    retail: 1800,
  };

  const baseRevenue = baseRevenueByChannel[filters.channel] || 5000;

  const trendMultipliers = {
    "this-month": { start: 0.9, end: 1.1, volatility: 0.15 },
    "last-month": { start: 0.95, end: 1.05, volatility: 0.1 },
    "last-30-days": { start: 0.85, end: 1.15, volatility: 0.2 },
    "year-to-date": { start: 0.7, end: 1.3, volatility: 0.25 },
  };

  const trend = trendMultipliers[filters.period] || trendMultipliers["this-month"];

  const revenueBucketValues: number[][] = [];
  const totalMonths = 12;

  for (let monthIdx = 0; monthIdx < totalMonths; monthIdx++) {
    const monthProgress = monthIdx / (totalMonths - 1);
    const monthTrend = trend.start + monthProgress * (trend.end - trend.start);
    const monthValues: number[] = [];

    for (let bucketIdx = 0; bucketIdx < 6; bucketIdx++) {
      const bucketProgress = bucketIdx / 5;
      const seasonalBoost = 0.9 + Math.sin(bucketProgress * Math.PI) * 0.2;
      const randomVariation = 0.85 + random() * 0.3;
      const revenue = Math.round(baseRevenue * monthTrend * seasonalBoost * randomVariation);
      monthValues.push(revenue);
    }

    revenueBucketValues.push(monthValues);
  }

  return revenueBucketValues.flatMap((values, index) => {
    const monthDate = new Date(currentMonth);
    monthDate.setMonth(currentMonth.getMonth() - (totalMonths - 1 - index));
    const monthLabel = `${monthFormatter.format(monthDate)} ${String(monthDate.getFullYear()).slice(-2)}`;

    return values.map((revenue, bucketIndex) => {
      const profitMargin = 0.22 + random() * 0.08;
      return {
        period: `${monthLabel} ${revenueBucketRanges[bucketIndex]}`,
        profit: Math.round(revenue * profitMargin),
        revenue,
      };
    });
  });
}

export function KpiStrip() {
  const filters = useEcommerceFilters();

  const adjustedChartData = useMemo(() => generateChartData(filters), [filters]);

  const kpiData = useMemo(() => generateKPIData(filters), [filters]);

  const avgOrderValue = Math.round(kpiData.revenue / kpiData.orders);
  const avgOrderChange = Math.round((Math.random() * 10 - 5) * 10) / 10;

  const adjustedData = useMemo(() => {
    return {
      totalSales: formatCurrency(kpiData.revenue),
      totalOrders: kpiData.orders.toLocaleString(),
      customerGrowth: kpiData.customers.toLocaleString(),
      avgOrder: formatCurrency(avgOrderValue),
      returnRequests: Math.round(kpiData.orders * 0.045).toLocaleString(),
      stockAccuracy: `${Math.min(99, Math.max(92, 95 + Math.round(Math.random() * 4)))}%`,
      salesChange: formatPercent(kpiData.revenueChange),
      ordersChange: formatPercent(kpiData.ordersChange),
      customerChange: formatPercent(kpiData.customersChange),
      avgOrderChange: `${avgOrderChange >= 0 ? "+" : ""}$${Math.abs(avgOrderChange)}`,
      returnsChange: formatPercent(Math.round(Math.random() * 6 - 2)),
      stockChange: `+${(1.5 + Math.random() * 2).toFixed(1)} pts`,
    };
  }, [kpiData, avgOrderValue, avgOrderChange]);

  const yAxisMax = useMemo(() => {
    const maxRevenue = Math.max(...adjustedChartData.map((d) => d.revenue));
    return Math.ceil((maxRevenue * 1.1) / 1000) * 1000;
  }, [adjustedChartData]);

  const yAxisMin = useMemo(() => {
    const minRevenue = Math.min(...adjustedChartData.map((d) => d.revenue));
    return Math.floor((minRevenue * 0.9) / 1000) * 1000;
  }, [adjustedChartData]);

  return (
    <div className="h-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 xl:col-span-12">
      <div>
        <div className="grid grid-cols-1 xl:grid-cols-12">
          <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-3 xl:col-span-5 xl:border-r">
            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Total Sales</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {adjustedData.totalSales}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <DollarSign className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span
                    className={kpiData.revenueChange >= 0 ? "text-green-700 dark:text-green-300" : "text-destructive"}
                  >
                    {adjustedData.salesChange}
                  </span>
                  <span className="text-muted-foreground"> vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Total Orders</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {adjustedData.totalOrders}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <ShoppingBag className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span
                    className={kpiData.ordersChange >= 0 ? "text-green-700 dark:text-green-300" : "text-destructive"}
                  >
                    {adjustedData.ordersChange}
                  </span>
                  <span className="text-muted-foreground"> vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Customer Growth</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {adjustedData.customerGrowth}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <Users className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span
                    className={kpiData.customersChange >= 0 ? "text-green-700 dark:text-green-300" : "text-destructive"}
                  >
                    {adjustedData.customerChange}
                  </span>
                  <span className="text-muted-foreground"> vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Average Order</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {adjustedData.avgOrder}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <ReceiptText className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className={avgOrderChange >= 0 ? "text-green-700 dark:text-green-300" : "text-destructive"}>
                    {adjustedData.avgOrderChange}
                  </span>
                  <span className="text-muted-foreground"> vs last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 border-border border-b ring-0 md:border-r md:border-b-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Return Requests</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {adjustedData.returnRequests}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <RotateCcw className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-destructive">{adjustedData.returnsChange}</span>
                  <span className="text-muted-foreground"> vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full rounded-none border-0 ring-0">
              <CardHeader>
                <CardTitle className="font-normal text-sm">Stock Accuracy</CardTitle>
                <CardDescription className="text-3xl text-foreground tabular-nums leading-none tracking-tight">
                  {adjustedData.stockAccuracy}
                </CardDescription>
                <CardAction className="grid size-6 place-items-center rounded-sm bg-muted">
                  <PackageCheck className="size-3 text-foreground" />
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-green-700 dark:text-green-300">{adjustedData.stockChange}</span>
                  <span className="text-muted-foreground"> vs last audit</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-full rounded-none border-0 ring-0 xl:col-span-7">
            <CardHeader>
              <CardTitle className="font-normal">Sales Overview</CardTitle>
              <CardAction>
                <ArrowUpRight className="size-4" />
              </CardAction>
            </CardHeader>

            <CardContent>
              <ChartContainer config={revenueOverviewConfig} className="h-74 w-full">
                <ComposedChart
                  accessibilityLayer
                  data={adjustedChartData}
                  margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                >
                  <defs>
                    <filter id="sales-line-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feFlood floodColor="var(--color-revenue)" floodOpacity="0.35" />
                      <feComposite in2="blur" operator="in" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid yAxisId="profit" vertical={false} />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    height={30}
                    interval={0}
                    minTickGap={0}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => formatMonthTick(String(value))}
                  />
                  <YAxis yAxisId="revenue" hide domain={[yAxisMin, yAxisMax]} />
                  <YAxis yAxisId="profit" hide domain={[0, Math.ceil(yAxisMax * 0.35)]} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-40"
                        labelFormatter={(value) => formatTooltipLabel(String(value))}
                        formatter={(value, name, item) => (
                          <>
                            <div
                              className="size-2.5 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                            <div className="flex flex-1 items-center justify-between leading-none">
                              <span className="text-muted-foreground">{String(name ?? "")}</span>
                              <span className="font-medium font-mono text-foreground tabular-nums">
                                {formatCurrencyTooltipValue(value)}
                              </span>
                            </div>
                          </>
                        )}
                      />
                    }
                    cursor={{
                      stroke: "var(--border)",
                      strokeDasharray: "4 4",
                    }}
                  />
                  <Bar
                    yAxisId="profit"
                    barSize={4}
                    dataKey="profit"
                    fill="var(--color-profit)"
                    name="Profit"
                    opacity={0.18}
                    radius={[6, 6, 0, 0]}
                  />
                  <Area
                    yAxisId="revenue"
                    dataKey="revenue"
                    fill="none"
                    filter="url(#sales-line-glow)"
                    name="Revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={1.8}
                    type="linear"
                    activeDot={{
                      r: 4,
                      fill: "var(--background)",
                      stroke: "var(--color-revenue)",
                      strokeWidth: 2,
                    }}
                    dot={false}
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
