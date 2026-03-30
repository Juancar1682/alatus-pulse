from database import engine, SessionLocal, Base
from models.db_models import Practice, PracticeEvent
from faker import Faker
import random
from datetime import datetime, timedelta

# This creates all tables if they don't exist
Base.metadata.create_all(bind=engine)

fake = Faker()
db = SessionLocal()

# ── helpers ──────────────────────────────────────────────

def calculate_health_score(p_data: dict) -> int:
    score = 100
    if p_data["open_jobs"] > 5:
        score -= (p_data["open_jobs"] - 5) * 3
    if p_data["avg_days_to_fill"] > 30:
        score -= min((p_data["avg_days_to_fill"] - 30) * 0.5, 20)
    score -= p_data["churn_rate"] * 40
    score -= p_data["missed_payments_30d"] * 5
    if p_data["active_members"] > 0:
        rpm = p_data["mrr"] / p_data["active_members"]
        if rpm < 30:
            score -= 10
    return max(0, min(100, round(score)))


def random_event_type():
    return random.choice([
        ("job.posted",      "dentalpost"),
        ("job.filled",      "dentalpost"),
        ("member.enrolled", "illumitrac"),
        ("member.churned",  "illumitrac"),
        ("payment.failed",  "illumitrac"),
        ("payment.recovered","illumitrac"),
    ])


def describe_event(event_type: str, practice_name: str) -> str:
    descriptions = {
        "job.posted":        f"{practice_name} posted a new job opening",
        "job.filled":        f"{practice_name} filled an open position",
        "member.enrolled":   f"{practice_name} enrolled a new membership member",
        "member.churned":    f"{practice_name} lost a membership member",
        "payment.failed":    f"{practice_name} had a membership payment fail",
        "payment.recovered": f"{practice_name} recovered a failed payment",
    }
    return descriptions.get(event_type, "Unknown event")


# ── seed practices ────────────────────────────────────────

print("Seeding practices...")

# Clear existing data so we can re-run safely
db.query(PracticeEvent).delete()
db.query(Practice).delete()
db.commit()

practices = []

for _ in range(20):
    # Randomly assign a health profile so we get realistic variation
    profile = random.choice(["healthy", "healthy", "struggling", "at_risk"])

    if profile == "healthy":
        data = {
            "open_jobs": random.randint(0, 4),
            "avg_days_to_fill": round(random.uniform(10, 28), 1),
            "total_hires_90d": random.randint(3, 8),
            "active_members": random.randint(80, 200),
            "mrr": round(random.uniform(3000, 8000), 2),
            "churn_rate": round(random.uniform(0.01, 0.05), 3),
            "missed_payments_30d": random.randint(0, 2),
        }
    elif profile == "struggling":
        data = {
            "open_jobs": random.randint(8, 15),
            "avg_days_to_fill": round(random.uniform(40, 75), 1),
            "total_hires_90d": random.randint(0, 2),
            "active_members": random.randint(10, 40),
            "mrr": round(random.uniform(400, 1500), 2),
            "churn_rate": round(random.uniform(0.15, 0.30), 3),
            "missed_payments_30d": random.randint(5, 12),
        }
    else:  # at_risk
        data = {
            "open_jobs": random.randint(4, 8),
            "avg_days_to_fill": round(random.uniform(28, 45), 1),
            "total_hires_90d": random.randint(1, 4),
            "active_members": random.randint(40, 80),
            "mrr": round(random.uniform(1500, 3500), 2),
            "churn_rate": round(random.uniform(0.06, 0.15), 3),
            "missed_payments_30d": random.randint(2, 5),
        }

    data["health_score"] = calculate_health_score(data)

    practice = Practice(
        name=f"{fake.last_name()} Dental",
        city=fake.city(),
        state=fake.state_abbr(),
        zip_code=fake.zipcode(),
        **data
    )
    db.add(practice)
    practices.append(practice)

db.commit()

# Refresh to get IDs assigned by DB
for p in practices:
    db.refresh(p)

print(f"  ✓ {len(practices)} practices created")

# ── seed events ───────────────────────────────────────────

print("Seeding events...")

for practice in practices:
    # Each practice gets 5-15 historical events
    num_events = random.randint(5, 15)
    for _ in range(num_events):
        event_type, source = random_event_type()
        occurred_at = datetime.now() - timedelta(
            hours=random.randint(1, 72)
        )
        event = PracticeEvent(
            practice_id=practice.id,
            practice_name=practice.name,
            event_type=event_type,
            source=source,
            description=describe_event(event_type, practice.name),
            occurred_at=occurred_at,
        )
        db.add(event)

db.commit()
print(f"  ✓ Events seeded for all practices")

db.close()
print("\nDone. Database is ready.")