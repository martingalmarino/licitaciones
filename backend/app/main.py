import asyncio
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db, SessionLocal
from app.models import Tender
from app.routers import tenders, admin
from app.services.refresh import refresh_all

app = FastAPI(
    title="COFARSUR Tender Radar API",
    description="API para el radar de licitaciones públicas de salud en Argentina",
    version="1.0.0"
)

# CORS middleware - permite Vercel, localhost y dominios de preview
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("CORS_ALLOW_ALL") == "1" else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()


@app.on_event("startup")
async def seed_if_empty():
    """Si la BD está vacía, carga los 20 licitaciones mock automáticamente"""
    db = SessionLocal()
    try:
        count = db.query(Tender).count()
        if count == 0:
            await refresh_all(db)
    except Exception:
        pass
    finally:
        db.close()


# Include routers
app.include_router(tenders.router)
app.include_router(admin.router)


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "tender-radar"}
