"""
Historical trials database endpoints.
"""

from fastapi import APIRouter, Query
from typing import Optional, List
import logging

from app.services.historical_db import get_historical_db_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("")
async def get_historical_trials(
    phase: Optional[str] = Query(None, description="Filter by trial phase"),
    therapeutic_area: Optional[str] = Query(None, description="Filter by therapeutic area"),
    outcome: Optional[str] = Query(None, description="Filter by outcome (success/failed)"),
    limit: Optional[int] = Query(20, description="Maximum number of trials to return")
):
    """
    Get historical trials from database with optional filters

    Args:
        phase: Trial phase (e.g., "Phase 3")
        therapeutic_area: Therapeutic area (e.g., "Oncology", "Psychiatry")
        outcome: Trial outcome ("success" or "failed")
        limit: Maximum results to return

    Returns:
        List of historical trials
    """
    db_service = get_historical_db_service()

    # Get all trials
    trials = db_service.trials

    # Apply filters
    filtered_trials = trials

    if phase:
        filtered_trials = [t for t in filtered_trials if t.get("phase") == phase]

    if therapeutic_area:
        filtered_trials = [t for t in filtered_trials if
                          t.get("therapeutic_area", "").lower() == therapeutic_area.lower()]

    if outcome:
        filtered_trials = [t for t in filtered_trials if t.get("outcome") == outcome]

    # Limit results
    filtered_trials = filtered_trials[:limit]

    logger.info(f"Returning {len(filtered_trials)} historical trials")

    # Return trials array directly (frontend expects array, not wrapped object)
    return filtered_trials


@router.get("/{nct_id}")
async def get_trial_by_id(nct_id: str):
    """
    Get a specific historical trial by NCT ID

    Args:
        nct_id: NCT identifier (e.g., "NCT02134613")

    Returns:
        Trial details
    """
    db_service = get_historical_db_service()

    trial = db_service.indices["nct_id"].get(nct_id)

    if not trial:
        return {
            "status": "not_found",
            "message": f"Trial {nct_id} not found in database"
        }

    return {
        "status": "success",
        "trial": trial
    }
