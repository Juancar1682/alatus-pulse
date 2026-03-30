import axios from "axios";
import type {
  DentalPostMetrics,
  IllumiTracMetrics,
  PulseInsight,
  QueryResponse,
} from "../types";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const fetchDentalPostMetrics = async (): Promise<
  DentalPostMetrics[]
> => {
  const { data } = await api.get("/metrics/dentalpost");
  return data;
};

export const fetchIllumiTracMetrics = async (): Promise<
  IllumiTracMetrics[]
> => {
  const { data } = await api.get("/metrics/illumitrac");
  return data;
};

export const fetchInsights = async (): Promise<PulseInsight[]> => {
  const { data } = await api.get("/insights/");
  return data;
};

export async function askPulse(question: string): Promise<QueryResponse> {
  const res = await fetch("http://localhost:8000/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return res.json();
}
