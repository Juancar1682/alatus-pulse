from pydantic import BaseModel
from datetime import date, datetime

class DentalPostMetrics(BaseModel):
    date: date
    active_job_posts: int
    applications_received: int
    employer_signups: int
    candidate_signups: int
    fill_rate: float

class IllumiTracMetrics(BaseModel):
    date: date
    campaigns_active: int
    impressions: int
    click_through_rate: float
    conversions: int
    cost_per_acquisition: float

class PulseInsight(BaseModel):
    title: str
    summary: str
    category: str
    source: str    # "dentalpost" | "illumitrac" | "cross-platform"


class PracticeEvent(BaseModel):
    id: int
    practice_id: int
    practice_name: str
    event_type: str
    source: str
    description: str
    occurred_at: datetime

    class Config:
        from_attributes = True


class PracticeBase(BaseModel):
    id: int
    name: str
    city: str
    state: str
    zip_code: str
    open_jobs: int
    avg_days_to_fill: float
    total_hires_90d: int
    active_members: int
    mrr: float
    churn_rate: float
    missed_payments_30d: int
    health_score: int

    class Config:
        from_attributes = True


class PracticeDetail(PracticeBase):
    recent_events: list[PracticeEvent] = []