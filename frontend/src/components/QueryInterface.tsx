import { useState } from "react";
import { askPulse } from "../services/api";
import type { QueryResponse } from "../types";
import { Search, Loader2, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

const EXAMPLE_QUESTIONS = [
  "Which practices should we reach out to this week?",
  "What does our churn look like across the portfolio?",
  "Which practices are performing best right now?",
  "Give me a full portfolio summary",
];

export default function QueryInterface() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setResponse(null);
    try {
      const result = await askPulse(question);
      setResponse(result);
    } catch (e) {
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) handleAsk();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-500" />
          <h2 className="text-base font-bold text-gray-800">Ask Pulse</h2>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            Claude-powered
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Ask anything about your portfolio in plain English
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Which practices need attention this week?"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
          </button>
        </div>

        {/* Example questions */}
        {!response && !loading && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-3 py-4 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Querying your data...
          </div>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Response */}
        {response && (
          <div className="space-y-3">
            {/* Tools used badges */}
            {response.tools_used.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Data sources:</span>
                {response.tools_used.map((tool) => (
                  <span
                    key={tool}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {tool.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            {/* Answer */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mb-2 [&_h3]:font-semibold [&_h3]:text-gray-800 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_p]:mb-2 [&_li]:text-gray-700">
              <ReactMarkdown>{response.answer}</ReactMarkdown>
            </div>

            {/* Ask another */}
            <button
              onClick={() => {
                setResponse(null);
                setQuestion("");
              }}
              className="text-xs text-indigo-500 hover:text-indigo-700"
            >
              Ask another question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
