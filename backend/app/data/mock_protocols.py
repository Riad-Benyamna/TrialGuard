"""
Mock protocol data for demo purposes
"""

DEMO_PROTOCOLS = [
    {
        "id": "demo-001",
        "name": "HOPE-Adolescent Depression Study",
        "metadata": {
            "nct_id": "NCT-DEMO-001",
            "trial_name": "HOPE: Adolescent Depression Treatment Study",
            "sponsor": "University Medical Research Center",
            "phase": "Phase 3",
            "year": 2024
        },
        "drug_profile": {
            "name": "Sertraline",
            "drug_class": "SSRI",
            "mechanism_of_action": "Selective serotonin reuptake inhibitor",
            "known_contraindications": ["MAOIs", "Pimozide", "Hypersensitivity"],
            "pharmacogenomic_markers": ["CYP2C19", "CYP2D6"]
        },
        "patient_population": {
            "age_range": "13-17",
            "gender": "All genders",
            "disease_indication": "Major Depressive Disorder",
            "therapeutic_area": "Psychiatry",
            "inclusion_criteria": [
                "Diagnosed MDD per DSM-5",
                "CDRS-R score ≥ 40",
                "Duration ≥ 4 weeks"
            ],
            "exclusion_criteria": [
                "Bipolar disorder",
                "Active suicidal ideation",
                "Substance use disorder"
            ],
            "disease_severity": "Moderate to severe",
            "biomarker_requirements": []
        },
        "study_design": {
            "design_type": "Parallel",
            "blinding": "double-blind",
            "randomization": True,
            "placebo_controlled": True,
            "placebo_run_in": False,
            "enrichment_design": False,
            "adaptive_design": False,
            "duration_weeks": 12
        },
        "primary_endpoints": [
            {
                "name": "Change in CDRS-R total score",
                "type": "primary",
                "measurement_method": "CDRS-R Scale",
                "timepoint": "Week 12"
            }
        ],
        "secondary_endpoints": [
            {
                "name": "Response rate",
                "type": "secondary",
                "measurement_method": "≥50% reduction in CDRS-R",
                "timepoint": "Week 12"
            }
        ],
        "statistical_plan": {
            "planned_enrollment": 150,
            "actual_enrollment": None,
            "power_calculation_provided": False,
            "expected_effect_size": 0.4,
            "alpha_level": 0.05,
            "dropout_rate_assumption": 0.15,
            "primary_analysis_method": "MMRM"
        },
        "safety_monitoring_plan": "Weekly adverse event monitoring, C-SSRS at each visit",
        "estimated_cost": 2500000,
        "timeline_months": 18
    },
    {
        "id": "demo-002",
        "name": "CLARITY-Lung Cancer Immunotherapy",
        "metadata": {
            "nct_id": "NCT-DEMO-002",
            "trial_name": "CLARITY: PD-L1 Inhibitor in Advanced NSCLC",
            "sponsor": "BioPharma Innovation Inc",
            "phase": "Phase 2",
            "year": 2024
        },
        "drug_profile": {
            "name": "Investigational mAb-401",
            "drug_class": "PD-L1 Inhibitor",
            "mechanism_of_action": "Blocks PD-L1 interaction with PD-1",
            "known_contraindications": ["Autoimmune disease", "Immunosuppression"],
            "pharmacogenomic_markers": ["PD-L1 expression"]
        },
        "patient_population": {
            "age_range": "18-75",
            "gender": "All genders",
            "disease_indication": "Advanced Non-Small Cell Lung Cancer",
            "therapeutic_area": "Oncology",
            "inclusion_criteria": [
                "Stage IV NSCLC",
                "Prior platinum-based therapy",
                "ECOG 0-1"
            ],
            "exclusion_criteria": [
                "Active brain metastases",
                "Prior immunotherapy",
                "Autoimmune conditions"
            ],
            "disease_severity": "Advanced/Metastatic",
            "biomarker_requirements": []
        },
        "study_design": {
            "design_type": "Parallel",
            "blinding": "open-label",
            "randomization": True,
            "placebo_controlled": False,
            "placebo_run_in": False,
            "enrichment_design": False,
            "adaptive_design": False,
            "duration_weeks": 52
        },
        "primary_endpoints": [
            {
                "name": "Objective Response Rate",
                "type": "primary",
                "measurement_method": "RECIST 1.1",
                "timepoint": "12 weeks"
            }
        ],
        "secondary_endpoints": [
            {
                "name": "Overall Survival",
                "type": "secondary",
                "measurement_method": "Time to death",
                "timepoint": "52 weeks"
            }
        ],
        "statistical_plan": {
            "planned_enrollment": 80,
            "actual_enrollment": None,
            "power_calculation_provided": True,
            "expected_effect_size": None,
            "alpha_level": 0.05,
            "dropout_rate_assumption": 0.20,
            "primary_analysis_method": "Simon two-stage design"
        },
        "safety_monitoring_plan": "Comprehensive immune-related adverse event monitoring per protocol",
        "estimated_cost": 5200000,
        "timeline_months": 24
    }
]


def get_demo_protocol(protocol_id: str = None):
    """Get a demo protocol by ID or return random one"""
    if protocol_id:
        for protocol in DEMO_PROTOCOLS:
            if protocol["id"] == protocol_id:
                return protocol
    return DEMO_PROTOCOLS[0]


def get_all_demo_protocols():
    """Get all demo protocols"""
    return DEMO_PROTOCOLS
