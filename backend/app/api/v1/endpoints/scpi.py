"""
SCPI information endpoints.

This module provides endpoints to retrieve information about available SCPIs,
their characteristics, and supported investment types.
"""

from fastapi import APIRouter, HTTPException

from app.core.exceptions import SCPINotFoundError
from app.models.schemas import SCPIInfo, SCPIType
from app.services.scpi_calculator import SCPICalculator

router = APIRouter()


@router.get("/list", response_model=list[SCPIInfo])
async def list_scpis() -> list[SCPIInfo]:
    """
    Get list of all available SCPIs.

    Returns information about all SCPIs supported by the simulator,
    including their characteristics and supported investment types.
    """
    calculator = SCPICalculator()
    scpis = []

    for scpi_type in SCPIType:
        try:
            scpi_info = calculator.get_scpi_info(scpi_type)
            scpis.append(scpi_info)
        except SCPINotFoundError:
            # Skip SCPIs that are not configured
            continue

    return scpis


@router.get("/{scpi_type}", response_model=SCPIInfo)
async def get_scpi_info(scpi_type: SCPIType) -> SCPIInfo:
    """
    Get detailed information about a specific SCPI.

    Args:
        scpi_type: The type of SCPI (comete or activimmo)

    Returns:
        Detailed information about the requested SCPI including:
        - Name and basic information
        - Price per share
        - Minimum investment amount
        - Expected yields and appreciation
        - Supported investment types

    Raises:
        HTTPException: If the SCPI type is not found
    """
    calculator = SCPICalculator()

    try:
        return calculator.get_scpi_info(scpi_type)
    except SCPINotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
