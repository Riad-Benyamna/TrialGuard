"""
Analysis results storage service.
Persists analysis results to disk for retrieval and historical tracking.
"""

import json
import asyncio
from typing import List, Dict, Optional
from pathlib import Path
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AnalysisStorageService:
    """Service for storing and retrieving analysis results"""

    def __init__(self, storage_dir: Optional[str] = None):
        if storage_dir is None:
            base_path = Path(__file__).parent.parent
            storage_dir = base_path / "data" / "analyses"
        
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.analyses_file = self.storage_dir / "saved_analyses.json"
        self._load_all_analyses()

    def _load_all_analyses(self):
        """Load all saved analyses from disk"""
        self.analyses = {}
        
        try:
            if self.analyses_file.exists():
                with open(self.analyses_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.analyses = data.get('analyses', {})
                logger.info(f"Loaded {len(self.analyses)} saved analyses")
        except Exception as e:
            logger.error(f"Error loading analyses: {e}")
            self.analyses = {}

    def _save_all_analyses(self):
        """Persist all analyses to disk"""
        try:
            with open(self.analyses_file, 'w', encoding='utf-8') as f:
                json.dump(
                    {'analyses': self.analyses, 'last_updated': datetime.utcnow().isoformat()},
                    f,
                    indent=2
                )
        except Exception as e:
            logger.error(f"Error saving analyses: {e}")

    async def save_analysis(
        self,
        analysis_id: str,
        protocol: Dict,
        analysis_result: Dict,
        trial_name: Optional[str] = None
    ) -> Dict:
        """
        Save an analysis result to persistent storage
        
        Args:
            analysis_id: Unique analysis identifier
            protocol: Protocol data that was analyzed
            analysis_result: Complete analysis result
            trial_name: Optional trial name for display
            
        Returns:
            Saved analysis metadata
        """
        saved_analysis = {
            'analysis_id': analysis_id,
            'trial_name': trial_name or protocol.get('metadata', {}).get('trial_name', 'Unknown Trial'),
            'created_at': datetime.utcnow().isoformat(),
            'overall_score': analysis_result.get('risk_score', {}).get('overall_score', 0),
            'risk_level': analysis_result.get('risk_score', {}).get('risk_level', 'unknown'),
            'protocol': protocol,
            'analysis': analysis_result,
        }
        
        self.analyses[analysis_id] = saved_analysis
        self._save_all_analyses()
        
        logger.info(f"Saved analysis {analysis_id}")
        return saved_analysis

    async def get_analysis(self, analysis_id: str) -> Optional[Dict]:
        """
        Retrieve a saved analysis by ID
        
        Args:
            analysis_id: Analysis identifier
            
        Returns:
            Analysis data or None if not found
        """
        return self.analyses.get(analysis_id)

    async def get_all_analyses(self, limit: int = 50) -> List[Dict]:
        """
        Get all saved analyses
        
        Args:
            limit: Maximum number to return
            
        Returns:
            List of saved analyses (metadata only, no full analysis data)
        """
        # Return metadata only (not full analysis) sorted by date
        analyses_list = []
        for analysis_id, analysis in self.analyses.items():
            analyses_list.append({
                'analysis_id': analysis_id,
                'trial_name': analysis.get('trial_name', 'Unknown'),
                'created_at': analysis.get('created_at'),
                'overall_score': analysis.get('overall_score', 0),
                'risk_level': analysis.get('risk_level', 'unknown'),
            })
        
        # Sort by created_at descending
        analyses_list.sort(
            key=lambda x: x.get('created_at', ''),
            reverse=True
        )
        
        return analyses_list[:limit]

    async def delete_analysis(self, analysis_id: str) -> bool:
        """
        Delete a saved analysis
        
        Args:
            analysis_id: Analysis identifier
            
        Returns:
            True if deleted, False if not found
        """
        if analysis_id in self.analyses:
            del self.analyses[analysis_id]
            self._save_all_analyses()
            logger.info(f"Deleted analysis {analysis_id}")
            return True
        return False

    async def search_analyses(
        self,
        query: Optional[str] = None,
        risk_level: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict]:
        """
        Search saved analyses
        
        Args:
            query: Search query (matches trial name)
            risk_level: Filter by risk level
            limit: Max results
            
        Returns:
            List of matching analyses
        """
        results = []
        
        for analysis_id, analysis in self.analyses.items():
            # Check query match
            if query:
                trial_name = analysis.get('trial_name', '').lower()
                if query.lower() not in trial_name and query.lower() not in analysis_id.lower():
                    continue
            
            # Check risk level match
            if risk_level:
                if analysis.get('risk_level') != risk_level:
                    continue
            
            results.append({
                'analysis_id': analysis_id,
                'trial_name': analysis.get('trial_name', 'Unknown'),
                'created_at': analysis.get('created_at'),
                'overall_score': analysis.get('overall_score', 0),
                'risk_level': analysis.get('risk_level', 'unknown'),
            })
        
        # Sort by created_at
        results.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return results[:limit]


# Singleton instance
_storage_service = None


def get_analysis_storage_service() -> AnalysisStorageService:
    """Get or create analysis storage service singleton"""
    global _storage_service
    if _storage_service is None:
        _storage_service = AnalysisStorageService()
    return _storage_service
