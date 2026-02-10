"""
Gemini 3.0 API service implementation.
Handles all interactions with Google's Gemini AI models.
"""

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import json
import hashlib
import asyncio
import logging
from typing import Optional, Dict, List, AsyncGenerator
from datetime import datetime, timedelta
import time

from app.config import settings
from app.utils.prompts import (
    PROTOCOL_PARSING_PROMPT,
    RISK_ANALYSIS_SYSTEM_PROMPT,
    get_risk_analysis_prompt,
    EXECUTIVE_SUMMARY_PROMPT,
    CHAT_SYSTEM_PROMPT,
    FUNCTION_CALLING_TOOLS
)

# Configure logger
logger = logging.getLogger(__name__)


class RateLimiter:
    """Token bucket rate limiter for API calls"""

    def __init__(self, rpm: int = 60):
        self.rpm = rpm
        self.requests = []

    async def acquire(self):
        """Wait if necessary to respect rate limit"""
        now = datetime.utcnow()
        # Remove requests older than 1 minute
        self.requests = [req_time for req_time in self.requests
                        if now - req_time < timedelta(minutes=1)]

        if len(self.requests) >= self.rpm:
            # Wait until oldest request expires
            wait_time = 60 - (now - self.requests[0]).total_seconds()
            if wait_time > 0:
                await asyncio.sleep(wait_time)
            self.requests.pop(0)

        self.requests.append(now)


class CostTracker:
    """Track API usage costs"""

    def __init__(self):
        self.daily_costs = {}

    def track_usage(self, model: str, input_tokens: int, output_tokens: int):
        """Track token usage and calculate cost"""
        # Gemini 3.0 pricing (per 1M tokens)
        pricing = {
            "gemini-3.0-flash": {"input": 0.075, "output": 0.30},
            "gemini-3.0-pro": {"input": 1.25, "output": 5.00}
        }

        if model not in pricing:
            return

        cost = (
            (input_tokens / 1_000_000) * pricing[model]["input"] +
            (output_tokens / 1_000_000) * pricing[model]["output"]
        )

        today = datetime.utcnow().date()
        if today not in self.daily_costs:
            self.daily_costs[today] = 0.0
        self.daily_costs[today] += cost

        return cost

    def get_daily_cost(self, date=None):
        """Get total cost for a specific day"""
        date = date or datetime.utcnow().date()
        return self.daily_costs.get(date, 0.0)


class GeminiService:
    """Service for interacting with Gemini 3.0 API"""

    def __init__(self):
        # Configure API
        genai.configure(api_key=settings.gemini_api_key)

        # Initialize models with error handling
        logger.info(f"Initializing Gemini models: Flash={settings.gemini_flash_model}, Pro={settings.gemini_pro_model}")
        try:
            self.flash_model = genai.GenerativeModel(settings.gemini_flash_model)
            logger.info(f"✓ Flash model loaded: {settings.gemini_flash_model}")
        except Exception as e:
            logger.error(f"Failed to load flash model {settings.gemini_flash_model}: {e}")
            raise
        
        try:
            self.pro_model = genai.GenerativeModel(settings.gemini_pro_model)
            logger.info(f"✓ Pro model loaded: {settings.gemini_pro_model}")
        except Exception as e:
            logger.error(f"Failed to load pro model {settings.gemini_pro_model}: {e}")
            raise

        # Rate limiting and cost tracking
        self.rate_limiter = RateLimiter(rpm=settings.gemini_rate_limit_rpm)
        self.cost_tracker = CostTracker()

        # Simple in-memory cache (use Redis in production)
        self.cache = {}

    def _cache_key(self, prompt: str, model: str) -> str:
        """Generate cache key from prompt hash and model name"""
        prompt_hash = hashlib.sha256(prompt.encode()).hexdigest()
        return f"{model}:{prompt_hash}"

    async def _get_cached_response(self, cache_key: str) -> Optional[dict]:
        """Retrieve cached response if available and not expired"""
        if cache_key in self.cache:
            cached_data, expiry = self.cache[cache_key]
            if datetime.utcnow() < expiry:
                return cached_data
            else:
                del self.cache[cache_key]
        return None

    async def _set_cached_response(self, cache_key: str, response: dict, ttl: int):
        """Cache response with TTL in seconds"""
        expiry = datetime.utcnow() + timedelta(seconds=ttl)
        self.cache[cache_key] = (response, expiry)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ConnectionError, TimeoutError))
    )
    async def _generate_content(
        self,
        model: genai.GenerativeModel,
        prompt: str,
        response_mime_type: Optional[str] = None,
        tools: Optional[List] = None
    ) -> str:
        """
        Generate content with retry logic

        Args:
            model: Gemini model instance
            prompt: Input prompt
            response_mime_type: Optional MIME type for structured output
            tools: Optional function calling tools

        Returns:
            Generated text response
        """
        await self.rate_limiter.acquire()

        generation_config = {}
        if response_mime_type:
            generation_config["response_mime_type"] = response_mime_type

        try:
            # Make API call
            if tools:
                response = await asyncio.to_thread(
                    model.generate_content,
                    prompt,
                    generation_config=generation_config,
                    tools=tools
                )
            else:
                response = await asyncio.to_thread(
                    model.generate_content,
                    prompt,
                    generation_config=generation_config
                )

            # Track costs (approximate token counting)
            input_tokens = len(prompt.split()) * 1.3  # Rough estimate
            output_tokens = len(response.text.split()) * 1.3
            self.cost_tracker.track_usage(
                model.model_name,
                int(input_tokens),
                int(output_tokens)
            )

            return response.text

        except Exception as e:
            model_name = getattr(model, 'model_name', 'unknown')
            error_msg = str(e)
            logger.error(f"Gemini API error with model {model_name}: {error_msg}")
            
            # Check for model not found errors
            if "is not found" in error_msg or "not supported" in error_msg:
                logger.error(f"Model '{model_name}' not found or not supported. Check available models at https://ai.google.dev/models")
                raise ValueError(f"Model {model_name} is not available. Please use a supported model name. Details: {error_msg}")
            
            raise

    async def parse_protocol_pdf(self, pdf_bytes: bytes) -> dict:
        """
        Extract structured data from protocol PDF

        Args:
            pdf_bytes: PDF file content as bytes

        Returns:
            Parsed protocol data as dictionary
        """
        # Check cache
        cache_key = self._cache_key(
            hashlib.sha256(pdf_bytes).hexdigest(),
            "parse_pdf"
        )
        cached = await self._get_cached_response(cache_key)
        if cached:
            return cached

        # Upload file to Gemini (supports multimodal)
        # Note: For MVP, we'll use text extraction. Full implementation would use Gemini File API
        # For now, simulate extraction from text
        try:
            from PyPDF2 import PdfReader
            from io import BytesIO

            pdf_file = BytesIO(pdf_bytes)
            reader = PdfReader(pdf_file)

            # Extract text from all pages
            text_content = ""
            for page in reader.pages:
                text_content += page.extract_text() + "\n"

            # Use Gemini Flash for fast parsing
            prompt = f"{PROTOCOL_PARSING_PROMPT}\n\nPROTOCOL CONTENT:\n{text_content[:50000]}"  # Limit to ~50k chars

            response_text = await self._generate_content(
                self.flash_model,
                prompt,
                response_mime_type="application/json"
            )

            # Parse JSON response
            parsed_data = json.loads(response_text)

            # Cache for 1 hour
            await self._set_cached_response(
                cache_key,
                parsed_data,
                settings.cache_ttl_protocol_parsing
            )

            return parsed_data

        except Exception as e:
            print(f"PDF parsing error: {str(e)}")
            raise ValueError(f"Failed to parse protocol PDF: {str(e)}")

    async def analyze_protocol_risk(
        self,
        protocol: dict,
        similar_trials: List[dict],
        use_function_calling: bool = True
    ) -> dict:
        """
        Perform comprehensive risk analysis with real trial data

        Args:
            protocol: Parsed protocol data
            similar_trials: List of similar historical trials
            use_function_calling: Whether to enable function calling tools

        Returns:
            Complete risk analysis as dictionary
        """
        # Check cache
        cache_key = self._cache_key(
            json.dumps(protocol, sort_keys=True),
            "risk_analysis"
        )
        cached = await self._get_cached_response(cache_key)
        if cached:
            return cached

        # Fetch real trial data from ClinicalTrials.gov
        enriched_trials = await self._fetch_real_trials_for_analysis(protocol, similar_trials)

        # Build analysis prompt with real + local data
        analysis_prompt = get_risk_analysis_prompt(protocol, enriched_trials)

        # Use Pro model with function calling for deep analysis
        tools = FUNCTION_CALLING_TOOLS if use_function_calling else None

        try:
            # Initial analysis call
            response_text = await self._generate_content(
                self.pro_model,
                f"{RISK_ANALYSIS_SYSTEM_PROMPT}\n\n{analysis_prompt}",
                response_mime_type="application/json",
                tools=tools
            )

            # Parse response
            analysis_data = json.loads(response_text)

            # Cache for 10 minutes
            await self._set_cached_response(
                cache_key,
                analysis_data,
                settings.cache_ttl_risk_analysis
            )

            return analysis_data

        except json.JSONDecodeError as e:
            print(f"Failed to parse risk analysis JSON: {str(e)}")
            print(f"Response text: {response_text[:500]}")
            raise ValueError("Gemini returned invalid JSON format")

    async def _fetch_real_trials_for_analysis(
        self,
        protocol: dict,
        similar_trials: List[dict]
    ) -> List[dict]:
        """
        Fetch real trial data from ClinicalTrials.gov and combine with local data
        
        Args:
            protocol: Current protocol being analyzed
            similar_trials: Local similar trials
            
        Returns:
            Combined list of local + real trials, prioritized by relevance
        """
        try:
            from app.services.historical_db import get_historical_db_service
            
            db_service = get_historical_db_service()
            
            # Extract therapeutic area and drug class from protocol
            therapeutic_area = protocol.get("patient_population", {}).get("therapeutic_area", "cancer")
            drug_class = protocol.get("drug_profile", {}).get("drug_class", "")
            phase = protocol.get("metadata", {}).get("phase", "")
            
            # Log the fetch attempt
            print(f"Fetching real trials for: {therapeutic_area}, {drug_class}")
            
            # Fetch real trials from API
            real_trials = await db_service.fetch_real_trials_by_area(
                therapeutic_area=therapeutic_area,
                limit=5
            )
            
            # If we got real trials, combine with local data
            if real_trials:
                print(f"Got {len(real_trials)} real trials from ClinicalTrials.gov")
                
                # Prioritize: failed real trials + local trials
                failed_real = [t for t in real_trials if t.get("outcome") in ["failed", "terminated"]]
                other_real = [t for t in real_trials if t.get("outcome") not in ["failed", "terminated"]]
                
                # Build combined list
                combined = failed_real + other_real + similar_trials
                return combined[:8]  # Return top 8 most relevant
            else:
                # Fall back to local trials
                print("No real trials fetched, using local database")
                return similar_trials
                
        except Exception as e:
            print(f"Error fetching real trials for analysis: {e}")
            # Fall back to original similar trials
            return similar_trials

    async def generate_executive_summary(
        self,
        protocol: dict,
        risk_analysis: dict
    ) -> str:
        """
        Generate human-readable executive summary

        Args:
            protocol: Protocol data
            risk_analysis: Complete risk analysis

        Returns:
            Executive summary text (3 paragraphs)
        """
        prompt = EXECUTIVE_SUMMARY_PROMPT.format(
            analysis=json.dumps(risk_analysis, indent=2)
        )

        # Use Flash model for speed
        summary = await self._generate_content(
            self.flash_model,
            prompt
        )

        return summary.strip()

    async def chat_session(
        self,
        session_id: str,
        message: str,
        context: dict,
        chat_history: List[dict]
    ) -> AsyncGenerator[str, None]:
        """
        Handle chat interaction with streaming

        Args:
            session_id: Chat session ID
            message: User message
            context: Protocol and analysis context
            chat_history: Previous messages

        Yields:
            Chunks of response text as they arrive
        """
        # Build chat prompt with context
        system_prompt = CHAT_SYSTEM_PROMPT.format(
            context=json.dumps(context, indent=2)[:10000]  # Limit context size
        )

        # Build conversation history
        conversation = f"{system_prompt}\n\nConversation History:\n"
        for msg in chat_history[-5:]:  # Last 5 messages for context
            role = msg.get("role", "user")
            content = msg.get("content", "")
            conversation += f"\n{role.upper()}: {content}"

        conversation += f"\n\nUSER: {message}\n\nASSISTANT:"

        # Stream response
        await self.rate_limiter.acquire()

        try:
            # Use streaming API
            response = await asyncio.to_thread(
                self.flash_model.generate_content,
                conversation,
                stream=True
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            yield f"Error: {str(e)}"

    async def get_cost_stats(self) -> dict:
        """Get current cost statistics"""
        today_cost = self.cost_tracker.get_daily_cost()
        return {
            "today": today_cost,
            "cache_size": len(self.cache)
        }


# Singleton instance
_gemini_service = None

def get_gemini_service() -> GeminiService:
    """Get or create Gemini service singleton"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
