import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.customers import router as customers_router
from app.api.sales import router as sales_router
from app.api.pumps import router as pumps_router
from app.api.fuel_types import router as fuel_types_router
from app.api.inventory import router as inventory_router
from app.api.employees import router as employees_router
from app.api.shifts import router as shifts_router
from app.api.expenses import router as expenses_router
from app.api.reports import router as reports_router
from app.api.analytics import router as analytics_router
from app.api.ai import router as ai_router
from app.api.snowflake import router as snowflake_router
from app.api.admin import router as admin_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("sppa.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Smart Petrol Pump Analytics Enterprise Platform...")
    logger.info("Snowflake Foundation: SMART_PETROL_DB / SPPA_WH")
    logger.info("RBAC Engine, ML Forecasting, and Anomaly Detection online.")
    yield
    logger.info("Shutting down Smart Petrol Pump Analytics platform.")

app = FastAPI(
    title="Smart Petrol Pump Analytics API",
    version=settings.VERSION,
    description="""
    ## AI-Powered Fuel Station Management & Business Intelligence Platform
    Production Snowflake Foundation (Database: SMART_PETROL_DB, Warehouse: SPPA_WH).
    
    ### Key Features:
    - **Enterprise Snowflake Integration**: Live connection pooling, standard views, JSON/VARIANT extraction, Time Travel & Cloning demos.
    - **AI Intelligence Center**: Natural language business assistant, Scikit-learn sales forecasting, and multi-vector anomaly detection.
    - **Operations & Financials**: Fuel sales, pump utilization, smart inventory with theft alerts, workforce performance, expense and daily profit breakdown.
    - **Security & RBAC**: JWT-based authentication with Admin, Manager, Operator, and Analyst role governance.
    """,
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred in data pipeline", "error": str(exc)}
    )

# Register API Routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(customers_router, prefix=settings.API_V1_STR)
app.include_router(sales_router, prefix=settings.API_V1_STR)
app.include_router(pumps_router, prefix=settings.API_V1_STR)
app.include_router(fuel_types_router, prefix=settings.API_V1_STR)
app.include_router(inventory_router, prefix=settings.API_V1_STR)
app.include_router(employees_router, prefix=settings.API_V1_STR)
app.include_router(shifts_router, prefix=settings.API_V1_STR)
app.include_router(expenses_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(snowflake_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "database_target": "SMART_PETROL_DB",
        "warehouse_target": "SPPA_WH"
    }

# Mount Frontend Static SPA if built
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": "Smart Petrol Pump Analytics",
            "version": settings.VERSION,
            "database": "SMART_PETROL_DB",
            "warehouse": "SPPA_WH",
            "docs_url": "/docs",
            "status": "OPERATIONAL"
        }
