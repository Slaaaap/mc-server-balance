"""
Main API router for version 1.

This module contains the main router that includes all API endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import scpi, simulation

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(scpi.router, prefix="/scpi", tags=["SCPI Information"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["Investment Simulation"])
