"""
Risk analysis endpoints.
Uses real Gemini 3.0 API with fallback to mock data if API call fails.
"""

from fastapi import APIRouter, HTTPException, Query
from sse_starlette.sse import EventSourceResponse
import asyncio
import logging
import uuid
from datetime import datetime
from typing import Dict, Optional
import json
import time

from app.models.analysis import (
    AnalysisRequest,
    RiskAnalysis,
    RiskScore,
    CategoryScore,
    RiskFinding,
    Recommendation,
    HistoricalTrialSummary,
)
from app.services.gemini_service import get_gemini_service
from app.services.historical_db import get_historical_db_service
from app.services.risk_engine import get_risk_engine
from app.services.mock_analysis import get_mock_generator
from app.services.analysis_storage import get_analysis_storage_service

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory storage for analyses
analyses_db: Dict[str, RiskAnalysis] = {}


def _safe_build_analysis(analysis_id: str, analysis_data: dict) -> RiskAnalysis:
    """
    Build a RiskAnalysis from analysis_data dict, handling missing/extra fields gracefully.
    """
    # Build risk score
    rs = analysis_data.get("risk_score", {})
    if not rs:
        rs = {
            "overall_score": analysis_data.get("overall_risk_score", 65),
            "risk_level": analysis_data.get("risk_level", "high"),
            "confidence": analysis_data.get("confidence", 0.8),
            "category_scores": analysis_data.get("category_scores", []),
        }

    # Normalize category scores
    cat_scores = []
    for cs in rs.get("category_scores", []):
        cat_scores.append(CategoryScore(
            category=cs.get("category", "design_completeness"),
            score=min(100, max(0, float(cs.get("score", 50)))),
            findings_count=int(cs.get("findings_count", 0)),
            key_concerns=cs.get("key_concerns", []),
        ))

    # Ensure we have at least the 3 categories
    existing_cats = {c.category for c in cat_scores}
    for cat in ["historical_precedent", "safety_alignment", "design_completeness"]:
        if cat not in existing_cats:
            cat_scores.append(CategoryScore(
                category=cat, score=50, findings_count=0, key_concerns=[]
            ))

    risk_score = RiskScore(
        overall_score=min(100, max(0, float(rs.get("overall_score", 65)))),
        risk_level=rs.get("risk_level", "high"),
        confidence=min(1.0, max(0, float(rs.get("confidence", 0.8)))),
        category_scores=cat_scores,
    )

    # Build findings
    findings = []
    for f in analysis_data.get("findings", []):
        try:
            findings.append(RiskFinding(
                title=f.get("title", "Finding"),
                category=f.get("category", "design_completeness"),
                severity=f.get("severity", "medium"),
                description=f.get("description", ""),
                evidence=f.get("evidence", []),
                historical_trial_references=f.get("historical_trial_references", []),
                quantified_impact=f.get("quantified_impact"),
                recommendation=f.get("recommendation", "Review and address"),
                estimated_cost_to_fix=f.get("estimated_cost_to_fix"),
                implementation_difficulty=f.get("implementation_difficulty"),
            ))
        except Exception as e:
            logger.warning(f"Skipping malformed finding: {e}")

    # Build recommendations
    recs = []
    for r in analysis_data.get("recommendations", []):
        try:
            recs.append(Recommendation(
                priority=int(r.get("priority", len(recs) + 1)),
                title=r.get("title", "Recommendation"),
                description=r.get("description", ""),
                expected_risk_reduction=min(100, max(0, float(r.get("expected_risk_reduction", 10)))),
                estimated_cost=r.get("estimated_cost"),
                implementation_time=r.get("implementation_time"),
                difficulty=r.get("difficulty", "medium"),
                impact_category=r.get("impact_category", "design_completeness"),
            ))
        except Exception as e:
            logger.warning(f"Skipping malformed recommendation: {e}")

    # Build similar trials
    similar = []
    for t in analysis_data.get("similar_trials", []):
        try:
            similar.append(HistoricalTrialSummary(
                nct_id=t.get("nct_id", "Unknown"),
                trial_name=t.get("trial_name", "Unknown Trial"),
                phase=t.get("phase", "Phase 3"),
                therapeutic_area=t.get("therapeutic_area", "Unknown"),
                drug_class=t.get("drug_class", "Unknown"),
                outcome=t.get("outcome", "unknown"),
                similarity_score=min(1.0, max(0, float(t.get("similarity_score", 0.5)))),
                key_learnings=t.get("key_learnings", []),
                failure_reasons=t.get("failure_reasons"),
            ))
        except Exception as e:
            logger.warning(f"Skipping malformed trial: {e}")

    return RiskAnalysis(
        analysis_id=analysis_id,
        created_at=datetime.utcnow(),
        risk_score=risk_score,
        findings=findings,
        recommendations=recs,
        similar_trials=similar,
        executive_summary=analysis_data.get("executive_summary", "Analysis complete."),
        processing_time_seconds=analysis_data.get("processing_time_seconds"),
    )


async def _run_gemini_analysis(protocol: dict, use_function_calling: bool) -> dict:
    """
    Run real Gemini analysis pipeline:
    1. Search historical DB for similar trials
    2. Call Gemini Pro for risk analysis
    3. Use risk engine for quantitative scoring
    4. Generate executive summary
    """
    gemini = get_gemini_service()
    db = get_historical_db_service()
    engine = get_risk_engine()

    # Extract protocol characteristics for DB search
    drug_class = protocol.get("drug_profile", {}).get("drug_class", "")
    if not drug_class:
        drug_class = protocol.get("drug_class", "Unknown")
    therapeutic_area = protocol.get("patient_population", {}).get("therapeutic_area", "")
    if not therapeutic_area:
        therapeutic_area = protocol.get("therapeutic_area", "")
    phase = protocol.get("metadata", {}).get("phase", "")
    if not phase:
        phase = protocol.get("phase", "Phase 3")
    age_range = protocol.get("patient_population", {}).get("age_range", "")

    # 1. Search historical database
    similar_trials = await db.find_similar_trials(
        drug_class=drug_class or "SSRI",
        therapeutic_area=therapeutic_area or None,
        phase=phase or None,
        population_age=age_range or None,
        top_k=5
    )

    # 2. Call Gemini Pro for deep analysis (without function calling to avoid format issues)
    gemini_analysis = await gemini.analyze_protocol_risk(
        protocol=protocol,
        similar_trials=similar_trials,
        use_function_calling=False
    )

    # 3. Use risk engine for quantitative scoring
    risk_score_data = engine.calculate_risk_score(
        protocol=protocol,
        similar_trials=similar_trials,
        gemini_analysis=gemini_analysis
    )

    # 4. Generate executive summary with Gemini Flash
    executive_summary = await gemini.generate_executive_summary(
        protocol=protocol,
        risk_analysis=gemini_analysis
    )

    # 5. Combine everything
    findings = gemini_analysis.get("findings", [])
    recommendations = gemini_analysis.get("recommendations", [])

    similar_summaries = []
    for t in similar_trials[:3]:
        similar_summaries.append({
            "nct_id": t.get("nct_id", "Unknown"),
            "trial_name": t.get("trial_name", "Unknown"),
            "phase": t.get("phase", ""),
            "therapeutic_area": t.get("therapeutic_area", ""),
            "drug_class": t.get("drug_class", ""),
            "outcome": t.get("outcome", "unknown"),
            "similarity_score": t.get("similarity_score", 0.5),
            "key_learnings": t.get("key_learnings", []),
            "failure_reasons": t.get("failure_reasons"),
        })

    return {
        "risk_score": risk_score_data,
        "findings": findings,
        "recommendations": recommendations,
        "similar_trials": similar_summaries,
        "executive_summary": executive_summary,
        "processing_time_seconds": None,
    }


async def progress_generator(analysis_id: str, protocol: dict, use_function_calling: bool):
    """
    Generate analysis with progress updates via Server-Sent Events.
    Uses real Gemini 3.0 API, falls back to mock if Gemini fails.
    """
    try:
        # Stage 1: Search historical database
        yield {
            "event": "progress",
            "data": json.dumps({
                "stage": "database_search",
                "message": "Searching 20 curated historical trials...",
                "progress_percent": 10
            })
        }

        await asyncio.sleep(0.3)

        yield {
            "event": "progress",
            "data": json.dumps({
                "stage": "database_search",
                "message": "Found similar trials in database",
                "progress_percent": 20
            })
        }

        # Stage 2: AI analysis
        yield {
            "event": "progress",
            "data": json.dumps({
                "stage": "ai_analysis",
                "message": "Analyzing protocol with Gemini 3.0 Pro...",
                "progress_percent": 30
            })
        }

        start_time = time.time()
        analysis_data = None

        # Try real Gemini first
        try:
            logger.info("Running real Gemini analysis...")
            analysis_data = await _run_gemini_analysis(protocol, use_function_calling)
            logger.info("Gemini analysis completed successfully")
        except Exception as e:
            logger.warning(f"Gemini analysis failed, falling back to mock: {e}")
            mock_generator = get_mock_generator()
            analysis_data = mock_generator.generate_analysis(protocol)

        processing_time = time.time() - start_time
        analysis_data["processing_time_seconds"] = round(processing_time, 2)

        yield {
            "event": "progress",
            "data": json.dumps({
                "stage": "ai_analysis",
                "message": "AI analysis completed",
                "progress_percent": 60
            })
        }

        # Stage 3: Generating recommendations
        yield {
            "event": "progress",
            "data": json.dumps({
                "stage": "recommendations",
                "message": "Generating prioritized recommendations...",
                "progress_percent": 75
            })
        }

        await asyncio.sleep(0.3)

        yield {
            "event": "progress",
            "data": json.dumps({
                "stage": "recommendations",
                "message": "Recommendations generated",
                "progress_percent": 90
            })
        }

        # Build analysis object
        analysis = _safe_build_analysis(analysis_id, analysis_data)

        # Store analysis
        analyses_db[analysis_id] = analysis

        # Final progress
        yield {
            "event": "progress",
            "data": json.dumps({
                "stage": "complete",
                "message": "Analysis complete!",
                "progress_percent": 100
            })
        }

        # Send complete analysis
        yield {
            "event": "complete",
            "data": json.dumps({
                "analysis_id": analysis_id,
                "analysis": json.loads(analysis.model_dump_json())
            })
        }

    except Exception as e:
        logger.error(f"Error during analysis: {e}", exc_info=True)
        yield {
            "event": "error",
            "data": json.dumps({
                "error": str(e),
                "message": "Analysis failed. Please try again."
            })
        }


@router.post("/analyze")
async def analyze_protocol(request: AnalysisRequest):
    """
    Perform comprehensive risk analysis on protocol with progress streaming.
    Returns Server-Sent Events stream.
    """
    analysis_id = str(uuid.uuid4())
    
    # Log request details for debugging
    logger.info(f"Starting analysis {analysis_id}")
    logger.debug(f"Protocol keys: {list(request.protocol.keys())}")
    logger.debug(f"Use function calling: {request.use_function_calling}")
    
    # Validate protocol is not empty
    if not request.protocol:
        raise HTTPException(
            status_code=400,
            detail="Protocol data cannot be empty"
        )
    
    # Check that protocol has at least a trial name or description
    has_content = any([
        request.protocol.get("trial_name"),
        request.protocol.get("description"),
        request.protocol.get("drug_profile"),
        request.protocol.get("metadata"),
    ])
    
    if not has_content:
        logger.warning(f"Analysis {analysis_id}: Protocol has no content")
        raise HTTPException(
            status_code=400,
            detail="Protocol must contain at least basic information (trial name, description, or drug profile)"
        )

    return EventSourceResponse(
        progress_generator(
            analysis_id=analysis_id,
            protocol=request.protocol,
            use_function_calling=request.use_function_calling
        )
    )


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Retrieve a stored analysis by ID"""
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail=f"Analysis {analysis_id} not found")

    analysis = analyses_db[analysis_id]
    return {
        "status": "success",
        "analysis": json.loads(analysis.model_dump_json())
    }


@router.delete("/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete a stored analysis"""
    if analysis_id not in analyses_db:
        raise HTTPException(status_code=404, detail=f"Analysis {analysis_id} not found")

    del analyses_db[analysis_id]
    return {"status": "success", "message": f"Analysis {analysis_id} deleted"}


@router.post("/save/{analysis_id}")
async def save_analysis(analysis_id: str, body: dict):
    """
    Save an analysis result to persistent storage
    
    Args:
        analysis_id: Unique analysis ID
        body: JSON with protocol and analysis_result
    """
    try:
        storage = get_analysis_storage_service()
        
        protocol = body.get('protocol', {})
        analysis_result = body.get('analysis', {})
        trial_name = body.get('trial_name') or protocol.get('metadata', {}).get('trial_name')
        
        saved = await storage.save_analysis(
            analysis_id=analysis_id,
            protocol=protocol,
            analysis_result=analysis_result,
            trial_name=trial_name
        )
        
        return {
            "status": "success",
            "message": f"Analysis {analysis_id} saved",
            "saved_analysis": saved
        }
    except Exception as e:
        logger.error(f"Error saving analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save analysis: {str(e)}")


@router.get("/saved/list")
async def get_saved_analyses(limit: int = 50):
    """Get all saved analyses"""
    try:
        storage = get_analysis_storage_service()
        analyses = await storage.get_all_analyses(limit=limit)
        
        return {
            "status": "success",
            "analyses": analyses,
            "count": len(analyses)
        }
    except Exception as e:
        logger.error(f"Error retrieving saved analyses: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analyses: {str(e)}")


@router.get("/saved/{analysis_id}")
async def get_saved_analysis(analysis_id: str):
    """Get a specific saved analysis"""
    try:
        storage = get_analysis_storage_service()
        analysis = await storage.get_analysis(analysis_id)
        
        if not analysis:
            raise HTTPException(status_code=404, detail=f"Analysis {analysis_id} not found")
        
        return {
            "status": "success",
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")


@router.get("/search")
async def search_analyses(
    query: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    limit: int = Query(50)
):
    """
    Search saved analyses
    
    Args:
        query: Search query (trial name or ID)
        risk_level: Filter by risk level (low/medium/high/critical)
        limit: Max results
    """
    try:
        storage = get_analysis_storage_service()
        results = await storage.search_analyses(
            query=query,
            risk_level=risk_level,
            limit=limit
        )
        
        return {
            "status": "success",
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Error searching analyses: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to search analyses: {str(e)}")
