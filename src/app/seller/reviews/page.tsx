"use client";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Star, MessageSquare } from "lucide-react";
import { useActiveStore } from "@/features/stores/hooks/useActiveStore";
import { useStoreReviews } from "@/features/reviews/hooks/useReviews";
import type { Review } from "@/features/reviews/contracts/review.contract";

/**
 * Tailwind's JIT can only see class names it can read literally, so the size
 * is picked from a lookup rather than interpolated — `w-${size}` compiles to
 * nothing and the stars render sizeless.
 */
const STAR_SIZES = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
} as const;

function Stars({
  rating,
  size = "md",
}: {
  rating: number;
  size?: keyof typeof STAR_SIZES;
}) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${STAR_SIZES[size]} ${
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-[var(--border-strong)]"
          }`}
        />
      ))}
    </span>
  );
}

function ReviewRow({ review }: { review: Review }) {
  return (
    <div className="py-4 border-b border-[var(--border-light)] last:border-0">
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <p className="font-bold text-sm text-[var(--text-primary)]">
          {review.buyer?.displayName ?? "A customer"}
        </p>
        <time className="text-xs text-[var(--text-tertiary)]">
          {new Date(review.createdAt).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
      <Stars rating={review.rating} size="sm" />
      {review.comment && (
        <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}

export default function ReviewsPage() {
  const { activeStoreId, isHydrated } = useActiveStore();
  const { data, isLoading, isError } = useStoreReviews(activeStoreId);

  const reviews = data?.items ?? [];

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Customer reviews
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          What customers say about your store.
        </p>
      </div>

      {isHydrated && !activeStoreId && (
        <Card>
          <CardContent className="p-8 text-center py-16 space-y-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Choose a store first
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Pick a store from the switcher to see its reviews.
            </p>
          </CardContent>
        </Card>
      )}

      {activeStoreId && (isLoading || !isHydrated) && (
        <Card>
          <CardContent className="p-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[var(--background-tertiary)] animate-pulse"
              />
            ))}
          </CardContent>
        </Card>
      )}

      {activeStoreId && isError && (
        <Card>
          <CardContent className="p-8 text-center py-16">
            <p className="text-sm text-rose-500">
              Could not load your reviews. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {activeStoreId && !isLoading && !isError && data && (
        <>
          <Card>
            <CardContent className="p-6 flex items-center gap-5">
              <div className="text-center shrink-0">
                <p className="text-4xl font-black text-[var(--text-primary)] tabular-nums">
                  {data.averageRating.toFixed(1)}
                </p>
                <Stars rating={data.averageRating} />
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                Based on {data.total} review{data.total === 1 ? "" : "s"} from
                customers who completed an order with you.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-[var(--text-tertiary)] opacity-40" />
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    No reviews yet
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                    Customers can review your store once they have completed an
                    order.
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewRow key={review.id} review={review} />
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
