export interface DentalPostMetrics {
  date: string;
  active_job_posts: number;
  applications_received: number;
  employer_signups: number;
  candidate_signups: number;
  fill_rate: number;
}

export interface IllumiTracMetrics {
  date: string;
  campaigns_active: number;
  impressions: number;
  click_through_rate: number;
  conversions: number;
  cost_per_acquisition: number;
}

export interface PulseInsight {
  title: string;
  summary: string;
  category: "opportunity" | "alert" | "trend";
  source: "dentalpost" | "illumitrac" | "cross-platform";
}

export interface LiveEvent {
  id: number;
  practice_id: number;
  practice_name: string;
  event_type: string;
  source: "dentalpost" | "illumitrac";
  description: string;
  occurred_at: string;
}

export interface QueryResponse {
  answer: string;
  tools_used: string[];
}

export interface PracticeEventType {
  id: number;
  practice_id: number;
  practice_name: string;
  event_type: string;
  source: string;
  description: string;
  occurred_at: string;
}

export interface Practice {
  id: number;
  name: string;
  city: string;
  state: string;
  zip_code: string;
  open_jobs: number;
  avg_days_to_fill: number;
  total_hires_90d: number;
  active_members: number;
  mrr: number;
  churn_rate: number;
  missed_payments_30d: number;
  health_score: number;
  recent_events?: PracticeEventType[];
}
