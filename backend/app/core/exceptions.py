"""
Custom exception classes for the SCPI simulator.

This module defines custom exceptions that can be raised during SCPI calculations
and investment projections.
"""


class SCPISimulatorException(Exception):
    """Base exception for SCPI simulator."""

    pass


class SCPICalculationError(SCPISimulatorException):
    """Raised when there's an error in SCPI calculation logic."""

    pass


class InvalidInvestmentParametersError(SCPICalculationError):
    """Raised when investment parameters are invalid."""

    pass


class SCPINotFoundError(SCPISimulatorException):
    """Raised when a requested SCPI is not found."""

    pass


class InvestmentTypeNotSupportedError(SCPISimulatorException):
    """Raised when an investment type is not supported for a given SCPI."""

    pass
