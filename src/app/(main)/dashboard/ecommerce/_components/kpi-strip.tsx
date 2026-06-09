"use client";

import { useMemo } from "react";

import { format, parse } from "date-fns";
import { ArrowUpRight, DollarSign, PackageCheck, ReceiptText, RotateCcw, ShoppingBag, Users } from "lucide-react";
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { adjustCurrency, adjustNumber, adjustPercentChange } from "./ecommerce-filter-utils";
import { useEcommerceFilters } from "./ecommerce-filters-context";

const revenueBucketRanges = ["01-05", "06-10", "11-15", "16-20", "21-25", "26-31"] as const;

const revenueBucketValues = [
  [4820, 5150, 5060, 5520, 5990, 6880],
  [5140, 5360, 5520, 5860, 6120, 6720],
  [4920, 4680, 5150, 5360, 5720, 6150],
  [5480, 5920, 5660, 6180, 6340, 6660],
  [5840, 6220, 6480, 6110, 6680, 7230],
  [6280, 6740, 6960, 7120, 6780, 7240],
  [6820, 7240, 7680, 7410, 7920, 7810],
  [6040, 6420, 6150, 6860, 7080, 7090],
  [5860, 6120, 6340, 6080, 6620, 6900],
  [6520, 6840, 7060, 7420, 7160, 8280],
  [6980, 7320, 7640, 7160, 8040, 8620],
  [6900, 7400, 8100, 8600, 8200, 9360],
] as const;

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

function getRollingRevenueBuckets() {
  const currentMonth = new Date();
  currentMonth.setDate(1);

  return revenueBucketValues.map((values, index) => {
    const monthDate = new Date(currentMonth);
    monthDate.setMonth(currentMonth.getMonth() - (revenueBucketValues.length - 1 - index));

    return {
      month: `${monthFormatter.format(monthDate)} ${String(monthDate.getFullYear()).slice(-2)}`,
      values,
    };
  });
}

const revenueOverviewData = getRollingRevenueBuckets().flatMap(({ month, values }) =>
  values.map((revenue, index) => ({
    period: `${month} ${revenueBucketRanges[index]}`,
    profit: Math.round(revenue * (index % 3 === 0 ? 0.24 : index % 3 === 1 ? 0.28 : 0.26)),
    revenue,
  })),
);

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

function getAdjustedChartData(filters: ReturnType<typeof useEcommerceFilters>) {
  const multiplier =
    filters.period === "year-to-date"
      ? 0.9
      : filters.period === "last-30-days"
        ? 1.02
        : filters.period === "last-month"
          ? 0.94
          : 1;

  const channelMultiplier =
    filters.channel === "all-channels"
      ? 1
      : filters.channel === "online-store"
        ? 0.5
        : filters.channel === "marketplace"
          ? 0.35
          : filters.channel === "social"
            ? 0.2
            : 0.15;

  return revenueOverviewData.map((item) => ({
    ...item,
    revenue: Math.round(item.revenue * multiplier * channelMultiplier),
    profit: Math.round(item.profit * multiplier * channelMultiplier),
  }));
}

export function KpiStrip() {
  const filters = useEcommerceFilters();

  const adjustedChartData = useMemo(() => getAdjustedChartData(filters), [filters]);

  const adjustedData = useMemo(() => {
    const totalSales = adjustNumber(48560, filters);
    const totalOrders = adjustNumber(379, filters);
    const customerGrowth = adjustNumber(820, filters);
    const avgOrder = adjustNumber(128, filters);
    const returnRequests = adjustNumber(18, filters);
    const stockAccuracy = Math.min(99, Math.max(90, 97 + Math.floor(Math.random() * 3)));

    return {
      totalSales: `$${totalSales.toLocaleString()}`,
      totalOrders: totalOrders.toLocaleString(),
      customerGrowth: customerGrowth.toLocaleString(),
      avgOrder: `$${avgOrder}`,
      returnRequests: returnRequests.toLocaleString(),
      stockAccuracy: `${stockAccuracy}%`,
      salesChange: adjustPercentChange(15.8, filters),
      ordersChange: adjustPercentChange(8.3, filters),
      customerChange: adjustPercentChange(12.5, filters),
      avgOrderChange: `-$${adjustNumber(420, filters) / 100}`,
      returnsChange: adjustPercentChange(0.6, filters),
      stockChange: `+${(2.4 * (0.8 + Math.random() * 0.4)).toFixed(1)} pts`,
    };
  }, [filters]);

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
                  <span className="text-green-700 dark:text-green-300">{adjustedData.salesChange}</span>
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
                  <span className="text-green-700 dark:text-green-300">{adjustedData.ordersChange}</span>
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
                  <span className="text-green-700 dark:text-green-300">{adjustedData.customerChange}</span>
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
                  <span className="text-destructive">{adjustedData.avgOrderChange}</span>
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
                  <YAxis yAxisId="revenue" hide domain={[3000, 10_000]} />
                  <YAxis yAxisId="profit" hide domain={[0, 6000]} />
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
