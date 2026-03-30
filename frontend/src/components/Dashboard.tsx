import { useEffect, useState } from "react";
import {
  fetchDentalPostMetrics,
  fetchIllumiTracMetrics,
  fetchInsights,
} from "../services/api";
import type {
  DentalPostMetrics,
  IllumiTracMetrics,
  PulseInsight,
} from "../types";
import MetricsChart from "../components/MetricsChart";
import InsightCard from "../components/InsightCard";
import StatCard from "../components/StatCard";
import { Activity } from "lucide-react";
import LiveFeed from "../components/LiveFeed";
import QueryInterface from "../components/QueryInterface";

export default function Dashboard() {
  const [dpMetrics, setDpMetrics] = useState<DentalPostMetrics[]>([]);
  const [itMetrics, setItMetrics] = useState<IllumiTracMetrics[]>([]);
  const [insights, setInsights] = useState<PulseInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dp, it, ins] = await Promise.all([
          fetchDentalPostMetrics(),
          fetchIllumiTracMetrics(),
          fetchInsights(),
        ]);
        setDpMetrics(dp);
        setItMetrics(it);
        setInsights(ins);
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
