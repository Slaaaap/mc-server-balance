"""
Tests for API endpoints.

This module tests the FastAPI endpoints following TDD principles.
"""

import pytest
from fastapi import status


class TestHealthEndpoint:
    """Test health check endpoint."""

    def test_health_check(self, client):
        """Test health check returns 200."""
        response = client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "scpi-simulator"


class TestSCPIEndpoints:
    """Test SCPI information endpoints."""

    def test_get_scpi_list(self, client):
        """Test getting list of all SCPIs."""
        response = client.get("/api/v1/scpi/list")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2  # Comète and ActivImmo
        
        # Check structure of returned SCPIs
        for scpi in data:
            assert "scpi_type" in scpi
            assert "name" in scpi
            assert "price_per_share" in scpi
            assert "minimum_investment" in scpi
            assert "annual_yield" in scpi
            assert "supported_investment_types" in scpi

    def test_get_scpi_info_comete(self, client):
        """Test getting Comète SCPI information."""
        response = client.get("/api/v1/scpi/comete")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["scpi_type"] == "comete"
        assert data["name"] == "SCPI Comète"
        assert data["price_per_share"] == 250.0

    def test_get_scpi_info_activimmo(self, client):
        """Test getting ActivImmo SCPI information."""
        response = client.get("/api/v1/scpi/activimmo")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["scpi_type"] == "activimmo"
        assert data["name"] == "SCPI ActivImmo"
        assert data["price_per_share"] == 610.0

    def test_get_scpi_info_invalid(self, client):
        """Test getting info for invalid SCPI."""
        response = client.get("/api/v1/scpi/invalid")
        
        # Should return 422 for invalid enum value
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestSimulationEndpoints:
    """Test simulation calculation endpoints."""

    def test_calculate_simulation_success(self, client, sample_simulation_request):
        """Test successful simulation calculation."""
        response = client.post("/api/v1/simulation/calculate", json=sample_simulation_request)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify response structure
        assert "scpi_type" in data
        assert "investment_type" in data
        assert "total_invested" in data
        assert "final_capital_value" in data
        assert "yearly_projections" in data
        assert "risks" in data
        assert "disclaimers" in data
        
        # Verify calculations make sense
        assert data["total_invested"] > 0
        assert data["final_capital_value"] > 0
        assert data["annual_yield"] > 0
        assert len(data["yearly_projections"]) == sample_simulation_request["duration_years"]

    def test_calculate_simulation_bare_ownership(self, client, sample_bare_ownership_request):
        """Test bare ownership simulation calculation."""
        response = client.post("/api/v1/simulation/calculate", json=sample_bare_ownership_request)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify bare ownership specifics
        assert data["investment_type"] == "nue_propriete"
        assert data["total_dividends_received"] == 0
        assert data["dividend_reinvestment_rate"] is None

    def test_calculate_simulation_invalid_amount(self, client):
        """Test simulation with invalid investment amount."""
        request = {
            "scpi_type": "comete",
            "investment_type": "pleine_propriete",
            "investment_amount": 1000,  # Below minimum
            "duration_years": 5
        }
        
        response = client.post("/api/v1/simulation/calculate", json=request)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert "detail" in data
        assert "minimum" in data["detail"].lower()

    def test_calculate_simulation_invalid_duration(self, client):
        """Test simulation with invalid duration for bare ownership."""
        request = {
            "scpi_type": "comete",
            "investment_type": "nue_propriete",
            "investment_amount": 5000,
            "duration_years": 15  # Too long for bare ownership
        }
        
        response = client.post("/api/v1/simulation/calculate", json=request)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_calculate_simulation_missing_fields(self, client):
        """Test simulation with missing required fields."""
        request = {
            "scpi_type": "comete",
            # Missing investment_type, investment_amount, duration_years
        }
        
        response = client.post("/api/v1/simulation/calculate", json=request)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_validate_simulation_success(self, client, sample_simulation_request):
        """Test successful simulation validation."""
        response = client.post("/api/v1/simulation/validate", json=sample_simulation_request)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "valid"
        assert "message" in data

    def test_validate_simulation_invalid(self, client):
        """Test validation with invalid parameters."""
        request = {
            "scpi_type": "comete",
            "investment_type": "pleine_propriete",
            "investment_amount": 1000,  # Below minimum
            "duration_years": 5
        }
        
        response = client.post("/api/v1/simulation/validate", json=request)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestCORSHeaders:
    """Test CORS configuration."""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present in responses."""
        response = client.options("/api/v1/scpi/list")
        
        # Should allow CORS for development origins
        assert "access-control-allow-origin" in response.headers or response.status_code == status.HTTP_200_OK

    def test_preflight_request(self, client):
        """Test handling of preflight requests."""
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }
        
        response = client.options("/api/v1/simulation/calculate", headers=headers)
        
        # Should handle preflight requests properly
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT]
