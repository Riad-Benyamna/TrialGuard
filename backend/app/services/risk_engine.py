"""
Risk scoring and recommendation engine.
Implements quantitative algorithms for risk assessment.
"""

from typing import List, Dict
from app.models.analysis import RiskLevel, RiskCategory


class RiskEngine:
    """Engine for calculating risk scores and prioritizing recommendations"""

    def calculate_risk_score(
        self,
        protocol: Dict,
        similar_trials: List[Dict],
        gemini_analysis: Dict
    ) -> Dict:
        """
        Combine multiple signals into final risk score

        Scoring formula:
        Total Risk = (
            0.40 * historical_precedent_score +
            0.35 * safety_alignment_score +
            0.25 * design_completeness_score
        )

        Args:
            protocol: Protocol data
            similar_trials: List of similar historical trials
            gemini_analysis: Raw analysis from Gemini

        Returns:
            Complete risk score breakdown
        """
        # Calculate component scores
        historical_score = self._calculate_historical_precedent_score(
            protocol, similar_trials
        )
        safety_score = self._calculate_safety_alignment_score(
            protocol, gemini_analysis
        )
        design_score = self._calculate_design_completeness_score(
            protocol, gemini_analysis
        )

        # Weighted combination
        overall_score = (
            0.40 * historical_score["score"] +
            0.35 * safety_score["score"] +
            0.25 * design_score["score"]
        )

        # Determine risk level
        if overall_score < 30:
            risk_level = RiskLevel.LOW
        elif overall_score < 60:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.HIGH

        # Calculate confidence based on data availability
        confidence = self._calculate_confidence(
            len(similar_trials),
            gemini_analysis
        )

        return {
            "overall_score": round(overall_score, 1),
            "risk_level": risk_level.value,
            "confidence": round(confidence, 2),
            "category_scores": [
                historical_score,
                safety_score,
                design_score
            ]
        }

    def _calculate_historical_precedent_score(
        self,
        protocol: Dict,
        similar_trials: List[Dict]
    ) -> Dict:
        """
        Calculate historical precedent risk score (0-100)

        Higher score = higher risk based on historical failures
        """
        if not similar_trials:
            return {
                "category": RiskCategory.HISTORICAL_PRECEDENT.value,
                "score": 50.0,  # Neutral score if no data
                "findings_count": 0,
                "key_concerns": ["Limited historical data available"]
            }

        # Count failures among similar trials
        failed_trials = [t for t in similar_trials if t.get("outcome", "").lower() == "failed"]
        failure_rate = len(failed_trials) / len(similar_trials)

        # Base score from failure rate
        base_score = failure_rate * 100

        # Adjust by similarity strength
        avg_similarity = sum(t.get("similarity_score", 0) for t in similar_trials) / len(similar_trials)
        adjusted_score = base_score * avg_similarity

        # Severity adjustment for repeated failure patterns
        key_concerns = []
        severity_multiplier = 1.0

        for trial in failed_trials:
            failure_reasons = trial.get("failure_reasons", [])
            for reason in failure_reasons:
                if "placebo" in reason.lower():
                    severity_multiplier = max(severity_multiplier, 1.2)
                    key_concerns.append("High placebo response in similar trials")
                if "biomarker" in reason.lower() or "enrichment" in reason.lower():
                    severity_multiplier = max(severity_multiplier, 1.3)
                    key_concerns.append("Biomarker selection issues in similar trials")
                if "power" in reason.lower() or "sample size" in reason.lower():
                    severity_multiplier = max(severity_multiplier, 1.15)
                    key_concerns.append("Statistical power issues in similar trials")

        final_score = min(adjusted_score * severity_multiplier, 100)

        # Deduplicate concerns
        key_concerns = list(set(key_concerns))[:3]

        return {
            "category": RiskCategory.HISTORICAL_PRECEDENT.value,
            "score": round(final_score, 1),
            "findings_count": len(failed_trials),
            "key_concerns": key_concerns if key_concerns else [f"{len(failed_trials)}/{len(similar_trials)} similar trials failed"]
        }

    def _calculate_safety_alignment_score(
        self,
        protocol: Dict,
        gemini_analysis: Dict
    ) -> Dict:
        """
        Calculate safety alignment risk score (0-100)

        Higher score = more safety concerns
        """
        score = 0.0
        key_concerns = []

        # Extract drug contraindications
        drug_profile = protocol.get("drug_profile", {})
        contraindications = drug_profile.get("known_contraindications", [])

        # Extract patient exclusion criteria
        patient_pop = protocol.get("patient_population", {})
        exclusions = patient_pop.get("exclusion_criteria", [])

        # Check for unmitigated contraindications
        unmitigated_count = 0
        for contra in contraindications:
            # Simple check: is contraindication mentioned in exclusions?
            contra_lower = contra.lower()
            mentioned = any(contra_lower in excl.lower() for excl in exclusions)

            if not mentioned:
                unmitigated_count += 1
                score += 20  # Each unmitigated contraindication adds 20 points

        if unmitigated_count > 0:
            key_concerns.append(f"{unmitigated_count} contraindications not in exclusion criteria")

        # Check for missing safety monitoring
        safety_plan = protocol.get("safety_monitoring_plan")
        if not safety_plan or len(safety_plan) < 50:  # Less than 50 chars = likely incomplete
            score += 15
            key_concerns.append("Incomplete safety monitoring plan")

        # Check pharmacogenomic markers
        pg_markers = drug_profile.get("pharmacogenomic_markers", [])
        biomarker_reqs = patient_pop.get("biomarker_requirements", [])

        if pg_markers and not biomarker_reqs:
            score += 25
            key_concerns.append("Known pharmacogenomic markers not used for patient selection")

        # Cap at 100
        score = min(score, 100)

        return {
            "category": RiskCategory.SAFETY_ALIGNMENT.value,
            "score": round(score, 1),
            "findings_count": len(key_concerns),
            "key_concerns": key_concerns[:3]  # Top 3
        }

    def _calculate_design_completeness_score(
        self,
        protocol: Dict,
        gemini_analysis: Dict
    ) -> Dict:
        """
        Calculate design completeness risk score (0-100)

        Higher score = more design issues
        """
        score = 0.0
        key_concerns = []

        study_design = protocol.get("study_design", {})
        stat_plan = protocol.get("statistical_plan", {})

        # Missing placebo control (critical for efficacy trials)
        phase = protocol.get("metadata", {}).get("phase", "")
        is_efficacy_trial = "phase 2" in phase.lower() or "phase 3" in phase.lower()

        if is_efficacy_trial and not study_design.get("placebo_controlled", False):
            score += 30
            key_concerns.append("No placebo control in efficacy trial")

        # Missing power calculation
        if not stat_plan.get("power_calculation_provided", False):
            score += 25
            key_concerns.append("No statistical power calculation provided")

        # Unclear primary endpoint
        primary_endpoints = protocol.get("primary_endpoints", [])
        if not primary_endpoints:
            score += 20
            key_concerns.append("No primary endpoint defined")
        elif len(primary_endpoints) > 1:
            score += 10
            key_concerns.append("Multiple primary endpoints may dilute power")

        # Missing safety monitoring plan
        if not protocol.get("safety_monitoring_plan"):
            score += 15
            key_concerns.append("No safety monitoring plan")

        # No blinding in efficacy trial
        if is_efficacy_trial and study_design.get("blinding", "").lower() == "open-label":
            score += 20
            key_concerns.append("Open-label design in efficacy trial")

        # Inadequate sample size (basic check)
        planned_n = stat_plan.get("planned_enrollment", 0)
        if planned_n < 50 and is_efficacy_trial:
            score += 15
            key_concerns.append(f"Small sample size ({planned_n}) for efficacy trial")

        # Cap at 100
        score = min(score, 100)

        return {
            "category": RiskCategory.DESIGN_COMPLETENESS.value,
            "score": round(score, 1),
            "findings_count": len(key_concerns),
            "key_concerns": key_concerns[:3]
        }

    def _calculate_confidence(
        self,
        num_similar_trials: int,
        gemini_analysis: Dict
    ) -> float:
        """
        Calculate confidence in risk assessment (0-1)

        Based on:
        - Number of similar trials available
        - Completeness of protocol data
        - Quality of Gemini analysis
        """
        confidence = 0.5  # Base confidence

        # More similar trials = higher confidence
        if num_similar_trials >= 5:
            confidence += 0.3
        elif num_similar_trials >= 3:
            confidence += 0.2
        elif num_similar_trials >= 1:
            confidence += 0.1

        # Check analysis completeness
        findings = gemini_analysis.get("findings", [])
        if len(findings) >= 3:
            confidence += 0.2

        return min(confidence, 1.0)

    def prioritize_recommendations(
        self,
        identified_risks: List[Dict]
    ) -> List[Dict]:
        """
        Rank recommendations by impact and feasibility

        Priority = (Impact^2 * Feasibility) / 10000

        Args:
            identified_risks: List of risk findings from analysis

        Returns:
            Sorted list of recommendations with priority scores
        """
        recommendations = []

        difficulty_feasibility = {
            "easy": 100,
            "medium": 70,
            "hard": 40
        }

        for risk in identified_risks:
            # Estimate risk reduction based on severity
            severity = risk.get("severity", "medium")
            if severity == "critical":
                risk_reduction = 25
            elif severity == "high":
                risk_reduction = 18
            elif severity == "medium":
                risk_reduction = 10
            else:
                risk_reduction = 5

            # Get feasibility from difficulty
            difficulty = risk.get("implementation_difficulty", "medium")
            feasibility = difficulty_feasibility.get(difficulty, 70)

            # Calculate priority
            priority_score = (risk_reduction ** 2 * feasibility) / 10000

            recommendation = {
                "title": risk.get("title", "Untitled recommendation"),
                "description": risk.get("recommendation", ""),
                "expected_risk_reduction": risk_reduction,
                "estimated_cost": risk.get("estimated_cost_to_fix"),
                "implementation_time": self._estimate_implementation_time(difficulty),
                "difficulty": difficulty,
                "impact_category": risk.get("category", "design_completeness"),
                "priority_score": priority_score
            }

            recommendations.append(recommendation)

        # Sort by priority score (descending)
        recommendations.sort(key=lambda r: r["priority_score"], reverse=True)

        # Assign priority ranks
        for i, rec in enumerate(recommendations):
            rec["priority"] = i + 1
            del rec["priority_score"]  # Remove internal scoring

        return recommendations

    def _estimate_implementation_time(self, difficulty: str) -> str:
        """Estimate implementation timeline based on difficulty"""
        time_map = {
            "easy": "1-2 weeks",
            "medium": "1-2 months",
            "hard": "3-6 months"
        }
        return time_map.get(difficulty, "2-4 weeks")


# Singleton instance
_risk_engine = None

def get_risk_engine() -> RiskEngine:
    """Get or create risk engine singleton"""
    global _risk_engine
    if _risk_engine is None:
        _risk_engine = RiskEngine()
    return _risk_engine
