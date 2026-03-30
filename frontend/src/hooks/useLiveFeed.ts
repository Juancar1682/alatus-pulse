import { useEffect, useState } from "react";
import type { LiveEvent } from "../types";

const WS_URL = "ws://localhost:8000/ws/live-feed";
const MAX_EVENTS = 20;

export function useLiveFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setConnected(true);
      console.log("LiveFeed connected");
    };

    ws.onmessage = (message) => {
      const event: LiveEvent = JSON.parse(message.data);

      setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
    };

    ws.onclose = () => {
      setConnected(false);
      console.log("LiveFeed disconnected");
    };

    ws.onerror = (err) => {
      console.error("LiveFeed error", err);
    };

    return () => ws.close();
  }, []);

  return { events, connected };
}
