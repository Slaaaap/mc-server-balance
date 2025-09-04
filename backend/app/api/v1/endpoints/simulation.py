"""
Investment simulation endpoints.

This module provides endpoints for calculating investment projections
and running investment simulations for different SCPI scenarios.
"""

from fastapi import APIRouter, HTTPException

from app.core.exceptions import InvalidInvestmentParametersError, SCPINotFoundError
from app.models.schemas import SimulationRequest, SimulationResults
from app.services.scpi_calculator import SCPICalculator

router = APIRouter()


@router.post("/calculate", response_model=SimulationResults)
async def calculate_investment_simulation(request: SimulationRequest) -> SimulationResults:
    """
    Calculate investment simulation results.

    This endpoint performs a complete investment simulation based on the provided parameters.
    It calculates year-by-year projections, total returns, dividends, and capital appreciation.

    Args:
        request: Investment simulation parameters including:
            - SCPI type (Comète or ActivImmo)
            - Investment type (full or bare ownership)
            - Investment amount and duration
            - Optional programmed savings
            - Optional dividend reinvestment rate

    Returns:
        Complete simulation results including:
        - Total invested amount and final capital value
        - Dividend projections (if applicable)
        - Year-by-year breakdown
        - Risk information and disclaimers

    Raises:
        HTTPException: If the simulation parameters are invalid
    """
    calculator = SCPICalculator()

    try:
        return calculator.calculate_simulation(request)
    except (InvalidInvestmentParametersError, SCPINotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.post("/validate", response_model=dict[str, str])
async def validate_simulation_parameters(request: SimulationRequest) -> dict[str, str]:
    """
    Validate simulation parameters without running the full calculation.

    This endpoint can be used to check if the provided parameters are valid
    before running the full simulation. Useful for real-time form validation.

    Args:
        request: Investment simulation parameters to validate

    Returns:
        Validation result with status message

    Raises:
        HTTPException: If the parameters are invalid with detailed error message
    """
    calculator = SCPICalculator()

    try:
        calculator.validate_simulation_request(request)
        return {"status": "valid", "message": "Parameters are valid"}
    except (InvalidInvestmentParametersError, SCPINotFoundError) as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
