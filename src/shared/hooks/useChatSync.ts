import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  status: "SENT" | "DELIVERED" | "READ" | string;
  createdAt: string;
}

/* ==========================================================
   CHAT WEBSOCKET TYPES (Awaiting Backend Deployment)
   ==========================================================
interface ChatWebSocketPayload {
  type: "MESSAGE_RECEIVED" | "MESSAGE_UPDATED" | "MESSAGE_DELETED";
  data: ChatMessage;
}
========================================================== */

export const useChatSync = (channelId: string) => {
  const queryClient = useQueryClient();

  // Stable inline reference for the query hook
  const baselineCacheKey = ["messages", channelId];

  // Fetch baseline message history via standard REST API
  const query = useQuery<ChatMessage[], Error>({
    queryKey: baselineCacheKey,
    queryFn: async () => {
      const res = await fetch(`/api/channels/${channelId}/messages`);
      if (!res.ok) throw new Error("Chat history sync failure.");
      return res.json();
    },
    // Set to 5 seconds to allow regular poll syncs until backend sockets are ready
    staleTime: 5000,
  });

  /* ==========================================================
     REAL-TIME CHAT WEBSOCKET PIPELINE (Awaiting Backend Deployment)
     ==========================================================
  useEffect(() => {
    if (!channelId) return;

    const targetCacheKey = ["messages", channelId];

    const baseSocketUrl =
      process.env.NEXT_PUBLIC_WS_CHAT_URL || "wss://api.mapcentral.io/chat";
    const socketUrl = `${baseSocketUrl}?channelId=${channelId}`;

    let ws: WebSocket;
    let reconnectionTimeout: NodeJS.Timeout;
    let isExplicitDisconnect = false;

    const connectChatSocket = () => {
      ws = new WebSocket(socketUrl);

      ws.onmessage = (event) => {
        try {
          const payload: ChatWebSocketPayload = JSON.parse(event.data);
          if (!payload) return;

          const liveMessage = payload.data;

          queryClient.setQueryData<ChatMessage[]>(targetCacheKey, (old) => {
            const currentHistory = old ?? [];

            switch (payload.type) {
              case "MESSAGE_RECEIVED":
                if (currentHistory.some((m) => m.id === liveMessage.id)) {
                  return currentHistory;
                }
                return [...currentHistory, liveMessage];

              case "MESSAGE_UPDATED":
                return currentHistory.map((m) =>
                  m.id === liveMessage.id ? liveMessage : m,
                );

              case "MESSAGE_DELETED":
                return currentHistory.filter((m) => m.id !== liveMessage.id);

              default:
                return currentHistory;
            }
          });
        } catch (err) {
          console.error("Failed to parse chat message event:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("Chat WebSocket stream error:", err);
      };

      ws.onclose = () => {
        if (isExplicitDisconnect) return;

        console.warn(
          "Chat stream disconnected unexpectedly. Re-fetching historical baseline...",
        );

        queryClient.invalidateQueries({ queryKey: targetCacheKey });

        reconnectionTimeout = setTimeout(() => {
          connectChatSocket();
        }, 3000);
      };
    };

    connectChatSocket();

    return () => {
      isExplicitDisconnect = true;
      if (ws) ws.close();
      clearTimeout(reconnectionTimeout);
    };
  }, [channelId, queryClient]);
  ========================================================== */

  return query;
};
