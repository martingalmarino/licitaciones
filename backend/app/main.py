from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import init_db
from app.routers import tenders, admin

app = FastAPI(
    title="COFARSUR Tender Radar API",
    description="API para el radar de licitaciones públicas de salud en Argentina",
    version="1.0.0"
)

# CORS middleware - permite Vercel, localhost y dominios de preview
import os
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
# En producción, agregar: https://tu-proyecto.vercel.app,https://*.vercel.app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("CORS_ALLOW_ALL") == "1" else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Include routers
app.include_router(tenders.router)
app.include_router(admin.router)


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "tender-radar"}
