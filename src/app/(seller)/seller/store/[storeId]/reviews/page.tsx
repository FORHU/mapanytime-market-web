"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, Send } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewsPage() {
  const params = useParams();
  const storeId = Array.isArray(params?.storeId)
    ? params.storeId[0]
    : params?.storeId || "";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Record<string, string>>({});

  useEffect(() => {
    if (storeId) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:3002/api/v1/reviews?storeId=${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setReviews(data || []))
        .catch(console.error);
    }
  }, [storeId]);

  const handlePostReply = async (reviewId: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3002/api/v1/reviews/${reviewId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: replyText.trim() }),
        },
      );
      if (response.ok) {
        setReplies((prev) => ({ ...prev, [reviewId]: replyText.trim() }));
        setActiveReplyId(null);
        setReplyText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-black text-slate-900">
        Customer Feedback Ledger
      </h1>
      {reviews.map((r) => (
        <div key={r.id} className="bg-white border p-5 rounded-2xl space-y-3">
          <div className="flex justify-between">
            <div>
              <h4 className="font-bold">{r.author}</h4>
              <span className="text-[10px] text-slate-400">{r.date}</span>
            </div>
            <div className="flex text-amber-500">
              {[...Array(r.rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
            &quot;{r.comment}&quot;
          </p>
          {replies[r.id] && (
            <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl">
              <strong>Response:</strong> {replies[r.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
