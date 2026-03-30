import { useEffect, useState } from "react";
import {
  fetchDentalPostMetrics,
  fetchIllumiTracMetrics,
  fetchInsights,
  fetchPractices,
} from "../services/api";
import type {
  DentalPostMetrics,
  IllumiTracMetrics,
  PulseInsight,
  Practice,
} from "../types";
import MetricsChart from "../components/MetricsChart";
import InsightCard from "../components/InsightCard";
import StatCard from "../components/StatCard";
import { Activity } from "lucide-react";
import LiveFeed from "../components/LiveFeed";
import QueryInterface from "../components/QueryInterface";
import PracticeModal from "../components/PracticeModal";

export default function Dashboard() {
  const [dpMetrics, setDpMetrics] = useState<DentalPostMetrics[]>([]);
  const [itMetrics, setItMetrics] = useState<IllumiTracMetrics[]>([]);
  const [insights, setInsights] = useState<PulseInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPracticeId, setSelectedPracticeId] = useState<number | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<
    "all" | "healthy" | "at_risk" | "struggling"
  >("all");
  const [sourceFilter, setSourceFilter] = useState<
    "all" | "dentalpost" | "illumitrac"
  >("all");
  const [minimized, setMinimized] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [practices, setPractices] = useState<Practice[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [dp, it, ins, pracs] = await Promise.all([
          fetchDentalPostMetrics(),
          fetchIllumiTracMetrics(),
          fetchInsights(),
          fetchPractices(),
        ]);
        setDpMetrics(dp);
        setItMetrics(it);
        setInsights(ins);
        setPractices(pracs);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400 text-lg">
          Loading Pulse...
        </div>
      </div>
    );
  }

  const latestDp = dpMetrics[dpMetrics.length - 1];
  const latestIt = itMetrics[itMetrics.length - 1];
  const filteredPractices = practices
    .filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (healthFilter === "healthy" && p.health_score < 70) return false;
      if (
        healthFilter === "at_risk" &&
        (p.health_score < 40 || p.health_score >= 70)
      )
        return false;
      if (healthFilter === "struggling" && p.health_score >= 40) return false;
      if (sourceFilter === "dentalpost" && p.open_jobs < 5) return false;
      if (sourceFilter === "illumitrac" && p.churn_rate < 0.1) return false;
      return true;
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.health_score - b.health_score
        : b.health_score - a.health_score,
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-800">Alatus Pulse</h1>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
            AI-Powered
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Unified analytics for DentalPost & IllumiTrac
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Job Posts"
            value={latestDp.active_job_posts}
            sub="DentalPost"
          />
          <StatCard
            label="Applications"
            value={latestDp.applications_received}
            sub="DentalPost"
          />
          <StatCard
            label="Active Campaigns"
            value={latestIt.campaigns_active}
            sub="IllumiTrac"
          />
          <StatCard
            label="Conversions"
            value={latestIt.conversions}
            sub="IllumiTrac"
          />
        </div>

        {/* AI QUery */}
        <QueryInterface />

        {/* Practices Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  Practice Health
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {filteredPractices.length} of {practices.length} practices
                </p>
              </div>

              {/* Sort + Minimize */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title={
                    sortOrder === "asc"
                      ? "Showing worst first"
                      : "Showing best first"
                  }
                >
                  {sortOrder === "asc" ? (
                    <>
                      <span className="text-gray-500">Worst first</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-500">Best first</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setMinimized((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {minimized ? "Show More" : "Show Less"}
                </button>
              </div>
            </div>

            {/* Filters — hide when minimized */}
            {!minimized && (
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Search practices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-44"
                />
                <select
                  value={healthFilter}
                  onChange={(e) =>
                    setHealthFilter(e.target.value as typeof healthFilter)
                  }
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="all">All health tiers</option>
                  <option value="healthy">Healthy (70+)</option>
                  <option value="at_risk">At risk (40–69)</option>
                  <option value="struggling">Struggling (under 40)</option>
                </select>
                <select
                  value={sourceFilter}
                  onChange={(e) =>
                    setSourceFilter(e.target.value as typeof sourceFilter)
                  }
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="all">All issues</option>
                  <option value="dentalpost">DentalPost issues</option>
                  <option value="illumitrac">IllumiTrac issues</option>
                </select>
                {(search ||
                  healthFilter !== "all" ||
                  sourceFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setHealthFilter("all");
                      setSourceFilter("all");
                    }}
                    className="text-xs px-3 py-1.5 text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Rows — minimized shows first 3 opaque, rest faded */}
          {!minimized ? (
            <div className="divide-y divide-gray-50">
              {filteredPractices.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-gray-400">
                  No practices match your filters
                </div>
              ) : (
                filteredPractices.map((p: Practice) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPracticeId(p.id)}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.city}, {p.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        {p.open_jobs} open jobs
                      </span>
                      <span className="text-xs text-gray-500">
                        {(p.churn_rate * 100).toFixed(1)}% churn
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.health_score >= 70
                            ? "bg-green-50 text-green-700"
                            : p.health_score >= 40
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {p.health_score}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Minimized — show 3 rows, fade the rest */
            <div className="relative">
              <div className="divide-y divide-gray-50">
                {filteredPractices
                  .slice(0, 5)
                  .map((p: Practice, index: number) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setMinimized(false);
                        setSelectedPracticeId(p.id);
                      }}
                      className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-colors ${
                        index >= 3 ? "opacity-30" : "hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.city}, {p.state}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">
                          {p.open_jobs} open jobs
                        </span>
                        <span className="text-xs text-gray-500">
                          {(p.churn_rate * 100).toFixed(1)}% churn
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            p.health_score >= 70
                              ? "bg-green-50 text-green-700"
                              : p.health_score >= 40
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {p.health_score}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />

              {/* Expand prompt */}
              <div className="text-center py-2">
                <button
                  onClick={() => setMinimized(false)}
                  className="text-xs text-indigo-500 hover:text-indigo-700"
                >
                  Show all {filteredPractices.length} practices
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Practice Modal */}
        {selectedPracticeId && (
          <PracticeModal
            practiceId={selectedPracticeId}
            onClose={() => setSelectedPracticeId(null)}
          />
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <MetricsChart
            data={dpMetrics}
            dataKey="applications_received"
            title="DentalPost — Applications"
            color="#6366f1"
          />
          <MetricsChart
            data={itMetrics}
            dataKey="conversions"
            title="IllumiTrac — Conversions"
            color="#10b981"
          />
          <MetricsChart
            data={dpMetrics}
            dataKey="fill_rate"
            title="DentalPost — Fill Rate"
            color="#f59e0b"
          />
          <MetricsChart
            data={itMetrics}
            dataKey="click_through_rate"
            title="IllumiTrac — CTR"
            color="#ef4444"
          />
        </div>

        {/* Live Activity feed */}
        <LiveFeed />

        {/* AI Insights */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">AI Insights</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <InsightCard key={i} {...insight} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
