from models.schemas import DentalPostMetrics, IllumiTracMetrics
from datetime import date, timedelta
import random

def generate_dentalpost_metrics(days: int = 30) -> list[DentalPostMetrics]:
    metrics = []
    for i in range(days):
        d = date.today() - timedelta(days=days - i)
        metrics.append(DentalPostMetrics(
            date=d,
            active_job_posts=random.randint(120, 200),
            applications_received=random.randint(300, 600),
            employer_signups=random.randint(5, 20),
            candidate_signups=random.randint(40, 100),
            fill_rate=round(random.uniform(0.60, 0.85), 2),
        ))
    return metrics

def generate_illumitrac_metrics(days: int = 30) -> list[IllumiTracMetrics]:
    metrics = []
    for i in range(days):
        d = date.today() - timedelta(days=days - i)
        metrics.append(IllumiTracMetrics(
            date=d,
            campaigns_active=random.randint(15, 40),
            impressions=random.randint(10000, 50000),
            click_through_rate=round(random.uniform(0.02, 0.08), 3),
            conversions=random.randint(50, 200),
            cost_per_acquisition=round(random.uniform(8.0, 25.0), 2),
        ))
    return metrics