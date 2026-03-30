from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
from database import Base

class Practice(Base):
    __tablename__ = "practices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)

    # DentalPost signals
    open_jobs = Column(Integer, default=0)
    avg_days_to_fill = Column(Float, default=0.0)
    total_hires_90d = Column(Integer, default=0)

    # IllumiTrac signals
    active_members = Column(Integer, default=0)
    mrr = Column(Float, default=0.0)            # monthly recurring revenue
    churn_rate = Column(Float, default=0.0)     # 0.0 - 1.0
    missed_payments_30d = Column(Integer, default=0)

    # Composite
    health_score = Column(Integer, default=50)  # 0 - 100

    created_at = Column(DateTime, server_default=func.now())


class PracticeEvent(Base):
    __tablename__ = "practice_events"

    id = Column(Integer, primary_key=True, index=True)
    practice_id = Column(Integer, nullable=False)
    practice_name = Column(String, nullable=False)

    # What happened
    event_type = Column(String, nullable=False)
    # job.posted | job.filled | member.enrolled |
    # member.churned | payment.failed | payment.recovered

    source = Column(String, nullable=False)     # dentalpost | illumitrac
    description = Column(Text)
    occurred_at = Column(DateTime, server_default=func.now())