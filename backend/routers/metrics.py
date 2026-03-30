from fastapi import APIRouter
from services.mock_data import generate_dentalpost_metrics, generate_illumitrac_metrics

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

@router.get("/dentalpost")
def get_dentalpost_metrics(days: int = 30):
    return generate_dentalpost_metrics(days)

@router.get("/illumitrac")
def get_illumitrac_metrics(days: int = 30):
    return generate_illumitrac_metrics(days)