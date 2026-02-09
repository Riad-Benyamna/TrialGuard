"""
Pydantic models for risk analysis results.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime


class RiskLevel(str, Enum):
    """Risk severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskCategory(str, Enum):
    """Categories of risk"""
    HISTORICAL_PRECEDENT = "historical_precedent"
    SAFETY_ALIGNMENT = "safety_alignment"
    DESIGN_COMPLETENESS = "design_completeness"


class MatchStatus(str, Enum):
    """Comparison match status"""
    EXACT_MATCH = "EXACT_MATCH"
    MATCH = "MATCH"
    MISMATCH = "MISMATCH"
    RISK_FACTOR = "RISK_FACTOR"


class RiskFinding(BaseModel):
    """Individual risk finding"""
    title: str
    category: RiskCategory
    severity: RiskLevel
    description: str
    evidence: List[str] = Field(default_factory=list)
    historical_trial_references: List[str] = Field(default_factory=list)
    quantified_impact: Optional[str] = None  # e.g., "Increases failure risk by 35%"
    recommendation: str
    estimated_cost_to_fix: Optional[str] = None
    implementation_difficulty: Optional[str] = None  # easy, medium, hard


class CategoryScore(BaseModel):
    """Risk score for a specific category"""
    category: RiskCategory
    score: float = Field(..., ge=0, le=100)
    findings_count: int
    key_concerns: List[str] = Field(default_factory=list)


class RiskScore(BaseModel):
    """Overall risk scoring"""
    overall_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    category_scores: List[CategoryScore]
    confidence: float = Field(..., ge=0, le=1.0)


class HistoricalTrialSummary(BaseModel):
    """Summary of a historical trial for comparison"""
    nct_id: str
    trial_name: str
    phase: str
    therapeutic_area: str
    drug_class: str
    outcome: str  # success, failed, terminated
    similarity_score: float = Field(..., ge=0, le=1.0)
    key_learnings: List[str] = Field(default_factory=list)
    failure_reasons: Optional[List[str]] = None


class ComparisonRow(BaseModel):
    """Single row in protocol comparison table"""
    field: str
    current: str
    historical: str
    match_status: MatchStatus
    risk_level: RiskLevel
    explanation: Optional[str] = None


class ComparisonData(BaseModel):
    """Detailed comparison with historical trial"""
    historical_trial: HistoricalTrialSummary
    comparison_rows: List[ComparisonRow]
    overall_similarity: float = Field(..., ge=0, le=1.0)
    risk_assessment: str


class Recommendation(BaseModel):
    """Actionable recommendation"""
    priority: int  # 1 = highest priority
    title: str
    description: str
    expected_risk_reduction: float = Field(..., ge=0, le=100)
    estimated_cost: Optional[str] = None
    implementation_time: Optional[str] = None
    difficulty: str  # easy, medium, hard
    impact_category: RiskCategory


class RiskAnalysis(BaseModel):
    """Complete risk analysis result"""
    analysis_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Core analysis
    risk_score: RiskScore
    findings: List[RiskFinding]
    recommendations: List[Recommendation]

    # Supporting data
    similar_trials: List[HistoricalTrialSummary]
    executive_summary: str

    # Metadata
    processing_time_seconds: Optional[float] = None
    model_used: str = "gemini-3.0-pro"


class AnalysisRequest(BaseModel):
    """Request for protocol risk analysis"""
    protocol: dict  # ClinicalProtocol as dict
    use_function_calling: bool = True


class AnalysisResponse(BaseModel):
    """Response containing analysis results"""
    analysis: RiskAnalysis
    status: str = "completed"


class ProgressUpdate(BaseModel):
    """Progress update during analysis"""
    stage: str
    message: str
    progress_percent: int = Field(..., ge=0, le=100)
