// not used - backend REST route /api/channels/:id/messages not implemented, and
// nothing mounts this hook. The socket half would work as written (join_chat_room
// and chat:message both match the API); it is the history fetch that has no
// endpoint behind it. See FLAGS.md.
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Socket } from "socket.io-client";
import { acquireSocket, releaseSocket } from "@/shared/lib/socket";
import { socketBackedQueryOptions } from "@/shared/lib/query-options";

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  text: string;
  status: "SENT" | "DELIVERED" | "READ" | string;
  createdAt: string;
}

export interface ChatMessagePayload {
  roomId: string;
  senderId: string;
  senderName: string;
  body: string;
  sentAt: string;
  metadata?: Record<string, unknown>;
}

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
    ...socketBackedQueryOptions,
  });

  useEffect(() => {
    if (!channelId) return;

    const targetCacheKey = ["messages", channelId];
    const socket: Socket = acquireSocket();

    const handleConnect = () => {
      socket.emit("join_chat_room", channelId);
    };

    // Already-connected shared socket emits no further "connect" event.
    if (socket.connected) handleConnect();
    socket.on("connect", handleConnect);

    const handleMessage = (payload: ChatMessagePayload) => {
      const liveMessage: ChatMessage = {
        id:
          (payload.metadata?.id as string) ||
          `msg-${Date.now()}-${Math.random()}`,
        channelId: payload.roomId,
        senderId: payload.senderId,
        text: payload.body,
        status: "SENT",
        createdAt: payload.sentAt,
      };

      queryClient.setQueryData<ChatMessage[]>(targetCacheKey, (old) => {
        const currentHistory = old ?? [];
        if (currentHistory.some((m) => m.id === liveMessage.id)) {
          return currentHistory;
        }
        return [...currentHistory, liveMessage];
      });
    };

    const handleDisconnect = () => {
      queryClient.invalidateQueries({ queryKey: targetCacheKey });
    };

    socket.on("chat:message", handleMessage);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.emit("leave_chat_room", channelId);
      socket.off("connect", handleConnect);
      socket.off("chat:message", handleMessage);
      socket.off("disconnect", handleDisconnect);
      releaseSocket();
    };
  }, [channelId, queryClient]);

  return query;
};
