// not used - backend reviews endpoint (/api/v1/reviews) not implemented
import { API_BASE_URL } from "@/shared/config/api";

export const getReviews = async (storeId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/reviews?storeId=${storeId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return response.json();
};

export const postReviewReply = async (reviewId: string, comment: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/v1/reviews/${reviewId}/reply`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ comment: comment.trim() }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to post reply.");
  }

  return response.json();
};
