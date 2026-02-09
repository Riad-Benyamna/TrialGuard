"""
Mock analysis generator for demo purposes
Generates realistic-looking risk analyses instantly without calling Gemini API
"""

import random
from datetime import datetime
from typing import Dict, List


class MockAnalysisGenerator:
    """Generate mock risk analyses for demo"""

    def generate_analysis(self, protocol: Dict) -> Dict:
        """Generate a complete mock risk analysis"""

        # Determine risk level based on protocol characteristics
        risk_score = self._calculate_mock_risk_score(protocol)

        return {
            "analysis_id": f"mock-{datetime.utcnow().timestamp()}",
            "created_at": datetime.utcnow().isoformat(),
            "risk_score": {
                "overall_score": risk_score,
                "risk_level": self._get_risk_level(risk_score),
                "confidence": round(random.uniform(0.75, 0.95), 2),
                "category_scores": self._generate_category_scores(protocol, risk_score)
            },
            "findings": self._generate_findings(protocol),
            "recommendations": self._generate_recommendations(protocol),
            "similar_trials": self._generate_similar_trials(protocol),
            "executive_summary": self._generate_executive_summary(protocol, risk_score),
            "processing_time_seconds": round(random.uniform(2.5, 4.5), 2),
            "model_used": "gemini-3.0-pro"
        }

    def _calculate_mock_risk_score(self, protocol: Dict) -> float:
        """Calculate a realistic risk score based on protocol features"""
        score = 30.0  # Base score

        # Check for known risk factors
        study_design = protocol.get("study_design", {})
        stat_plan = protocol.get("statistical_plan", {})
        patient_pop = protocol.get("patient_population", {})

        # No placebo run-in (common in psychiatry)
        if not study_design.get("placebo_run_in", False):
            if "psychiatry" in patient_pop.get("therapeutic_area", "").lower():
                score += 25

        # No power calculation
        if not stat_plan.get("power_calculation_provided", False):
            score += 15

        # No biomarker enrichment
        if not patient_pop.get("biomarker_requirements"):
            if "oncology" in patient_pop.get("therapeutic_area", "").lower():
                score += 20

        # Small sample size
        if stat_plan.get("planned_enrollment", 1000) < 100:
            score += 10

        # Open label design for efficacy
        if study_design.get("blinding") == "open-label":
            score += 12

        # Add some randomness
        score += random.uniform(-5, 5)

        return min(max(score, 15), 95)  # Clamp between 15-95

    def _get_risk_level(self, score: float) -> str:
        """Convert score to risk level"""
        if score < 30:
            return "low"
        elif score < 60:
            return "medium"
        else:
            return "high"

    def _generate_category_scores(self, protocol: Dict, overall_score: float) -> List[Dict]:
        """Generate category breakdown scores"""
        # Distribute the overall score across categories
        hist_score = overall_score + random.uniform(-10, 10)
        safety_score = overall_score + random.uniform(-15, 5)
        design_score = overall_score + random.uniform(-8, 8)

        return [
            {
                "category": "historical_precedent",
                "score": round(max(0, min(100, hist_score)), 1),
                "findings_count": random.randint(2, 4),
                "key_concerns": [
                    "Similar trials show high failure rates",
                    "Historical patterns suggest design vulnerabilities"
                ]
            },
            {
                "category": "safety_alignment",
                "score": round(max(0, min(100, safety_score)), 1),
                "findings_count": random.randint(1, 3),
                "key_concerns": [
                    "Some contraindications not fully addressed",
                    "Monitoring plan could be enhanced"
                ]
            },
            {
                "category": "design_completeness",
                "score": round(max(0, min(100, design_score)), 1),
                "findings_count": random.randint(2, 3),
                "key_concerns": [
                    "Protocol missing key elements",
                    "Statistical plan needs refinement"
                ]
            }
        ]

    def _generate_findings(self, protocol: Dict) -> List[Dict]:
        """Generate realistic risk findings"""
        findings = []

        therapeutic_area = protocol.get("patient_population", {}).get("therapeutic_area", "").lower()
        study_design = protocol.get("study_design", {})
        stat_plan = protocol.get("statistical_plan", {})

        # Placebo response risk
        if "psychiatry" in therapeutic_area and not study_design.get("placebo_run_in"):
            findings.append({
                "title": "High Placebo Response Risk",
                "category": "historical_precedent",
                "severity": "high",
                "description": "Adolescent depression trials without placebo run-in periods consistently show placebo response rates of 35-45%, significantly reducing ability to detect drug effect.",
                "evidence": [
                    "Meta-analysis of 27 pediatric MDD trials shows 42% placebo response",
                    "Similar trials (STAR*D, ACHIEVE) failed to show significance",
                    "Single-blind placebo run-in reduces placebo rate by 15-20%"
                ],
                "historical_trial_references": ["NCT02134613", "NCT01988441"],
                "quantified_impact": "Increases failure risk by approximately 35%",
                "recommendation": "Add 1-2 week single-blind placebo run-in period",
                "estimated_cost_to_fix": "$50K-$100K (extended timeline)",
                "implementation_difficulty": "medium"
            })

        # Missing power calculation
        if not stat_plan.get("power_calculation_provided"):
            findings.append({
                "title": "No Statistical Power Calculation",
                "category": "design_completeness",
                "severity": "high",
                "description": "Protocol lacks formal power calculation to justify sample size of {}, risking underpowered study unable to detect clinically meaningful effects.".format(
                    stat_plan.get("planned_enrollment", "N")
                ),
                "evidence": [
                    "FDA guidance requires power justification for pivotal trials",
                    "Underpowered trials waste resources and expose participants to risk",
                    "23% of Phase 3 failures attributed to inadequate sample size"
                ],
                "historical_trial_references": ["Multiple failed trials"],
                "quantified_impact": "Increases failure risk by 20-25%",
                "recommendation": "Conduct formal power analysis assuming effect size of 0.4-0.5 with 80-90% power",
                "estimated_cost_to_fix": "$5K-$10K (statistical consultation)",
                "implementation_difficulty": "easy"
            })

        # Biomarker enrichment for oncology
        if "oncology" in therapeutic_area:
            if not protocol.get("patient_population", {}).get("biomarker_requirements"):
                findings.append({
                    "title": "No Biomarker Enrichment Strategy",
                    "category": "historical_precedent",
                    "severity": "high",
                    "description": "All-comers design in oncology without biomarker selection significantly reduces likelihood of detecting treatment effect, as responses often limited to biomarker-defined subpopulations.",
                    "evidence": [
                        "68% of checkpoint inhibitor trials without PD-L1 enrichment failed Phase 3",
                        "Biomarker-selected trials show 2.5x higher success rates",
                        "FDA increasingly requires companion diagnostics"
                    ],
                    "historical_trial_references": ["NCT02298516", "NCT02813135"],
                    "quantified_impact": "Reduces success probability by 40-50%",
                    "recommendation": "Add PD-L1 expression ≥50% or TMB-high criteria for enrollment",
                    "estimated_cost_to_fix": "$150K-$300K (diagnostic testing)",
                    "implementation_difficulty": "medium"
                })

        # Small sample size warning
        if stat_plan.get("planned_enrollment", 1000) < 100:
            findings.append({
                "title": "Limited Sample Size",
                "category": "design_completeness",
                "severity": "medium",
                "description": f"Planned enrollment of {stat_plan.get('planned_enrollment')} may be insufficient for subgroup analyses and increases risk from higher-than-expected dropout rates.",
                "evidence": [
                    "Average dropout rate in {} trials: {}%".format(therapeutic_area, stat_plan.get("dropout_rate_assumption", 15) * 100),
                    "Regulatory agencies expect sensitivity analyses",
                    "Underpowered subgroup analyses mislead future development"
                ],
                "historical_trial_references": [],
                "quantified_impact": "Reduces statistical power if dropout exceeds assumptions",
                "recommendation": "Consider increasing sample size by 15-20% or refining inclusion criteria to reduce dropout",
                "estimated_cost_to_fix": "$200K-$500K (additional patients)",
                "implementation_difficulty": "medium"
            })

        return findings[:4]  # Return top 4 findings

    def _generate_recommendations(self, protocol: Dict) -> List[Dict]:
        """Generate prioritized recommendations"""
        findings = self._generate_findings(protocol)
        recommendations = []

        for i, finding in enumerate(findings):
            # Extract impact
            severity_map = {"critical": 30, "high": 20, "medium": 12, "low": 5}
            risk_reduction = severity_map.get(finding["severity"], 10)

            recommendations.append({
                "priority": i + 1,
                "title": finding["recommendation"],
                "description": finding["description"],
                "expected_risk_reduction": risk_reduction,
                "estimated_cost": finding["estimated_cost_to_fix"],
                "implementation_time": "2-4 weeks" if finding["implementation_difficulty"] == "easy" else "1-2 months",
                "difficulty": finding["implementation_difficulty"],
                "impact_category": finding["category"]
            })

        return recommendations

    def _generate_similar_trials(self, protocol: Dict) -> List[Dict]:
        """Generate similar trial references"""
        therapeutic_area = protocol.get("patient_population", {}).get("therapeutic_area", "").lower()

        trials_db = {
            "psychiatry": [
                {
                    "nct_id": "NCT02134613",
                    "trial_name": "STAR*D Follow-up Study",
                    "phase": "Phase 3",
                    "therapeutic_area": "Psychiatry",
                    "drug_class": "SSRI",
                    "outcome": "failed",
                    "similarity_score": 0.87,
                    "key_learnings": [
                        "High placebo response (42%) without run-in",
                        "Treatment-resistant population poorly defined",
                        "Multiple sequential treatments diluted effect"
                    ],
                    "failure_reasons": [
                        "Inadequate placebo mitigation strategy",
                        "Heterogeneous patient population",
                        "Complex multi-arm design confused interpretation"
                    ]
                },
                {
                    "nct_id": "NCT01988441",
                    "trial_name": "ACHIEVE Study - Cariprazine Adjunctive MDD",
                    "phase": "Phase 3",
                    "therapeutic_area": "Psychiatry",
                    "drug_class": "Antipsychotic",
                    "outcome": "failed",
                    "similarity_score": 0.79,
                    "key_learnings": [
                        "Anhedonia-focused endpoint showed signal",
                        "Standard depression scales failed",
                        "Subgroup with high baseline anhedonia responded"
                    ],
                    "failure_reasons": [
                        "Primary endpoint not optimized for mechanism",
                        "All-comers design diluted effect",
                        "Placebo response 38% without mitigation"
                    ]
                }
            ],
            "oncology": [
                {
                    "nct_id": "NCT02298516",
                    "trial_name": "KEYLYNK-001: Pembrolizumab + Chemotherapy",
                    "phase": "Phase 3",
                    "therapeutic_area": "Oncology",
                    "drug_class": "PD-1 Inhibitor",
                    "outcome": "failed",
                    "similarity_score": 0.84,
                    "key_learnings": [
                        "Immunologically 'cold' tumors don't respond",
                        "PD-L1 negative patients showed no benefit",
                        "Combination didn't overcome lack of immune infiltration"
                    ],
                    "failure_reasons": [
                        "No PD-L1 enrichment strategy",
                        "All-comers design included non-responders",
                        "Tumor microenvironment not considered"
                    ]
                },
                {
                    "nct_id": "NCT02813135",
                    "trial_name": "HERTHENA-Lung01: HER3-ADC",
                    "phase": "Phase 2",
                    "therapeutic_area": "Oncology",
                    "drug_class": "Antibody-Drug Conjugate",
                    "outcome": "success",
                    "similarity_score": 0.76,
                    "key_learnings": [
                        "Biomarker-enriched design (HER3+) drove success",
                        "Single-arm design appropriate with strong effect",
                        "Clear responder population identified early"
                    ],
                    "failure_reasons": None
                }
            ]
        }

        # Return relevant trials
        if "psychiatry" in therapeutic_area:
            return trials_db["psychiatry"]
        elif "oncology" in therapeutic_area:
            return trials_db["oncology"]
        else:
            return trials_db["psychiatry"][:1]  # Default

    def _generate_executive_summary(self, protocol: Dict, risk_score: float) -> str:
        """Generate executive summary"""
        risk_level = self._get_risk_level(risk_score)
        therapeutic_area = protocol.get("patient_population", {}).get("therapeutic_area", "general")
        phase = protocol.get("metadata", {}).get("phase", "Phase 3")

        summaries = {
            "high": f"""This {phase} protocol in {therapeutic_area} presents substantial design vulnerabilities with an overall risk score of {risk_score:.0f}/100. Analysis against historical trials reveals critical gaps that significantly elevate failure probability.

The most pressing concern involves design elements that mirror failed trials in this therapeutic area. Historical data shows that protocols with similar characteristics face failure rates of 60-70%, primarily due to inadequate patient selection, suboptimal endpoints, and insufficient statistical power. Without modification, this protocol follows a well-documented path to disappointing results.

We recommend immediate implementation of three high-priority interventions: enhanced patient enrichment criteria (estimated risk reduction: 20%), refined statistical plan with proper power justification (15% risk reduction), and modified endpoint strategy aligned with regulatory expectations (18% risk reduction). Combined implementation cost of $300K-$600K represents less than 5% of total trial budget but could improve success probability by 35-40%.""",

            "medium": f"""This {phase} protocol in {therapeutic_area} demonstrates moderate design concerns with an overall risk score of {risk_score:.0f}/100. While the core approach is sound, several refinements would significantly strengthen the probability of success.

Comparison with historical trials identifies 2-3 areas where modifications could enhance the protocol's competitive position. Similar studies that addressed these issues showed 25-30% improvement in regulatory success rates. The risks are manageable with targeted interventions focused on patient selection and statistical rigor.

Priority recommendations include adding biomarker enrichment where appropriate ($150K-$300K), refining the statistical analysis plan ($5K-$10K), and enhancing safety monitoring protocols ($50K-$100K). These modifications could reduce failure risk by 20-25% while adding only 1-2 months to timeline and <$500K to budget.""",

            "low": f"""This {phase} protocol in {therapeutic_area} reflects strong design principles with a low risk score of {risk_score:.0f}/100. The protocol incorporates best practices and appears well-positioned for success based on historical precedent.

Analysis indicates thoughtful consideration of key risk factors, with design elements that align with successful trials in this area. The statistical plan appears adequate, patient selection criteria are appropriate, and endpoints are well-justified. Minor refinements could further optimize the protocol but are not critical to success.

Consider implementing 1-2 low-priority enhancements for additional assurance: clarifying specific monitoring procedures ($10K-$20K) and potentially increasing sample size by 10% to provide cushion against dropout ($100K-$200K). These optional improvements would provide additional confidence but the protocol is fundamentally sound as designed."""
        }

        return summaries.get(risk_level, summaries["medium"])


# Singleton instance
_mock_generator = None

def get_mock_generator() -> MockAnalysisGenerator:
    """Get mock generator singleton"""
    global _mock_generator
    if _mock_generator is None:
        _mock_generator = MockAnalysisGenerator()
    return _mock_generator
