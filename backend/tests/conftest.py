"""
Test configuration and fixtures.
"""

import pytest
from fastapi.testclient import TestClient
from  import app
from ices.scpi_calculator import SCPICalculator


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def scpi_calculator():
    """Create a SCPI calculator instance for testing."""
    return SCPICalculator()


@pytest.fixture
def sample_simulation_request():
    """Sample simulation request for testing."""
    return {
        "scpi_type": "comete",
        "investment_type": "pleine_propriete",
        "investment_amount": 5000,
        "duration_years": 8,
        "programmed_savings_amount": 200,
        "programmed_savings_frequency": "mensuelle",
        "dividend_reinvestment_rate": 0.5,
    }


@pytest.fixture
def sample_bare_ownership_request():
    """Sample bare ownership request for testing."""
    return {
        "scpi_type": "activimmo",
        "investment_type": "nue_propriete",
        "investment_amount": 6100,
        "duration_years": 10,
    }
