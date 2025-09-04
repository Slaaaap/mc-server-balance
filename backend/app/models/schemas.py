"""
Pydantic models for the SCPI simulator API.

This module contains all the request and response models used by the API endpoints.
These models provide validation, serialization, and documentation for the API.
"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class SCPIType(str, Enum):
    """Available SCPI types."""

    COMETE = "comete"
    ACTIVIMMO = "activimmo"


class InvestmentType(str, Enum):
    """Investment ownership types."""

    FULL_OWNERSHIP = "pleine_propriete"  # Full ownership
    BARE_OWNERSHIP = "nue_propriete"  # Bare ownership (no dividends during dismemberment)


class SavingsFrequency(str, Enum):
    """Programmed savings frequency."""

    MONTHLY = "mensuelle"
    QUARTERLY = "trimestrielle"
    SEMI_ANNUAL = "semestrielle"


class SimulationRequest(BaseModel):
    """Request model for investment simulation."""

    scpi_type: SCPIType = Field(..., description="Type of SCPI (Comète or ActivImmo)")
    investment_type: InvestmentType = Field(..., description="Investment ownership type")
    investment_amount: float = Field(..., gt=0, description="Initial investment amount in euros")
    duration_years: int = Field(..., gt=0, le=20, description="Investment duration in years")

    # Optional programmed savings
    programmed_savings_amount: Optional[float] = Field(
        None, ge=0, description="Monthly programmed savings amount in euros"
    )
    programmed_savings_frequency: Optional[SavingsFrequency] = Field(
        None, description="Frequency of programmed savings"
    )

    # Dividend reinvestment (only for full ownership)
    dividend_reinvestment_rate: Optional[float] = Field(
        None, ge=0, le=1, description="Percentage of dividends to reinvest (0-1)"
    )

    @field_validator("duration_years")
    @classmethod
    def validate_duration(cls, v: int, info) -> int:
        """Validate investment duration based on investment type."""
        if hasattr(info, "data") and "investment_type" in info.data:
            investment_type = info.data["investment_type"]
            if investment_type == InvestmentType.BARE_OWNERSHIP and v > 12:
                raise ValueError("Bare ownership investment cannot exceed 12 years")
        return v

    @field_validator("dividend_reinvestment_rate")
    @classmethod
    def validate_dividend_reinvestment(cls, v: Optional[float], info) -> Optional[float]:
        """Validate dividend reinvestment rate."""
        if v is not None and hasattr(info, "data") and "investment_type" in info.data:
            investment_type = info.data["investment_type"]
            if investment_type == InvestmentType.BARE_OWNERSHIP:
                raise ValueError("Dividend reinvestment not applicable for bare ownership")
        return v


class YearlyProjection(BaseModel):
    """Yearly projection data."""

    year: int = Field(..., description="Year number")
    dividends_received: float = Field(..., description="Dividends received this year")
    dividends_reinvested: float = Field(..., description="Dividends reinvested this year")
    programmed_savings: float = Field(..., description="Programmed savings added this year")
    total_shares: float = Field(..., description="Total number of shares at end of year")
    share_value: float = Field(..., description="Value per share at end of year")
    total_capital_value: float = Field(..., description="Total capital value at end of year")
    cumulative_dividends: float = Field(..., description="Cumulative dividends received")


class SimulationResults(BaseModel):
    """Response model for simulation results."""

    # Input parameters (echoed back)
    scpi_type: SCPIType
    investment_type: InvestmentType
    initial_investment: float
    duration_years: int
    programmed_savings_monthly: Optional[float]
    dividend_reinvestment_rate: Optional[float]

    # Key results
    total_invested: float = Field(..., description="Total amount invested over the period")
    final_capital_value: float = Field(..., description="Final capital value at end of period")
    total_dividends_received: float = Field(..., description="Total dividends received")
    total_return: float = Field(..., description="Total return (capital + dividends)")
    annual_yield: float = Field(..., description="Average annual yield")

    # Share information
    initial_shares: float = Field(..., description="Number of shares purchased initially")
    final_shares: float = Field(..., description="Final number of shares owned")
    price_per_share: float = Field(..., description="Current price per share")

    # Projections
    yearly_projections: list[YearlyProjection] = Field(..., description="Year-by-year projections")

    # Risk and disclaimer information
    risks: list[str] = Field(..., description="List of investment risks")
    disclaimers: list[str] = Field(..., description="Legal disclaimers")


class SCPIInfo(BaseModel):
    """Information about a specific SCPI."""

    scpi_type: SCPIType
    name: str = Field(..., description="Full name of the SCPI")
    price_per_share: float = Field(..., description="Current price per share")
    minimum_investment: float = Field(..., description="Minimum investment amount")
    annual_yield: float = Field(..., description="Expected annual yield")
    capital_appreciation: float = Field(..., description="Expected annual capital appreciation")
    supported_investment_types: list[InvestmentType] = Field(
        ..., description="Supported investment types"
    )


class ErrorResponse(BaseModel):
    """Error response model."""

    detail: str = Field(..., description="Error description")
    type: str = Field(..., description="Error type")
    code: Optional[str] = Field(None, description="Error code")
