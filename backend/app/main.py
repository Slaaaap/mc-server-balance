"""
SCPI Simulator FastAPI Application

This module contains the main FastAPI application for the SCPI investment simulator.
It provides endpoints for calculating investment projections for Comète and ActivImmo SCPIs.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import SCPICalculationError


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    # Startup
    print("Starting SCPI Simulator API...")
    yield
    # Shutdown
    print("Shutting down SCPI Simulator API...")


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="API for SCPI investment simulation with dynamic calculations",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )

    # Set up CORS
    print(f"CORS Origins: {settings.cors_origins}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.exception_handler(SCPICalculationError)
    async def scpi_calculation_exception_handler(request, exc: SCPICalculationError) -> JSONResponse:
        """Handle SCPI calculation errors."""
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc), "type": "calculation_error"},
        )

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        """Health check endpoint."""
        return {"status": "healthy", "service": "scpi-simulator"}

    return app


app = create_application()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
