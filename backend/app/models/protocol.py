"""
Pydantic models for clinical trial protocol data structures.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class TrialPhase(str, Enum):
    """Clinical trial phase"""
    PHASE_1 = "Phase 1"
    PHASE_2 = "Phase 2"
    PHASE_3 = "Phase 3"
    PHASE_4 = "Phase 4"
    PHASE_1_2 = "Phase 1/2"
    PHASE_2_3 = "Phase 2/3"


class StudyDesignType(str, Enum):
    """Type of study design"""
    PARALLEL = "Parallel"
    CROSSOVER = "Crossover"
    FACTORIAL = "Factorial"
    SINGLE_GROUP = "Single Group"


class DrugProfile(BaseModel):
    """Drug/intervention information"""
    name: str
    drug_class: str
    mechanism_of_action: Optional[str] = None
    known_contraindications: List[str] = Field(default_factory=list)
    pharmacogenomic_markers: List[str] = Field(default_factory=list)


class PatientPopulation(BaseModel):
    """Target patient population"""
    age_range: str
    gender: Optional[str] = None
    disease_indication: str
    therapeutic_area: str
    inclusion_criteria: List[str] = Field(default_factory=list)
    exclusion_criteria: List[str] = Field(default_factory=list)
    disease_severity: Optional[str] = None
    biomarker_requirements: List[str] = Field(default_factory=list)


class Endpoint(BaseModel):
    """Trial endpoint definition"""
    name: str
    type: str  # primary, secondary, exploratory
    measurement_method: Optional[str] = None
    timepoint: Optional[str] = None


class StatisticalPlan(BaseModel):
    """Statistical analysis plan"""
    planned_enrollment: int
    actual_enrollment: Optional[int] = None
    power_calculation_provided: bool = False
    expected_effect_size: Optional[float] = None
    alpha_level: float = 0.05
    dropout_rate_assumption: Optional[float] = None
    primary_analysis_method: Optional[str] = None


class StudyDesign(BaseModel):
    """Study design details"""
    design_type: StudyDesignType
    blinding: str  # open-label, single-blind, double-blind, triple-blind
    randomization: bool
    placebo_controlled: bool
    placebo_run_in: bool = False
    enrichment_design: bool = False
    adaptive_design: bool = False
    duration_weeks: Optional[int] = None


class ProtocolMetadata(BaseModel):
    """Trial metadata"""
    nct_id: Optional[str] = None
    trial_name: str
    sponsor: str
    phase: TrialPhase
    year: Optional[int] = None


class ClinicalProtocol(BaseModel):
    """Complete clinical trial protocol"""
    metadata: ProtocolMetadata
    drug_profile: DrugProfile
    patient_population: PatientPopulation
    study_design: StudyDesign
    primary_endpoints: List[Endpoint] = Field(default_factory=list)
    secondary_endpoints: List[Endpoint] = Field(default_factory=list)
    statistical_plan: StatisticalPlan
    safety_monitoring_plan: Optional[str] = None

    # Additional parsed fields
    estimated_cost: Optional[float] = None
    timeline_months: Optional[int] = None


class ProtocolParseRequest(BaseModel):
    """Request for parsing a protocol PDF"""
    file_content: bytes = Field(..., description="PDF file content")


class ProtocolValidationRequest(BaseModel):
    """Request for validating protocol data"""
    protocol: ClinicalProtocol


class ProtocolValidationResponse(BaseModel):
    """Response from protocol validation"""
    is_valid: bool
    errors: List[dict] = Field(default_factory=list)
    warnings: List[dict] = Field(default_factory=list)
    completeness_score: float = Field(
        ..., ge=0.0, le=1.0, description="0-1 score of how complete the protocol is"
    )
