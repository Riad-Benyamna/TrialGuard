"""
Protocol parsing and validation endpoints.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import logging

from app.models.protocol import (
    ClinicalProtocol,
    ProtocolValidationRequest,
    ProtocolValidationResponse
)
from app.services.gemini_service import get_gemini_service
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/parse-pdf")
async def parse_protocol_pdf(
    file: UploadFile = File(...)
):
    """
    Parse a clinical trial protocol PDF and extract structured data

    Args:
        file: PDF file (max 50MB)

    Returns:
        Parsed protocol data as JSON
    """
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    # Validate file size
    file_content = await file.read()
    file_size_mb = len(file_content) / (1024 * 1024)

    if file_size_mb > settings.max_upload_size_mb:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({file_size_mb:.1f}MB) exceeds maximum allowed size ({settings.max_upload_size_mb}MB)"
        )

    logger.info(f"Parsing PDF: {file.filename} ({file_size_mb:.1f}MB)")

    try:
        # Use Gemini service to parse PDF
        gemini_service = get_gemini_service()
        parsed_data = await gemini_service.parse_protocol_pdf(file_content)

        logger.info(f"Successfully parsed protocol: {parsed_data.get('metadata', {}).get('trial_name', 'Unknown')}")

        return {
            "status": "success",
            "protocol": parsed_data,
            "file_name": file.filename,
            "file_size_mb": round(file_size_mb, 2)
        }

    except ValueError as e:
        logger.error(f"Validation error parsing PDF: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse protocol PDF: {str(e)}"
        )


@router.post("/validate", response_model=ProtocolValidationResponse)
async def validate_protocol(request: ProtocolValidationRequest):
    """
    Validate protocol data against schema and check completeness

    Args:
        request: Protocol validation request with protocol data

    Returns:
        Validation results with errors, warnings, and completeness score
    """
    protocol = request.protocol
    errors = []
    warnings = []

    # Check required fields
    required_fields = {
        "metadata": ["trial_name", "sponsor", "phase"],
        "drug_profile": ["name", "drug_class"],
        "patient_population": ["disease_indication", "therapeutic_area", "age_range"],
        "study_design": ["design_type", "blinding", "randomization"],
        "statistical_plan": ["planned_enrollment"]
    }

    for section, fields in required_fields.items():
        section_data = getattr(protocol, section, None)
        if section_data is None:
            errors.append({
                "field": section,
                "message": f"Missing required section: {section}"
            })
            continue

        # Check if it's a model or dict
        if hasattr(section_data, 'dict'):
            section_dict = section_data.dict()
        else:
            section_dict = section_data

        for field in fields:
            value = section_dict.get(field)
            if value is None or value == "" or (isinstance(value, list) and len(value) == 0):
                errors.append({
                    "field": f"{section}.{field}",
                    "message": f"Missing required field: {field}"
                })

    # Check for warnings (optional but recommended fields)
    if not protocol.safety_monitoring_plan:
        warnings.append({
            "field": "safety_monitoring_plan",
            "message": "Safety monitoring plan not provided"
        })

    if len(protocol.primary_endpoints) == 0:
        warnings.append({
            "field": "primary_endpoints",
            "message": "No primary endpoints defined"
        })

    if not protocol.statistical_plan.power_calculation_provided:
        warnings.append({
            "field": "statistical_plan.power_calculation_provided",
            "message": "No power calculation provided"
        })

    # Calculate completeness score
    total_fields = 25  # Approximate total important fields
    filled_fields = total_fields - len(errors)
    completeness_score = max(0.0, min(1.0, filled_fields / total_fields))

    # Reduce score for warnings
    completeness_score -= len(warnings) * 0.02  # Each warning reduces score by 2%
    completeness_score = max(0.0, completeness_score)

    is_valid = len(errors) == 0

    return ProtocolValidationResponse(
        is_valid=is_valid,
        errors=errors,
        warnings=warnings,
        completeness_score=round(completeness_score, 2)
    )


@router.post("/manual-entry")
async def create_protocol_manual():
    """
    Endpoint for creating protocol through manual form entry
    (Frontend will POST validated protocol data here)
    """
    return {
        "status": "success",
        "message": "Manual protocol entry endpoint - implement based on frontend form"
    }
