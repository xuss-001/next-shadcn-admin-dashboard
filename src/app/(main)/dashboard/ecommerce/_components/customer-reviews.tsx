"use client";

import { useMemo } from "react";

import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { adjustNumber } from "./ecommerce-filter-utils";
import { useEcommerceFilters } from "./ecommerce-filters-context";

const customerInitials = ["EM", "OW", "NO", "MM"] as const;

export function CustomerReviews() {
  const filters = useEcommerceFilters();

  const { avgRating, reviewCount } = useMemo(() => {
    const baseRating = 4.6;
    const baseCount = 12800;

    const ratingMultiplier =
      filters.period === "year-to-date"
        ? 1.01
        : filters.period === "last-30-days"
          ? 1.02
          : filters.period === "last-month"
            ? 0.99
            : 1;

    const rating = Math.min(5, Math.round(baseRating * ratingMultiplier * 10) / 10);
    const count = adjustNumber(baseCount, filters);

    return {
      avgRating: rating.toFixed(1),
      reviewCount: count.toLocaleString(),
    };
  }, [filters]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Reviews</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {avgRating} average rating
        </CardDescription>
        <CardAction>
          <ArrowUpRight className="size-4" />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex gap-0.5 text-foreground">
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
                <Star className="size-3.5 fill-current" />
              </div>
              <div>
                <div className="font-medium text-sm">Melody Macy</div>
                <p className="mt-2 line-clamp-3 min-h-[4.5em] text-muted-foreground text-sm">
                  The linen overshirt arrived faster than expected and the fit was exactly right.
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <Button aria-label="Previous review" size="icon-xs" variant="outline">
                <ArrowLeft />
              </Button>
              <Button aria-label="Next review" size="icon-xs" variant="outline">
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="min-w-0">
            <div className="font-medium text-sm">{reviewCount} reviews</div>
            <div className="line-clamp-2 min-h-[3em] text-muted-foreground text-xs">Customers reviewed this period</div>
          </div>

          <AvatarGroup>
            {customerInitials.map((initials) => (
              <Avatar key={initials}>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            ))}

            <AvatarGroupCount>+42</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </CardContent>
    </Card>
  );
}
