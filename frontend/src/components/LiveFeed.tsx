import { useLiveFeed } from "../hooks/useLiveFeed";
import type { LiveEvent } from "../types";

// Color config per event type
const EVENT_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    "job.posted": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-400",
    },
    "job.filled": {
      bg: "bg-green-50",
      text: "text-green-700",
      dot: "bg-green-400",
    },
    "member.enrolled": {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      dot: "bg-indigo-400",
    },
    "member.churned": {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-400",
    },
    "payment.failed": {
      bg: "bg-orange-50",
      text: "text-orange-700",
      dot: "bg-orange-400",
    },
    "payment.recovered": {
      bg: "bg-teal-50",
      text: "text-teal-700",
      dot: "bg-teal-400",
    },
  };

const DEFAULT_STYLE = {
  bg: "bg-gray-50",
  text: "text-gray-700",
  dot: "bg-gray-400",
};

function EventRow({ event }: { event: LiveEvent }) {
  const style = EVENT_STYLES[event.event_type] ?? DEFAULT_STYLE;
  const time = new Date(event.occurred_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg ${style.bg} animate-fade-in`}
    >
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${style.text}`}>
          {event.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {event.source}
          </span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
      </div>
    </div>
  );
}

export default function LiveFeed() {
  const { events, connected } = useLiveFeed();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-800">Live Activity</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-gray-300"}`}
          />
          <span className="text-xs text-gray-400">
            {connected ? "Live" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Event list */}
      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            Waiting for events...
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
