"""
SCPI calculation service.

This module contains the core logic for calculating investment projections
for different SCPI types and investment scenarios.
"""

import math
from typing import Optional

from app.core.config import settings
from app.core.exceptions import InvalidInvestmentParametersError, SCPINotFoundError
from app.models.schemas import (
    InvestmentType,
    SavingsFrequency,
    SCPIInfo,
    SCPIType,
    SimulationRequest,
    SimulationResults,
    YearlyProjection,
)


class SCPICalculator:
    """Service for calculating SCPI investment projections."""

    def __init__(self) -> None:
        """Initialize the calculator with SCPI configurations."""
        self.scpi_configs = {
            SCPIType.COMETE: {
                "name": "SCPI Comète",
                "price_per_share": settings.COMETE_PRICE_PER_SHARE,
                "min_investment": settings.COMETE_MIN_INVESTMENT,
                "annual_yield": settings.COMETE_ANNUAL_YIELD,
                "capital_appreciation": settings.COMETE_CAPITAL_APPRECIATION,
                "supported_types": [InvestmentType.FULL_OWNERSHIP, InvestmentType.BARE_OWNERSHIP],
            },
            SCPIType.ACTIVIMMO: {
                "name": "SCPI ActivImmo",
                "price_per_share": settings.ACTIVIMMO_PRICE_PER_SHARE,
                "min_investment": settings.ACTIVIMMO_MIN_INVESTMENT,
                "annual_yield": settings.ACTIVIMMO_ANNUAL_YIELD,
                "capital_appreciation": settings.ACTIVIMMO_CAPITAL_APPRECIATION,
                "supported_types": [InvestmentType.FULL_OWNERSHIP, InvestmentType.BARE_OWNERSHIP],
            },
        }

    def get_scpi_info(self, scpi_type: SCPIType) -> SCPIInfo:
        """Get information about a specific SCPI."""
        if scpi_type not in self.scpi_configs:
            raise SCPINotFoundError(f"SCPI type {scpi_type} not found")

        config = self.scpi_configs[scpi_type]
        return SCPIInfo(
            scpi_type=scpi_type,
            name=config["name"],
            price_per_share=config["price_per_share"],
            minimum_investment=config["min_investment"],
            annual_yield=config["annual_yield"],
            capital_appreciation=config["capital_appreciation"],
            supported_investment_types=config["supported_types"],
        )

    def validate_simulation_request(self, request: SimulationRequest) -> None:
        """Validate the simulation request parameters."""
        scpi_config = self.scpi_configs.get(request.scpi_type)
        if not scpi_config:
            raise SCPINotFoundError(f"SCPI type {request.scpi_type} not found")

        # Check if investment type is supported
        if request.investment_type not in scpi_config["supported_types"]:
            raise InvalidInvestmentParametersError(
                f"Investment type {request.investment_type} not supported for {request.scpi_type}"
            )

        # Check minimum investment
        if request.investment_amount < scpi_config["min_investment"]:
            raise InvalidInvestmentParametersError(
                f"Investment amount must be at least €{scpi_config['min_investment']}"
            )

        # Check if amount is multiple of share price
        price_per_share = scpi_config["price_per_share"]
        if request.investment_amount % price_per_share != 0:
            # Auto-round to nearest share multiple
            rounded_amount = round(request.investment_amount / price_per_share) * price_per_share
            if abs(rounded_amount - request.investment_amount) > price_per_share / 2:
                raise InvalidInvestmentParametersError(
                    f"Investment amount must be a multiple of €{price_per_share} (share price)"
                )

        # Validate duration limits
        max_duration = (
            settings.MAX_INVESTMENT_DURATION_BARE
            if request.investment_type == InvestmentType.BARE_OWNERSHIP
            else settings.MAX_INVESTMENT_DURATION_FULL
        )
        if request.duration_years > max_duration:
            raise InvalidInvestmentParametersError(f"Duration cannot exceed {max_duration} years")

    def calculate_simulation(self, request: SimulationRequest) -> SimulationResults:
        """Calculate investment simulation results."""
        self.validate_simulation_request(request)

        scpi_config = self.scpi_configs[request.scpi_type]
        price_per_share = scpi_config["price_per_share"]
        annual_yield = scpi_config["annual_yield"]
        capital_appreciation = scpi_config["capital_appreciation"]

        # Auto-round investment amount to nearest share multiple
        rounded_amount = round(request.investment_amount / price_per_share) * price_per_share
        initial_shares = rounded_amount / price_per_share

        # Calculate programmed savings per year
        yearly_programmed_savings = 0.0
        if request.programmed_savings_amount:
            frequency_multiplier = self._get_frequency_multiplier(request.programmed_savings_frequency)
            yearly_programmed_savings = request.programmed_savings_amount * frequency_multiplier

        # Initialize variables
        current_shares = initial_shares
        total_invested = rounded_amount
        total_dividends_received = 0.0
        yearly_projections = []

        # Calculate year by year
        for year in range(1, request.duration_years + 1):
            # Share value appreciation
            share_value = price_per_share * ((1 + capital_appreciation) ** year)

            # Dividends (only for full ownership)
            yearly_dividends = 0.0
            dividends_reinvested = 0.0
            if request.investment_type == InvestmentType.FULL_OWNERSHIP:
                yearly_dividends = current_shares * price_per_share * annual_yield
                total_dividends_received += yearly_dividends

                # Reinvest dividends if specified
                if request.dividend_reinvestment_rate:
                    dividends_to_reinvest = yearly_dividends * request.dividend_reinvestment_rate
                    dividends_reinvested = dividends_to_reinvest
                    shares_from_dividends = dividends_to_reinvest / share_value
                    current_shares += shares_from_dividends
                    total_invested += dividends_to_reinvest

            # Add programmed savings
            if yearly_programmed_savings > 0:
                shares_from_savings = yearly_programmed_savings / share_value
                current_shares += shares_from_savings
                total_invested += yearly_programmed_savings

            # Calculate total capital value
            total_capital_value = current_shares * share_value

            # Create yearly projection
            yearly_projections.append(
                YearlyProjection(
                    year=year,
                    dividends_received=yearly_dividends,
                    dividends_reinvested=dividends_reinvested,
                    programmed_savings=yearly_programmed_savings,
                    total_shares=current_shares,
                    share_value=share_value,
                    total_capital_value=total_capital_value,
                    cumulative_dividends=total_dividends_received,
                )
            )

        # Final calculations
        final_capital_value = yearly_projections[-1].total_capital_value
        total_return = final_capital_value + total_dividends_received

        # Calculate average annual yield
        if total_invested > 0 and request.duration_years > 0:
            annual_yield_percentage = ((total_return / total_invested) ** (1 / request.duration_years) - 1) * 100
        else:
            annual_yield_percentage = 0.0

        return SimulationResults(
            scpi_type=request.scpi_type,
            investment_type=request.investment_type,
            initial_investment=rounded_amount,
            duration_years=request.duration_years,
            programmed_savings_monthly=request.programmed_savings_amount,
            dividend_reinvestment_rate=request.dividend_reinvestment_rate,
            total_invested=total_invested,
            final_capital_value=final_capital_value,
            total_dividends_received=total_dividends_received,
            total_return=total_return,
            annual_yield=annual_yield_percentage,
            initial_shares=initial_shares,
            final_shares=current_shares,
            price_per_share=price_per_share,
            yearly_projections=yearly_projections,
            risks=self._get_investment_risks(request.scpi_type, request.investment_type),
            disclaimers=self._get_disclaimers(),
        )

    def _get_frequency_multiplier(self, frequency: Optional[SavingsFrequency]) -> float:
        """Get the multiplier to convert savings frequency to yearly amount."""
        if not frequency:
            return 12.0  # Default to monthly

        frequency_map = {
            SavingsFrequency.MONTHLY: 12.0,
            SavingsFrequency.QUARTERLY: 4.0,
            SavingsFrequency.SEMI_ANNUAL: 2.0,
        }
        return frequency_map.get(frequency, 12.0)

    def _get_investment_risks(self, scpi_type: SCPIType, investment_type: InvestmentType) -> list[str]:
        """Get list of investment risks based on SCPI and investment type."""
        base_risks = [
            "Risque de perte en capital : le capital investi n'est ni garanti ni protégé.",
            "Risque de change : en raison de sa stratégie d'investissement, "
            "la SCPI pourra détenir certains instruments financiers ou "
            "actifs immobiliers soumis à un risque de change.",
            "Risque de liquidité : la SCPI ne garantit pas la revente des "
            "parts, ni le retrait, la sortie étant possible dans le cas de "
            "l'existence d'une contrepartie.",
            "Risque en matière de durabilité : la SCPI est exposée à des "
            "risques de durabilité, définis par le règlement SFDR.",
            "Risque de marché : ce produit ne bénéficie pas de protection "
            "contre les aléas du marché ; vous pourriez perdre tout ou "
            "partie de votre investissement.",
        ]

        if investment_type == InvestmentType.BARE_OWNERSHIP:
            base_risks.append(
                "Risque spécifique au démembrement : aucun dividende ne sera perçu "
                "pendant la durée du démembrement."
            )

        return base_risks

    def _get_disclaimers(self) -> list[str]:
        """Get legal disclaimers."""
        return [
            "Ces calculs prévoient un compte des hypothèses de 25% de fiscalité correspondant à une "
            "moyenne calculée en fonction de la fiscalité sur les revenus fonciers et financiers des pays dans "
            "lesquels la SCPI investit et évite la double imposition grâce au pacte d'investissement.",
            "Les impôts ont prévu à la source pour la SCPI, pour le compte des associés.",
            "Cette simulation est indicative et ne constitue en aucun cas une garantie de performance.",
            "Les performances passées ne préjugent pas des performances futures.",
            "Cette simulation est proposée à titre indicatif et n'a aucune valeur contractuelle.",
        ]
