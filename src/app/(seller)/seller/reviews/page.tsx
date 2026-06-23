"use client";

import { Star, MessageSquare, Flag } from "lucide-react";

const reviewData = [
  {
    id: 1,
    author: "Budi S.",
    initial: "B",
    bg: "bg-emerald-500",
    item: "Organic Veg Bundle",
    date: "Jun 16",
    comment:
      "Freshest vegetables I've ever ordered online. Will definitely buy again!",
    rating: 5,
  },
  {
    id: 2,
    author: "Siti R.",
    initial: "S",
    bg: "bg-emerald-500",
    item: "Local Honey 500ml",
    date: "Jun 15",
    comment: "Pure and delicious. Exactly as described. Fast pickup too!",
    rating: 5,
  },
  {
    id: 3,
    author: "Ahmad F.",
    initial: "A",
    bg: "bg-emerald-500",
    item: "Cassava Chips 200g",
    date: "Jun 14",
    comment:
      "Crunchy and well-seasoned. Packaging could be better for delivery.",
    rating: 4,
  },
  {
    id: 4,
    author: "Dewi L.",
    initial: "D",
    bg: "bg-emerald-500",
    item: "Dragon Fruit Pack 1kg",
    date: "Jun 13",
    comment:
      "Beautiful ripe fruits, great value for the price. Seller is responsive.",
    rating: 5,
  },
  {
    id: 5,
    author: "Rian P.",
    initial: "R",
    bg: "bg-emerald-500",
    item: "Fresh Coconut Water",
    date: "Jun 12",
    comment:
      "Slightly less fresh than expected but still drinkable. Delivery was delayed.",
    rating: 3,
  },
  {
    id: 6,
    author: "Maya I.",
    initial: "M",
    bg: "bg-emerald-500",
    item: "Organic Veg Bundle",
    date: "Jun 11",
    comment: "Good selection of greens, very convenient pickup option.",
    rating: 4,
  },
];

const distribution = [
  { stars: 5, count: 3, width: "w-[50%]" },
  { stars: 4, count: 2, width: "w-[33%]" },
  { stars: 3, count: 1, width: "w-[17%]" },
  { stars: 2, count: 0, width: "w-0" },
  { stars: 1, count: 0, width: "w-0" },
];

export default function SellerReviewsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Matrix info matching dashboard weighting */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Reviews
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-0.5">
          6 reviews · 4.3 average rating
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* ── LEFT COLUMN: RATINGS BREAKDOWN ACCELERATOR CARD ── */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col items-center space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">
              4.3
            </h2>
            <div className="flex items-center justify-center gap-0.5 text-amber-400">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <Star className="w-4 h-4 text-slate-200" />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              out of 5
            </p>
          </div>

          {/* Graphical distribution row elements */}
          <div className="w-full space-y-2.5">
            {distribution.map((row) => (
              <div
                key={row.stars}
                className="flex items-center gap-3 text-xs font-bold text-slate-400"
              >
                <span className="w-3 flex items-center gap-1 text-slate-500">
                  {row.stars}{" "}
                  <span className="text-[9px] text-amber-400">★</span>
                </span>
                <div className="flex-1 h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full bg-amber-400 rounded-full ${row.width}`}
                  />
                </div>
                <span className="w-3 text-right text-slate-400 font-mono font-medium">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: FEED OF SCROLLABLE RESPONSE FEEDBACKS ── */}
        <div className="lg:col-span-2 space-y-4">
          {reviewData.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              {/* Profile Bar Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${review.bg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                  >
                    {review.initial}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-none">
                      {review.author}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                      {review.item}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-slate-100"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">
                    {review.date}
                  </span>
                </div>
              </div>

              {/* Review Text Body */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed tracking-tight pl-1">
                {review.comment}
              </p>

              {/* Action Toolbar row matching layout controls */}
              <div className="flex items-center gap-2 pt-1 pl-1">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-100 hover:border-slate-200 rounded-lg text-[11px] font-bold bg-slate-50/50 hover:bg-slate-50 text-emerald-600 transition-all shadow-2xs">
                  <MessageSquare className="w-3 h-3" />
                  Reply
                </button>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-100 hover:border-slate-200 rounded-lg text-[11px] font-bold bg-slate-50/50 hover:bg-slate-50 text-slate-400 hover:text-rose-600 transition-all shadow-2xs">
                  <Flag className="w-3 h-3" />
                  Flag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
