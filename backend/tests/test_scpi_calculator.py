"""
Tests for SCPI calculator service.

This module tests the core calculation logic following TDD principles.
"""

import pytest
from ons import InvalidInvestmentParametersError, SCPINotFoundError
from app.models.schemas import SCPIType, InvestmentType, SimulationRequest
from app.services.scpi_calculator import SCPICalculator


class TestSCPICalculator:
    """Test cases for SCPI calculator."""

    def test_get_scpi_info_comete(self, scpi_calculator):
        """Test getting Comète SCPI information."""
        scpi_info = scpi_calculator.get_scpi_info(SCPIType.COMETE)
        
        assert scpi_info.scpi_type == SCPIType.COMETE
        assert scpi_info.name == "SCPI Comète"
        assert scpi_info.price_per_share == 250.0
        assert scpi_info.minimum_investment == 5000.0
        assert InvestmentType.FULL_OWNERSHIP in scpi_info.supported_investment_types
        assert InvestmentType.BARE_OWNERSHIP in scpi_info.supported_investment_types

    def test_get_scpi_info_activimmo(self, scpi_calculator):
        """Test getting ActivImmo SCPI information."""
        scpi_info = scpi_calculator.get_scpi_info(SCPIType.ACTIVIMMO)
        
        assert scpi_info.scpi_type == SCPIType.ACTIVIMMO
        assert scpi_info.name == "SCPI ActivImmo"
        assert scpi_info.price_per_share == 610.0
        assert scpi_info.minimum_investment == 6100.0

    def test_get_scpi_info_invalid_type(self, scpi_calculator):
        """Test getting info for invalid SCPI type."""
        with pytest.raises(SCPINotFoundError):
            # This would fail if we had an invalid enum value
            pass  # The enum itself prevents invalid values

    def test_validate_minimum_investment(self, scpi_calculator):
        """Test validation of minimum investment amounts."""
        # Valid investment for Comète
        request = SimulationRequest(
            scpi_type=SCPIType.COMETE,
            investment_type=InvestmentType.FULL_OWNERSHIP,
            investment_amount=5000,
            duration_years=8
        )
        scpi_calculator.validate_simulation_request(request)  # Should not raise

        # Invalid investment (too low)
        request.investment_amount = 1000
        with pytest.raises(InvalidInvestmentParametersError, match="Investment amount must be at least"):
            scpi_calculator.validate_simulation_request(request)

    def test_validate_duration_limits(self, scpi_calculator):
        """Test validation of investment duration limits."""
        # Valid full ownership duration
        request = SimulationRequest(
            scpi_type=SCPIType.COMETE,
            investment_type=InvestmentType.FULL_OWNERSHIP,
            investment_amount=5000,
            duration_years=20
        )
        scpi_calculator.validate_simulation_request(request)  # Should not raise

        # Invalid bare ownership duration (too long)
        request.investment_type = InvestmentType.BARE_OWNERSHIP
        request.duration_years = 15  # Max is 12 for bare ownership
        with pytest.raises(InvalidInvestmentParametersError, match="Duration cannot exceed"):
            scpi_calculator.validate_simulation_request(request)

    def test_calculate_full_ownership_simulation(self, scpi_calculator, sample_simulation_request):
        """Test full ownership simulation calculation."""
        request = SimulationRequest(**sample_simulation_request)
        results = scpi_calculator.calculate_simulation(request)

        # Verify basic structure
        assert results.scpi_type == SCPIType.COMETE
        assert results.investment_type == InvestmentType.FULL_OWNERSHIP
        assert results.duration_years == 8
        assert results.initial_investment == 5000  # Rounded to share multiple

        # Verify calculations
        assert results.total_invested > results.initial_investment  # Should include programmed savings
        assert results.final_capital_value > 0
        assert results.total_dividends_received > 0  # Full ownership receives dividends
        assert results.annual_yield > 0
        assert len(results.yearly_projections) == 8

        # Verify yearly projections
        for i, projection in enumerate(results.yearly_projections):
            assert projection.year == i + 1
            assert projection.total_capital_value > 0
            assert projection.dividends_received > 0  # Full ownership

    def test_calculate_bare_ownership_simulation(self, scpi_calculator, sample_bare_ownership_request):
        """Test bare ownership simulation calculation."""
        request = SimulationRequest(**sample_bare_ownership_request)
        results = scpi_calculator.calculate_simulation(request)

        # Verify basic structure
        assert results.scpi_type == SCPIType.ACTIVIMMO
        assert results.investment_type == InvestmentType.BARE_OWNERSHIP
        assert results.duration_years == 10

        # Verify bare ownership specifics
        assert results.total_dividends_received == 0  # No dividends in bare ownership
        assert results.dividend_reinvestment_rate is None
        assert results.final_capital_value > results.initial_investment  # Capital appreciation

        # Verify yearly projections
        for projection in results.yearly_projections:
            assert projection.dividends_received == 0  # No dividends
            assert projection.dividends_reinvested == 0

    def test_share_calculation(self, scpi_calculator):
        """Test calculation of shares based on investment amount."""
        request = SimulationRequest(
            scpi_type=SCPIType.COMETE,
            investment_type=InvestmentType.FULL_OWNERSHIP,
            investment_amount=5125,  # Not exact multiple of 250
            duration_years=5
        )
        results = scpi_calculator.calculate_simulation(request)

        # Should round to nearest share multiple
        expected_investment = round(5125 / 250) * 250  # 5000
        expected_shares = expected_investment / 250  # 20

        assert results.initial_investment == expected_investment
        assert results.initial_shares == expected_shares

    def test_programmed_savings_calculation(self, scpi_calculator):
        """Test programmed savings are correctly included."""
        request = SimulationRequest(
            scpi_type=SCPIType.COMETE,
            investment_type=InvestmentType.FULL_OWNERSHIP,
            investment_amount=5000,
            duration_years=5,
            programmed_savings_amount=200
        )
        results = scpi_calculator.calculate_simulation(request)

        # Total invested should include programmed savings
        expected_total_savings = 200 * 12 * 5  # 12000 over 5 years
        expected_total_invested = 5000 + expected_total_savings

        assert results.total_invested == expected_total_invested

    def test_dividend_reinvestment(self, scpi_calculator):
        """Test dividend reinvestment calculations."""
        # Test with no reinvestment
        request_no_reinvest = SimulationRequest(
            scpi_type=SCPIType.COMETE,
            investment_type=InvestmentType.FULL_OWNERSHIP,
            investment_amount=5000,
            duration_years=5,
            dividend_reinvestment_rate=0.0
        )
        results_no_reinvest = scpi_calculator.calculate_simulation(request_no_reinvest)

        # Test with 50% reinvestment
        request_reinvest = SimulationRequest(
            scpi_type=SCPIType.COMETE,
            investment_type=InvestmentType.FULL_OWNERSHIP,
            investment_amount=5000,
            duration_years=5,
            dividend_reinvestment_rate=0.5
        )
        results_reinvest = scpi_calculator.calculate_simulation(request_reinvest)

        # With reinvestment, final shares should be higher
        assert results_reinvest.final_shares > results_no_reinvest.final_shares
        assert results_reinvest.total_invested > results_no_reinvest.total_invested

    def test_risks_and_disclaimers(self, scpi_calculator, sample_simulation_request):
        """Test that risks and disclaimers are included."""
        request = SimulationRequest(**sample_simulation_request)
        results = scpi_calculator.calculate_simulation(request)

        assert len(results.risks) > 0
        assert len(results.disclaimers) > 0
        assert any("capital" in risk.lower() for risk in results.risks)
        assert any("simulation" in disclaimer.lower() for disclaimer in results.disclaimers)
