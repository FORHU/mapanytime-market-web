import { io, Socket } from "socket.io-client";
import { env } from "@/shared/lib/env";

/**
 * One socket per browser tab, shared by every feature that needs realtime.
 *
 * Each hook used to call `io(url)` for itself. That does not reuse a connection: socket.io-client
 * treats a repeat request for an already-connected namespace as a request for a *new* one, so
 * SellerLayout + useOrdersPipeline + useChatSync opened three separate transports per tab, each
 * with its own handshake, upgrade attempt and heartbeat. Reference-counting one connection makes
 * that a single transport regardless of how many hooks are mounted.
 *
 * Transports are left at the socket.io default (polling first, then upgrade). Forcing
 * `["websocket"]` — as the chat hook did — removes the fallback entirely, so any environment that
 * blocks websockets gets no realtime at all rather than degraded realtime.
 */
let socket: Socket | null = null;
let refCount = 0;

export function acquireSocket(): Socket {
  // A re-acquire cancels any teardown queued by the release that just ran (see releaseSocket).
  if (teardownTimer) {
    clearTimeout(teardownTimer);
    teardownTimer = null;
  }

  if (!socket) {
    socket = io(env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
      autoConnect: true,
      // Bounded backoff. The default retries forever with no ceiling on attempts, which turns a
      // misconfigured host into a permanent reconnect loop hammering the server.
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on("connect_error", (err) => {
      console.error(
        `[socket] connection to ${env.NEXT_PUBLIC_SOCKET_SERVER_URL} failed: ${err.message}`,
      );
    });
  }

  refCount += 1;
  return socket;
}

let teardownTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Call from the cleanup of whichever effect acquired it. The connection closes only once the
 * last consumer lets go, so navigating between pages that both use realtime doesn't tear down
 * and re-establish the transport.
 *
 * Teardown is deferred by a tick because React runs an effect's cleanup *before* the next
 * effect body. A hook keyed on `userId` or `channelId` therefore releases and re-acquires
 * back-to-back: without the delay the count hits 0 in between, killing a connection that is
 * about to be needed again a microtask later — and under StrictMode that happens on every mount
 * in development. The timer re-checks the count and bails if someone re-acquired.
 */
export function releaseSocket() {
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0) return;

  if (teardownTimer) clearTimeout(teardownTimer);
  teardownTimer = setTimeout(() => {
    teardownTimer = null;
    if (refCount === 0 && socket) {
      socket.disconnect();
      socket = null;
    }
  }, 0);
}
