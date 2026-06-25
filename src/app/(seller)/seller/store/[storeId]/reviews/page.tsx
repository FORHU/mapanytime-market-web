"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, Reply, Loader2, Send, X } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewsPage() {
  const params = useParams();

  // Safe extraction for App Router params (handles string, string[], or undefined)
  const rawStoreId = params?.storeId;
  const storeId = Array.isArray(rawStoreId)
    ? rawStoreId[0]
    : (rawStoreId as string) || "STORE-9921";

  const [reviews, setReviews] = useState<Review[]>([]);

  // Interactive Reply States
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Local state tracking database simulation for merchant replies
  const [replies, setReplies] = useState<Record<string, string>>({
    "REV-01":
      "Thank you for the wonderful feedback! We take extra care with our bulalo packaging to battle the cold Baguio breeze. Enjoy your meal!",
  });

  useEffect(() => {
    // FIXED: Flush active workspace draft inputs to prevent layout bleeding across store switch transitions
    setActiveReplyId(null);
    setReplyText("");

    const mockDbReviews: Record<string, Review[]> = {
      "STORE-9921": [
        {
          id: "REV-01",
          author: "Janice M.",
          rating: 5,
          comment:
            "The Bulalo soup arrived piping hot in sturdy packaging. Perfect for the Baguio weather!",
          date: "Yesterday",
        },
        {
          id: "REV-02",
          author: "Ramon T.",
          rating: 4,
          comment:
            "Sisig portion sizes were good, but requested extra chilies were omitted. Will order again.",
          date: "3 days ago",
        },
      ],
      "STORE-4401": [
        {
          id: "REV-11",
          author: "Elena R.",
          rating: 5,
          comment:
            "Amazing cocktail mixers right to our beach lounge chair! Incredibly convenient system.",
          date: "2 hours ago",
        },
      ],
      "STORE-1120": [
        {
          id: "REV-21",
          author: "Mark L.",
          rating: 5,
          comment:
            "Authentic mechanical boards in pristine container condition. Fast handoff delivery loop.",
          date: "1 week ago",
        },
      ],
      "STORE-8873": [
        {
          id: "REV-31",
          author: "Sophia W.",
          rating: 3,
          comment:
            "Strawberries were sweet but a few items at the bottom of the container were slightly bruised.",
          date: "2 days ago",
        },
      ],
    };
    setReviews(mockDbReviews[storeId] || []);
  }, [storeId]);

  const handleOpenReplyBox = (reviewId: string) => {
    setActiveReplyId(reviewId);
    setReplyText(replies[reviewId] || "");
  };

  const handleCancelReply = () => {
    setActiveReplyId(null);
    setReplyText("");
  };

  const handlePostReply = async (reviewId: string) => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      setReplies((prev) => ({
        ...prev,
        [reviewId]: replyText.trim(),
      }));

      setActiveReplyId(null);
      setReplyText("");
    } catch (err) {
      console.error("Failed to commit response data transaction layout:", err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 p-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Customer Feedbacks
        </h1>
        <p className="text-xs font-bold text-slate-400 mt-0.5">
          Evaluate incoming reputation scores, monitor local user reviews, and
          compose feedback context replies.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const hasExistingReply = !!replies[review.id];
          const isCurrentlyReplying = activeReplyId === review.id;

          return (
            <div
              key={review.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    {review.author}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    Logged: {review.date} · Verified Checkout
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={`${review.id}-star-${i}`}
                      className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs font-bold text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                &quot;{review.comment}&quot;
              </p>

              {/* COMMITTED MERCHANT REPLY ELEMENT SHELL */}
              {hasExistingReply && !isCurrentlyReplying && (
                <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-3.5 space-y-1 ml-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                      Your Official Response
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenReplyBox(review.id)}
                      className="text-[10px] font-bold text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    {replies[review.id]}
                  </p>
                </div>
              )}

              {/* DYNAMIC INTERACTIVE REPLY EDITOR BOX */}
              {isCurrentlyReplying ? (
                <div className="space-y-2.5 ml-4 pt-1 animate-in slide-in-from-top-1 duration-200">
                  <textarea
                    rows={3}
                    value={replyText}
                    disabled={isSubmittingReply}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Compose professional business answer string context..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all resize-none"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      disabled={isSubmittingReply}
                      onClick={handleCancelReply}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[11px] rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingReply || !replyText.trim()}
                      onClick={() => handlePostReply(review.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReply ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>Transmit Response</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                !hasExistingReply && (
                  <button
                    type="button"
                    onClick={() => handleOpenReplyBox(review.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5" /> Compose Reply
                  </button>
                )
              )}
            </div>
          );
        })}

        {reviews.length === 0 && (
          <div className="py-12 text-center text-xs font-bold text-slate-400 italic bg-white border border-dashed border-slate-200 rounded-3xl">
            No customer evaluation logs have been registered for this business
            branch location yet.
          </div>
        )}
      </div>
    </div>
  );
}
