from fastapi import APIRouter
from services.mock_data import generate_dentalpost_metrics, generate_illumitrac_metrics
from services.ai_insights import generate_insights

router = APIRouter(prefix="/api/insights", tags=["insights"])

@router.get("/")
def get_insights():
    dp_data = [m.model_dump() for m in generate_dentalpost_metrics(30)]
    it_data = [m.model_dump() for m in generate_illumitrac_metrics(30)]
    return generate_insights(dp_data, it_data)