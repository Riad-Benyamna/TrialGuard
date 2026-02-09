"""
Historical trials database service.
Handles loading, indexing, searching, and comparing historical trial data.
"""

import json
import asyncio
from typing import List, Dict, Optional
from pathlib import Path
from collections import defaultdict
import re


class HistoricalDatabaseService:
    """Service for managing and querying historical clinical trials"""

    def __init__(self):
        self.trials: List[Dict] = []
        self.indices: Dict[str, Dict] = {
            "drug_class": defaultdict(list),
            "therapeutic_area": defaultdict(list),
            "phase": defaultdict(list),
            "outcome": defaultdict(list),
            "tags": defaultdict(list),
            "nct_id": {}
        }
        self.failure_patterns: Dict = {}
        self.loaded = False

    async def load_database(self, filepath: Optional[str] = None):
        """
        Load trials JSON and build search indices

        Args:
            filepath: Path to historical_trials.json file
        """
        if self.loaded:
            return

        if filepath is None:
            # Default path
            base_path = Path(__file__).parent.parent
            filepath = base_path / "data" / "historical_trials.json"

        try:
            # Read JSON file
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.trials = data.get("trials", [])
                self.failure_patterns = data.get("failure_patterns", {})

            # Build indices
            await self._build_indices()

            self.loaded = True
            print(f"Loaded {len(self.trials)} historical trials")

        except FileNotFoundError:
            print(f"Warning: Historical trials database not found at {filepath}")
            print("Using empty database. Please create the database file.")
            self.trials = []
            self.loaded = True

        except Exception as e:
            print(f"Error loading historical database: {str(e)}")
            raise

    async def _build_indices(self):
        """Build search indices from loaded trials"""
        for trial in self.trials:
            nct_id = trial.get("nct_id", "")

            # Index by NCT ID
            if nct_id:
                self.indices["nct_id"][nct_id] = trial

            # Index by drug class (normalize to lowercase)
            drug_class = trial.get("drug_class", "").lower()
            if drug_class:
                self.indices["drug_class"][drug_class].append(nct_id)

            # Index by therapeutic area
            therapeutic_area = trial.get("therapeutic_area", "").lower()
            if therapeutic_area:
                self.indices["therapeutic_area"][therapeutic_area].append(nct_id)

            # Index by phase
            phase = trial.get("phase", "")
            if phase:
                self.indices["phase"][phase].append(nct_id)

            # Index by outcome
            outcome = trial.get("outcome", "").lower()
            if outcome:
                self.indices["outcome"][outcome].append(nct_id)

            # Index by tags
            tags = trial.get("tags", [])
            for tag in tags:
                self.indices["tags"][tag.lower()].append(nct_id)

    def _calculate_similarity_score(
        self,
        trial: Dict,
        drug_class: str,
        population_age: Optional[str] = None,
        therapeutic_area: Optional[str] = None,
        phase: Optional[str] = None
    ) -> float:
        """
        Calculate similarity score between query and trial

        Args:
            trial: Historical trial data
            drug_class: Query drug class
            population_age: Query age range (e.g., "18-65")
            therapeutic_area: Query therapeutic area
            phase: Query phase

        Returns:
            Similarity score (0-1)
        """
        score = 0.0
        max_score = 0.0

        # Drug class match (weight: 0.4)
        max_score += 0.4
        trial_drug_class = trial.get("drug_class", "").lower()
        if trial_drug_class == drug_class.lower():
            score += 0.4
        elif drug_class.lower() in trial_drug_class or trial_drug_class in drug_class.lower():
            score += 0.2

        # Therapeutic area match (weight: 0.3)
        if therapeutic_area:
            max_score += 0.3
            trial_area = trial.get("therapeutic_area", "").lower()
            if trial_area == therapeutic_area.lower():
                score += 0.3
            elif therapeutic_area.lower() in trial_area or trial_area in therapeutic_area.lower():
                score += 0.15

        # Phase match (weight: 0.2, allow ±1 phase)
        if phase:
            max_score += 0.2
            trial_phase = trial.get("phase", "")
            if trial_phase == phase:
                score += 0.2
            elif self._phases_adjacent(trial_phase, phase):
                score += 0.1

        # Population age overlap (weight: 0.1)
        if population_age:
            max_score += 0.1
            trial_age = trial.get("population_age", "")
            if trial_age and self._age_ranges_overlap(trial_age, population_age):
                score += 0.1

        return score / max_score if max_score > 0 else 0.0

    def _phases_adjacent(self, phase1: str, phase2: str) -> bool:
        """Check if two phases are adjacent (e.g., Phase 2 and Phase 3)"""
        phase_order = ["Phase 1", "Phase 1/2", "Phase 2", "Phase 2/3", "Phase 3", "Phase 4"]
        try:
            idx1 = phase_order.index(phase1)
            idx2 = phase_order.index(phase2)
            return abs(idx1 - idx2) <= 1
        except ValueError:
            return False

    def _age_ranges_overlap(self, range1: str, range2: str) -> bool:
        """Check if two age ranges overlap"""
        def parse_age_range(age_str: str) -> tuple:
            """Parse age range string like '18-65' into (min, max)"""
            match = re.search(r'(\d+)-(\d+)', age_str)
            if match:
                return int(match.group(1)), int(match.group(2))
            return None

        r1 = parse_age_range(range1)
        r2 = parse_age_range(range2)

        if r1 and r2:
            # Check for overlap
            return not (r1[1] < r2[0] or r2[1] < r1[0])
        return False

    async def find_similar_trials(
        self,
        drug_class: str,
        population_age: Optional[str] = None,
        therapeutic_area: Optional[str] = None,
        phase: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict]:
        """
        Multi-stage similarity search

        Args:
            drug_class: Drug class to match
            population_age: Target age range
            therapeutic_area: Therapeutic area
            phase: Clinical trial phase
            top_k: Number of results to return

        Returns:
            List of similar trials with similarity scores
        """
        if not self.loaded:
            await self.load_database()

        # Stage 1: Filter by hard criteria
        candidates = []

        # Get trials matching drug class
        drug_class_lower = drug_class.lower()
        matching_nct_ids = set()

        # Exact match
        if drug_class_lower in self.indices["drug_class"]:
            matching_nct_ids.update(self.indices["drug_class"][drug_class_lower])

        # Partial match (contains)
        for indexed_class, nct_ids in self.indices["drug_class"].items():
            if drug_class_lower in indexed_class or indexed_class in drug_class_lower:
                matching_nct_ids.update(nct_ids)

        # Filter by therapeutic area if provided
        if therapeutic_area:
            area_nct_ids = set(self.indices["therapeutic_area"].get(therapeutic_area.lower(), []))
            if area_nct_ids:
                matching_nct_ids &= area_nct_ids

        # Get candidate trials
        for nct_id in matching_nct_ids:
            trial = self.indices["nct_id"].get(nct_id)
            if trial:
                candidates.append(trial)

        # If not enough candidates, expand search
        if len(candidates) < top_k and therapeutic_area:
            # Remove therapeutic area filter
            for nct_id in self.indices["drug_class"].get(drug_class_lower, []):
                trial = self.indices["nct_id"].get(nct_id)
                if trial and trial not in candidates:
                    candidates.append(trial)

        # Stage 2: Score remaining trials
        scored_trials = []
        for trial in candidates:
            similarity = self._calculate_similarity_score(
                trial, drug_class, population_age, therapeutic_area, phase
            )
            trial_with_score = trial.copy()
            trial_with_score["similarity_score"] = similarity
            scored_trials.append(trial_with_score)

        # Stage 3: Sort and return top K
        scored_trials.sort(key=lambda t: t["similarity_score"], reverse=True)

        return scored_trials[:top_k]

    def get_failure_patterns(
        self,
        therapeutic_area: str,
        drug_class: Optional[str] = None
    ) -> Dict:
        """
        Return pre-computed failure patterns

        Args:
            therapeutic_area: Therapeutic area to query
            drug_class: Optional drug class for more specific patterns

        Returns:
            Failure pattern data
        """
        key = therapeutic_area.lower()
        if drug_class:
            key = f"{therapeutic_area.lower()}_{drug_class.lower()}"

        return self.failure_patterns.get(key, {})

    def generate_comparison_table(
        self,
        current_protocol: Dict,
        historical_trial: Dict
    ) -> Dict:
        """
        Create side-by-side comparison for UI display

        Args:
            current_protocol: Current protocol being analyzed
            historical_trial: Historical trial to compare against

        Returns:
            Comparison data structure for UI
        """
        rows = []

        # Helper to determine match status and risk
        def compare_field(field_name: str, current_val: str, historical_val: str,
                         is_risk_factor: bool = False) -> tuple:
            """Returns (match_status, risk_level)"""
            if current_val == historical_val:
                if is_risk_factor:
                    return "RISK_FACTOR", "high"
                return "EXACT_MATCH", "low"
            elif self._values_similar(current_val, historical_val):
                return "MATCH", "medium"
            else:
                return "MISMATCH", "low"

        # Population Age
        current_age = current_protocol.get("patient_population", {}).get("age_range", "Unknown")
        historical_age = historical_trial.get("population_age", "Unknown")
        match_status, risk_level = compare_field("Population Age", current_age, historical_age)
        rows.append({
            "field": "Population Age",
            "current": current_age,
            "historical": historical_age,
            "match_status": match_status,
            "risk_level": risk_level
        })

        # Drug Class
        current_drug = current_protocol.get("drug_profile", {}).get("drug_class", "Unknown")
        historical_drug = historical_trial.get("drug_class", "Unknown")
        match_status, risk_level = compare_field("Drug Class", current_drug, historical_drug)
        rows.append({
            "field": "Drug Class",
            "current": current_drug,
            "historical": historical_drug,
            "match_status": match_status,
            "risk_level": risk_level
        })

        # Study Design
        current_design = current_protocol.get("study_design", {}).get("design_type", "Unknown")
        historical_design = historical_trial.get("study_design", "Unknown")
        match_status, risk_level = compare_field("Study Design", current_design, historical_design)
        rows.append({
            "field": "Study Design",
            "current": current_design,
            "historical": historical_design,
            "match_status": match_status,
            "risk_level": risk_level
        })

        # Placebo Run-in (risk factor if both False and trial failed)
        current_placebo = current_protocol.get("study_design", {}).get("placebo_run_in", False)
        historical_placebo = historical_trial.get("placebo_run_in", False)
        trial_failed = historical_trial.get("outcome", "").lower() == "failed"

        is_risk = not current_placebo and not historical_placebo and trial_failed
        match_status, risk_level = compare_field(
            "Placebo Run-in",
            "Yes" if current_placebo else "No",
            "Yes" if historical_placebo else "No",
            is_risk_factor=is_risk
        )
        rows.append({
            "field": "Placebo Run-in",
            "current": "Yes" if current_placebo else "No",
            "historical": "Yes" if historical_placebo else "No",
            "match_status": match_status,
            "risk_level": risk_level,
            "explanation": "Trial failed without placebo run-in" if is_risk else None
        })

        # Sample Size
        current_n = current_protocol.get("statistical_plan", {}).get("planned_enrollment", 0)
        historical_n = historical_trial.get("planned_enrollment", 0)
        rows.append({
            "field": "Sample Size",
            "current": str(current_n),
            "historical": str(historical_n),
            "match_status": "MATCH" if abs(current_n - historical_n) < 50 else "MISMATCH",
            "risk_level": "medium" if current_n < historical_n else "low"
        })

        # Calculate overall similarity
        similar_count = sum(1 for row in rows if row["match_status"] in ["EXACT_MATCH", "MATCH"])
        overall_similarity = similar_count / len(rows) if rows else 0.0

        # Risk assessment
        high_risk_count = sum(1 for row in rows if row["risk_level"] == "high")
        if high_risk_count > 0:
            risk_assessment = f"High similarity to failed trial ({high_risk_count} risk factors)"
        elif overall_similarity > 0.7:
            risk_assessment = "High similarity to historical trial"
        else:
            risk_assessment = "Moderate similarity"

        return {
            "historical_trial": {
                "nct_id": historical_trial.get("nct_id", "Unknown"),
                "trial_name": historical_trial.get("trial_name", "Unknown"),
                "outcome": historical_trial.get("outcome", "Unknown"),
                "phase": historical_trial.get("phase", "Unknown")
            },
            "comparison_rows": rows,
            "overall_similarity": overall_similarity,
            "risk_assessment": risk_assessment
        }

    def _values_similar(self, val1: str, val2: str) -> bool:
        """Check if two string values are similar"""
        v1 = val1.lower().strip()
        v2 = val2.lower().strip()
        return v1 in v2 or v2 in v1 or v1 == v2

    async def search_trials_by_filters(
        self,
        drug_class: Optional[str] = None,
        therapeutic_area: Optional[str] = None,
        phase: Optional[str] = None,
        outcome_filter: str = "all",
        limit: int = 5
    ) -> List[Dict]:
        """
        Search trials with flexible filters (for function calling)

        Args:
            drug_class: Drug class filter
            therapeutic_area: Therapeutic area filter
            phase: Phase filter
            outcome_filter: Outcome filter (failed, success, terminated, all)
            limit: Max results

        Returns:
            List of matching trials
        """
        if not self.loaded:
            await self.load_database()

        results = []

        for trial in self.trials:
            # Apply filters
            if drug_class:
                trial_class = trial.get("drug_class", "").lower()
                if drug_class.lower() not in trial_class and trial_class not in drug_class.lower():
                    continue

            if therapeutic_area:
                trial_area = trial.get("therapeutic_area", "").lower()
                if therapeutic_area.lower() not in trial_area:
                    continue

            if phase:
                if trial.get("phase", "") != phase:
                    continue

            if outcome_filter != "all":
                trial_outcome = trial.get("outcome", "").lower()
                if trial_outcome != outcome_filter.lower():
                    continue

            results.append(trial)

            if len(results) >= limit:
                break

        return results

    async def fetch_real_trials_by_area(
        self,
        therapeutic_area: str,
        limit: int = 10
    ) -> List[Dict]:
        """
        Fetch real trials from ClinicalTrials.gov by therapeutic area
        
        Args:
            therapeutic_area: Medical condition/therapeutic area
            limit: Max trials to return
            
        Returns:
            List of real trial data from API
        """
        try:
            from app.services.clinical_trials_api import get_clinical_trials_api_service
            
            api_service = get_clinical_trials_api_service()
            trials = await api_service.search_by_therapeutic_area(
                therapeutic_area=therapeutic_area,
                limit=limit
            )
            
            print(f"Fetched {len(trials)} real trials for {therapeutic_area}")
            return trials
            
        except Exception as e:
            print(f"Error fetching real trials: {e}")
            return []

    async def fetch_real_trials_by_drug(
        self,
        drug_class: str,
        therapeutic_area: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        Fetch real trials from ClinicalTrials.gov by drug class
        
        Args:
            drug_class: Drug class or intervention type
            therapeutic_area: Optional therapeutic area filter
            limit: Max trials to return
            
        Returns:
            List of real trial data from API
        """
        try:
            from app.services.clinical_trials_api import get_clinical_trials_api_service
            
            api_service = get_clinical_trials_api_service()
            trials = await api_service.search_by_drug_class(
                drug_class=drug_class,
                therapeutic_area=therapeutic_area,
                limit=limit
            )
            
            print(f"Fetched {len(trials)} real trials for drug class {drug_class}")
            return trials
            
        except Exception as e:
            print(f"Error fetching real trials: {e}")
            return []

    async def get_combined_trials(
        self,
        therapeutic_area: str,
        drug_class: Optional[str] = None,
        limit: int = 15
    ) -> List[Dict]:
        """
        Get combined results from local database + real API data
        
        Args:
            therapeutic_area: Therapeutic area to search
            drug_class: Optional drug class filter
            limit: Total max results to return
            
        Returns:
            Combined list of local + real trials, prioritizing failed ones
        """
        all_trials = []
        
        # Get local trials
        local_trials = await self.find_similar_trials(
            drug_class=drug_class or "any",
            therapeutic_area=therapeutic_area,
            top_k=limit // 2
        )
        all_trials.extend(local_trials)
        
        # Get real trials from API
        real_trials = await self.fetch_real_trials_by_area(
            therapeutic_area=therapeutic_area,
            limit=limit // 2
        )
        all_trials.extend(real_trials)
        
        # Sort by outcome (failed first) then by similarity/recency
        failed_trials = [t for t in all_trials if t.get("outcome") in ["failed", "terminated"]]
        other_trials = [t for t in all_trials if t.get("outcome") not in ["failed", "terminated"]]
        
        combined = failed_trials + other_trials
        return combined[:limit]


# Singleton instance
_historical_db_service = None

def get_historical_db_service() -> HistoricalDatabaseService:
    """Get or create historical database service singleton"""
    global _historical_db_service
    if _historical_db_service is None:
        _historical_db_service = HistoricalDatabaseService()
    return _historical_db_service
