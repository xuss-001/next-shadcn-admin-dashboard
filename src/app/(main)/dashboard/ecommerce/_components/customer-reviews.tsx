"use client";

import { useMemo } from "react";

import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { hashString, seededRandom } from "./ecommerce-filter-utils";
import { useEcommerceFilters } from "./ecommerce-filters-context";

interface Review {
  name: string;
  rating: number;
  text: string;
}

const BASE_REVIEWS: Record<string, Review[]> = {
  "all-channels": [
    {
      name: "Melody Macy",
      rating: 5,
      text: "The linen overshirt arrived faster than expected and the fit was exactly right. The quality is outstanding!",
    },
    {
      name: "John Smith",
      rating: 4,
      text: "Great product overall. The tote bag is spacious and well-made. Only minor issue is the shipping took a bit long.",
    },
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "Absolutely love the ceramic planter! It's even more beautiful in person. Will definitely order again.",
    },
    {
      name: "Mike Chen",
      rating: 4,
      text: "The wool sweater is warm and comfortable. Sizing runs a bit large, but overall very happy with the purchase.",
    },
  ],
  "online-store": [
    {
      name: "Emma Wilson",
      rating: 5,
      text: "The online shopping experience was seamless. The linen overshirt fits perfectly and the fabric is luxurious.",
    },
    {
      name: "David Brown",
      rating: 5,
      text: "Fast delivery and excellent packaging. The cotton t-shirt is super soft and holds up well after washing.",
    },
    {
      name: "Lisa Anderson",
      rating: 4,
      text: "Great quality products. The wool sweater is cozy and stylish. Wish there were more color options.",
    },
    {
      name: "Tom Martinez",
      rating: 5,
      text: "Best online store experience! The linen overshirt is my new favorite piece. Highly recommend!",
    },
  ],
  marketplace: [
    {
      name: "Robert Taylor",
      rating: 4,
      text: "Good value for money. The ceramic planter arrived well-packaged and looks great in my living room.",
    },
    {
      name: "Jennifer Lee",
      rating: 5,
      text: "Excellent find! The bamboo cutlery set is eco-friendly and durable. Perfect for my lunch box.",
    },
    {
      name: "Chris Martin",
      rating: 3,
      text: "Decent quality for the price. The scented candle smells nice but doesn't last as long as I hoped.",
    },
    {
      name: "Amy White",
      rating: 4,
      text: "Solid purchase. The planter is exactly as described. Would buy from this seller again.",
    },
  ],
  social: [
    {
      name: "Sophie Reynolds",
      rating: 5,
      text: "Obsessed with my new tote bag! The quality is amazing and I get compliments everywhere I go.",
    },
    {
      name: "Jake Thompson",
      rating: 5,
      text: "The silk scarf is stunning! The colors are vibrant and the material feels luxurious. Perfect gift!",
    },
    {
      name: "Olivia Green",
      rating: 4,
      text: "Love the leather wallet! It's slim yet holds everything I need. The craftsmanship is impressive.",
    },
    {
      name: "Noah Scott",
      rating: 5,
      text: "The tote bag is perfect for everyday use. Roomy, stylish, and well-made. Worth every penny!",
    },
  ],
  retail: [
    {
      name: "Grace Kim",
      rating: 4,
      text: "Tried on the linen overshirt in-store and had to have it. The fabric is breathable and the cut is flattering.",
    },
    {
      name: "Henry Adams",
      rating: 5,
      text: "The store staff was super helpful. The wool sweater fits perfectly and is incredibly warm.",
    },
    {
      name: "Iris Campbell",
      rating: 4,
      text: "Great in-store experience. The bamboo cutlery set is exactly what I was looking for.",
    },
    {
      name: "Jack Nelson",
      rating: 5,
      text: "Love shopping here! The ceramic planter is beautiful and the quality is top-notch.",
    },
  ],
};

const BASE_RATINGS: Record<string, number> = {
  "all-channels": 4.6,
  "online-store": 4.7,
  marketplace: 4.3,
  social: 4.8,
  retail: 4.5,
};

const BASE_REVIEW_COUNTS: Record<string, number> = {
  "all-channels": 12800,
  "online-store": 8200,
  marketplace: 5600,
  social: 4200,
  retail: 3800,
};

const PERIOD_MULTIPLIERS: Record<string, number> = {
  "this-month": 1,
  "last-month": 0.92,
  "last-30-days": 1.05,
  "year-to-date": 11.5,
};

const customerInitials = ["EM", "OW", "NO", "MM"] as const;

export function CustomerReviews() {
  const filters = useEcommerceFilters();

  const { avgRating, reviewCount, featuredReview, avatarCount } = useMemo(() => {
    const seed = hashString(filters.period + filters.channel + "reviews");
    const random = seededRandom(seed);

    const baseRating = BASE_RATINGS[filters.channel] || BASE_RATINGS["all-channels"];
    const baseCount = BASE_REVIEW_COUNTS[filters.channel] || BASE_REVIEW_COUNTS["all-channels"];
    const reviews = BASE_REVIEWS[filters.channel] || BASE_REVIEWS["all-channels"];

    const periodMultiplier = PERIOD_MULTIPLIERS[filters.period] || 1;
    const ratingVariation = -0.1 + random() * 0.3;
    const rating = Math.min(5, Math.max(1, Math.round((baseRating + ratingVariation) * 10) / 10));
    const countVariation = 0.85 + random() * 0.3;
    const count = Math.round(baseCount * periodMultiplier * countVariation);

    const reviewIndex = Math.floor(random() * reviews.length);
    const featured = reviews[reviewIndex];

    const avatars = Math.max(
      3,
      Math.min(10, Math.round(42 * countVariation * (filters.channel === "all-channels" ? 1 : 0.6))),
    );

    return {
      avgRating: rating.toFixed(1),
      reviewCount: count.toLocaleString(),
      featuredReview: featured,
      avatarCount: avatars,
    };
  }, [filters]);

  const fullStars = Math.floor(parseFloat(avgRating));
  const hasHalfStar = parseFloat(avgRating) % 1 >= 0.5;

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
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${i < fullStars ? "fill-current" : i === fullStars && hasHalfStar ? "fill-current opacity-50" : ""}`}
                  />
                ))}
              </div>
              <div>
                <div className="font-medium text-sm">{featuredReview.name}</div>
                <p className="mt-2 line-clamp-3 min-h-[4.5em] text-muted-foreground text-sm">{featuredReview.text}</p>
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

            <AvatarGroupCount>+{avatarCount}</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </CardContent>
    </Card>
  );
}
