import { Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import type { PulseInsight } from "../types";

const iconMap = {
  opportunity: <Lightbulb className="w-5 h-5 text-emerald-500" />,
  alert: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  trend: <TrendingUp className="w-5 h-5 text-blue-500" />,
};

const borderMap = {
  opportunity: "border-l-emerald-500",
  alert: "border-l-amber-500",
  trend: "border-l-blue-500",
};

export default function InsightCard({
  title,
  summary,
  category,
  source,
}: PulseInsight) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 ${borderMap[category]}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {iconMap[category]}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
      <span className="inline-block mt-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
        {source}
      </span>
    </div>
  );
}
