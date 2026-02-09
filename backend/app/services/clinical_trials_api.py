"""
ClinicalTrials.gov API service.
Fetches real clinical trial data and integrates with analysis.
"""

import httpx
import asyncio
import json
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Cache settings
CACHE_TTL_HOURS = 24
MAX_TRIALS_PER_QUERY = 100


class ClinicalTrialsAPIService:
    """Service for fetching real trial data from ClinicalTrials.gov"""

    def __init__(self):
        self.base_url = "https://clinicaltrials.gov/api/v2"
        self.cache = {}
        self.cache_timestamps = {}
        self.session = None

    async def _get_session(self) -> httpx.AsyncClient:
        """Get or create async HTTP session"""
        if self.session is None:
            self.session = httpx.AsyncClient(timeout=30.0)
        return self.session

    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached data is still valid"""
        if cache_key not in self.cache:
            return False
        
        cache_time = self.cache_timestamps.get(cache_key)
        if not cache_time:
            return False
        
        age = datetime.utcnow() - cache_time
        return age < timedelta(hours=CACHE_TTL_HOURS)

    async def search_trials(
        self,
        query: Optional[str] = None,
        condition: Optional[str] = None,
        intervention: Optional[str] = None,
        phase: Optional[str] = None,
        status: Optional[str] = "COMPLETED,TERMINATED",
        limit: int = 20
    ) -> List[Dict]:
        """
        Search ClinicalTrials.gov for trials matching criteria
        
        Args:
            query: Free text search query
            condition: Medical condition (e.g., "cancer")
            intervention: Type of intervention (e.g., "Drug")
            phase: Trial phase (e.g., "Phase 3")
            status: Trial status filter
            limit: Max results to return
            
        Returns:
            List of trial data
        """
        # Create cache key
        cache_key = f"search:{condition}:{intervention}:{phase}:{limit}"
        
        if self._is_cache_valid(cache_key):
            logger.info(f"Returning cached trials for {condition}")
            return self.cache[cache_key]
        
        try:
            session = await self._get_session()
            
            # Build query parameters
            params = {
                "pageSize": min(limit, MAX_TRIALS_PER_QUERY),
                "format": "json"
            }
            
            # Add filters
            filter_clauses = []
            
            if condition:
                filter_clauses.append(f'condition:"{condition}"')
            
            if intervention:
                filter_clauses.append(f'interventionType:"{intervention}"')
            
            if phase:
                filter_clauses.append(f'phase:"{phase}"')
            
            if status:
                statuses = status.split(",")
                status_clause = " OR ".join([f'overallStatus:"{s.strip()}"' for s in statuses])
                filter_clauses.append(f"({status_clause})")
            
            if filter_clauses:
                params["query.cond"] = " AND ".join(filter_clauses)
            
            # Make API request
            logger.info(f"Fetching trials from ClinicalTrials.gov: {params}")
            response = await session.get(f"{self.base_url}/studies", params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract and transform trials
            trials = []
            studies = data.get("studies", [])
            
            for study in studies[:limit]:
                try:
                    trial = self._transform_trial_data(study)
                    trials.append(trial)
                except Exception as e:
                    logger.warning(f"Failed to transform trial: {e}")
                    continue
            
            # Cache results
            self.cache[cache_key] = trials
            self.cache_timestamps[cache_key] = datetime.utcnow()
            
            logger.info(f"Fetched {len(trials)} trials from ClinicalTrials.gov")
            return trials
            
        except httpx.TimeoutException:
            logger.error("ClinicalTrials.gov API timeout")
            return []
        except httpx.HTTPError as e:
            logger.error(f"ClinicalTrials.gov API error: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching trials: {e}")
            return []

    def _transform_trial_data(self, study: Dict) -> Dict:
        """
        Transform ClinicalTrials.gov API response to our trial format
        
        Args:
            study: Raw study data from API
            
        Returns:
            Formatted trial data
        """
        protocol = study.get("protocolSection", {})
        id_module = protocol.get("identificationModule", {})
        status_module = protocol.get("statusModule", {})
        design_module = protocol.get("designModule", {})
        recruitment_module = protocol.get("recruitmentModule", {})
        conditions_module = protocol.get("conditionsModule", {})
        interventions_module = protocol.get("interventionsModule", {})
        
        # Extract basic info
        nct_id = id_module.get("nctId", "UNKNOWN")
        trial_name = id_module.get("officialTitle", "")
        sponsor = id_module.get("organization", {}).get("fullName", "")
        
        # Extract phase
        phases = design_module.get("phases", [])
        phase = phases[0] if phases else "Unknown"
        
        # Extract conditions/therapeutic area
        conditions = conditions_module.get("conditions", [])
        therapeutic_area = conditions[0].lower() if conditions else "unknown"
        
        # Extract interventions/drug info
        interventions = interventions_module.get("interventions", [])
        drug_class = "Unknown"
        if interventions:
            drug_class = interventions[0].get("type", "Unknown")
        
        # Extract enrollment
        enrollment = recruitment_module.get("enrollmentInfo", {})
        actual_enrollment = enrollment.get("count", 0)
        
        # Extract status
        overall_status = status_module.get("overallStatus", "Unknown")
        
        # Determine outcome based on status
        outcome = "unknown"
        if overall_status == "COMPLETED":
            outcome = "completed"
        elif overall_status in ["TERMINATED", "WITHDRAWN"]:
            outcome = "failed"
        elif overall_status in ["RECRUITING", "ACTIVE_NOT_RECRUITING"]:
            outcome = "ongoing"
        
        # Extract dates
        start_date = status_module.get("startDateStruct", {}).get("date", "")
        completion_date = status_module.get("completionDateStruct", {}).get("date", "")
        
        # Try to extract year
        year = 2024
        if start_date:
            try:
                year = int(start_date.split("-")[0])
            except:
                pass
        
        # Build trial data
        trial = {
            "nct_id": nct_id,
            "trial_name": trial_name[:200],  # Limit length
            "phase": phase,
            "sponsor": sponsor[:200],
            "therapeutic_area": therapeutic_area,
            "drug_class": drug_class,
            "mechanism_of_action": interventions[0].get("description", "") if interventions else "",
            "population_age": "Not specified",
            "disease_indication": conditions[0] if conditions else "Unknown",
            "study_design": design_module.get("studyType", "Unknown"),
            "blinding": design_module.get("designInfo", {}).get("maskingInfo", {}).get("masking", "Unknown"),
            "placebo_controlled": any("placebo" in str(i).lower() for i in interventions),
            "planned_enrollment": actual_enrollment,
            "actual_enrollment": actual_enrollment,
            "outcome": outcome,
            "year": year,
            "start_date": start_date,
            "completion_date": completion_date,
            "overall_status": overall_status,
            "source": "clinicaltrials.gov",
            "api_fetched": True
        }
        
        return trial

    async def search_by_therapeutic_area(
        self,
        therapeutic_area: str,
        limit: int = 15
    ) -> List[Dict]:
        """
        Search trials by therapeutic area
        
        Args:
            therapeutic_area: Medical condition or therapeutic area
            limit: Max trials to return
            
        Returns:
            List of matching trials
        """
        return await self.search_trials(
            condition=therapeutic_area,
            status="COMPLETED,TERMINATED",
            limit=limit
        )

    async def search_by_drug_class(
        self,
        drug_class: str,
        therapeutic_area: Optional[str] = None,
        limit: int = 15
    ) -> List[Dict]:
        """
        Search trials by drug class with optional therapeutic area filter
        
        Args:
            drug_class: Type of drug/intervention
            therapeutic_area: Optional therapeutic area filter
            limit: Max trials to return
            
        Returns:
            List of matching trials
        """
        return await self.search_trials(
            condition=therapeutic_area,
            intervention=drug_class,
            status="COMPLETED,TERMINATED",
            limit=limit
        )

    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.aclose()


# Singleton instance
_api_service = None


def get_clinical_trials_api_service() -> ClinicalTrialsAPIService:
    """Get or create singleton API service instance"""
    global _api_service
    if _api_service is None:
        _api_service = ClinicalTrialsAPIService()
    return _api_service
