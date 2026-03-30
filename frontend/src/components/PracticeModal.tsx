import { useEffect, useState } from "react";
import { fetchPracticeById } from "../services/api";
import type { Practice, PracticeEventType } from "../types";
import { X, Briefcase, Users, AlertCircle } from "lucide-react";

// Health score color
function healthColor(score: number) {
  if (score >= 70) return "text-green-600 bg-green-50";
  if (score >= 40) return "text-yellow-600 bg-yellow-50";
  return "text-red-600 bg-red-50";
}

// Event type badge color
const EVENT_COLORS: Record<string, string> = {
  "job.posted": "bg-blue-50 text-blue-700",
  "job.filled": "bg-green-50 text-green-700",
  "member.enrolled": "bg-indigo-50 text-indigo-700",
  "member.churned": "bg-red-50 text-red-700",
  "payment.failed": "bg-orange-50 text-orange-700",
  "payment.recovered": "bg-teal-50 text-teal-700",
};

function EventRow({ event }: { event: PracticeEventType }) {
  const color = EVENT_COLORS[event.event_type] ?? "bg-gray-50 text-gray-700";
  const time = new Date(event.occurred_at).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="flex items-start gap-3 py-2">
      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${color}`}>
        {event.event_type}
      </span>
      <span className="text-xs text-gray-500 shrink-0">{time}</span>
      <span className="text-xs text-gray-600">{event.description}</span>
    </div>
  );
}

interface Props {
  practiceId: number;
  onClose: () => void;
}

export default function PracticeModal({ practiceId, onClose }: Props) {
  const [practice, setPractice] = useState<Practice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPracticeById(practiceId)
      .then(setPractice)
      .finally(() => setLoading(false));
  }, [practiceId]);

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {loading ? (
            <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {practice?.name}
              </h2>
              <p className="text-xs text-gray-400">
                {practice?.city}, {practice?.state}
              </p>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Loading practice data...
          </div>
        ) : practice ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Health Score */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Health Score</span>
              <span
                className={`text-2xl font-bold px-3 py-1 rounded-lg ${healthColor(practice.health_score)}`}
              >
                {practice.health_score}/100
              </span>
            </div>

            {/* Two column signals */}
            <div className="grid grid-cols-2 gap-4">
              {/* DentalPost */}
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700">
                    DentalPost
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Open jobs</span>
                    <span className="font-medium text-gray-800">
                      {practice.open_jobs}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Avg days to fill</span>
                    <span className="font-medium text-gray-800">
                      {practice.avg_days_to_fill}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hires (90d)</span>
                    <span className="font-medium text-gray-800">
                      {practice.total_hires_90d}
                    </span>
                  </div>
                </div>
              </div>

              {/* IllumiTrac */}
              <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-indigo-700">
                    IllumiTrac
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Active members</span>
                    <span className="font-medium text-gray-800">
                      {practice.active_members}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">MRR</span>
                    <span className="font-medium text-gray-800">
                      ${practice.mrr.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Churn rate</span>
                    <span
                      className={`font-medium ${practice.churn_rate > 0.1 ? "text-red-600" : "text-green-600"}`}
                    >
                      {(practice.churn_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Missed payments</span>
                    <span
                      className={`font-medium ${practice.missed_payments_30d > 3 ? "text-red-600" : "text-gray-800"}`}
                    >
                      {practice.missed_payments_30d}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Recent Activity
                </h3>
              </div>
              {practice.recent_events && practice.recent_events.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {practice.recent_events.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No recent events</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-red-400">
            Practice not found
          </div>
        )}
      </div>
    </div>
  );
}
