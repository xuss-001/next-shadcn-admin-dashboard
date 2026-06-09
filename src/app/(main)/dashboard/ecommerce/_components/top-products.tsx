"use client";

import { useMemo } from "react";

import { ArrowUpRight } from "lucide-react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { formatCurrency, hashString, seededRandom } from "./ecommerce-filter-utils";
import { useEcommerceFilters } from "./ecommerce-filters-context";

interface Category {
  name: string;
  share: number;
  color: string;
}

interface Product {
  name: string;
  category: string;
  share: string;
  sales: string;
}

const CATEGORY_COLORS = ["var(--chart-3)", "var(--chart-2)", "var(--chart-1)", "var(--chart-4)", "var(--chart-5)"];

const BASE_CATEGORIES: Record<string, { name: string; baseShare: number }[]> = {
  "all-channels": [
    { name: "Apparel", baseShare: 44 },
    { name: "Accessories", baseShare: 32 },
    { name: "Home", baseShare: 24 },
  ],
  "online-store": [
    { name: "Apparel", baseShare: 52 },
    { name: "Accessories", baseShare: 30 },
    { name: "Home", baseShare: 18 },
  ],
  marketplace: [
    { name: "Home", baseShare: 40 },
    { name: "Apparel", baseShare: 35 },
    { name: "Accessories", baseShare: 25 },
  ],
  social: [
    { name: "Accessories", baseShare: 48 },
    { name: "Apparel", baseShare: 36 },
    { name: "Home", baseShare: 16 },
  ],
  retail: [
    { name: "Apparel", baseShare: 48 },
    { name: "Home", baseShare: 28 },
    { name: "Accessories", baseShare: 24 },
  ],
};

const BASE_PRODUCTS: Record<string, { name: string; category: string; baseSales: number }[]> = {
  "all-channels": [
    { name: "Linen Overshirt", category: "Apparel", baseSales: 14820 },
    { name: "Everyday Tote", category: "Accessories", baseSales: 11460 },
    { name: "Ceramic Planter", category: "Home", baseSales: 8930 },
    { name: "Wool Sweater", category: "Apparel", baseSales: 7650 },
    { name: "Leather Wallet", category: "Accessories", baseSales: 6230 },
  ],
  "online-store": [
    { name: "Linen Overshirt", category: "Apparel", baseSales: 18200 },
    { name: "Wool Sweater", category: "Apparel", baseSales: 12400 },
    { name: "Everyday Tote", category: "Accessories", baseSales: 9800 },
    { name: "Cotton T-Shirt", category: "Apparel", baseSales: 7200 },
    { name: "Ceramic Planter", category: "Home", baseSales: 5600 },
  ],
  marketplace: [
    { name: "Ceramic Planter", category: "Home", baseSales: 16500 },
    { name: "Linen Overshirt", category: "Apparel", baseSales: 12300 },
    { name: "Bamboo Cutlery Set", category: "Home", baseSales: 9800 },
    { name: "Everyday Tote", category: "Accessories", baseSales: 7200 },
    { name: "Scented Candle", category: "Home", baseSales: 5400 },
  ],
  social: [
    { name: "Everyday Tote", category: "Accessories", baseSales: 22000 },
    { name: "Leather Wallet", category: "Accessories", baseSales: 18500 },
    { name: "Linen Overshirt", category: "Apparel", baseSales: 12000 },
    { name: "Silk Scarf", category: "Accessories", baseSales: 9800 },
    { name: "Wool Sweater", category: "Apparel", baseSales: 7200 },
  ],
  retail: [
    { name: "Linen Overshirt", category: "Apparel", baseSales: 15600 },
    { name: "Ceramic Planter", category: "Home", baseSales: 11200 },
    { name: "Wool Sweater", category: "Apparel", baseSales: 9800 },
    { name: "Everyday Tote", category: "Accessories", baseSales: 7600 },
    { name: "Bamboo Cutlery Set", category: "Home", baseSales: 5200 },
  ],
};

export function TopProducts() {
  const filters = useEcommerceFilters();

  const { categories, products, totalSalesPercent } = useMemo(() => {
    const seed = hashString(filters.period + filters.channel + "products");
    const random = seededRandom(seed);

    const periodMultiplier =
      filters.period === "year-to-date"
        ? 11.5
        : filters.period === "last-30-days"
          ? 1.05
          : filters.period === "last-month"
            ? 0.92
            : 1;

    const baseCategories = BASE_CATEGORIES[filters.channel] || BASE_CATEGORIES["all-channels"];
    const adjustedCategories: Category[] = baseCategories
      .map((cat, idx) => {
        const variation = 0.85 + random() * 0.3;
        return {
          name: cat.name,
          share: Math.round(cat.baseShare * variation),
          color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        };
      })
      .sort((a, b) => b.share - a.share);

    const totalShare = adjustedCategories.reduce((sum, c) => sum + c.share, 0);
    if (totalShare !== 100) {
      const diff = 100 - totalShare;
      adjustedCategories[0] = { ...adjustedCategories[0], share: adjustedCategories[0].share + diff };
    }

    const baseProducts = BASE_PRODUCTS[filters.channel] || BASE_PRODUCTS["all-channels"];
    const totalChannelSales = baseProducts.reduce((sum, p) => sum + p.baseSales, 0);

    const adjustedProducts: Product[] = baseProducts
      .map((p) => {
        const variation = 0.85 + random() * 0.3;
        const sales = Math.round(p.baseSales * periodMultiplier * variation);
        const share = Math.round((sales / (totalChannelSales * periodMultiplier)) * 100);
        return {
          name: p.name,
          category: p.category,
          share: `${share}%`,
          sales: formatCurrency(sales),
        };
      })
      .sort((a, b) => parseInt(b.sales.replace(/[$,]/g, ""), 10) - parseInt(a.sales.replace(/[$,]/g, ""), 10))
      .slice(0, 3);

    const basePercent = 68 + Math.round(random() * 12);

    return {
      categories: adjustedCategories,
      products: adjustedProducts,
      totalSalesPercent: basePercent,
    };
  }, [filters]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Top Products</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalSalesPercent}% of sales
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div aria-label="Sales by category" className="flex h-2 gap-1 overflow-hidden bg-muted" role="img">
            {categories.map((category) => (
              <div
                aria-hidden="true"
                key={category.name}
                className="rounded-md"
                style={{
                  backgroundColor: category.color,
                  width: `${category.share}%`,
                }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <div className="flex items-center gap-1" key={category.name}>
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-muted-foreground text-xs">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-3">
          <div className="text-muted-foreground text-xs">Products</div>
          <div className="text-muted-foreground text-xs">Share</div>
          <div className="text-muted-foreground text-xs">Sales</div>

          {products.map((product) => (
            <div className="contents text-sm" key={product.name}>
              <div className="min-w-0">
                <div className="truncate font-medium">{product.name}</div>
                <div className="text-muted-foreground text-xs">{product.category}</div>
              </div>
              <div className="self-center text-muted-foreground tabular-nums">{product.share}</div>
              <div className="self-center font-medium tabular-nums">{product.sales}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
