from pathlib import Path
from datetime import date
from app.models import Tender
from app.utils.logging import setup_logger
import re

logger = setup_logger("folder_creator")

PROCESS_FOLDERS_ROOT = Path("process_folders")


def slugify(text: str) -> str:
    """Convert text to a filesystem-safe slug"""
    if not text:
        return "unknown"
    # Remove special characters, replace spaces with underscores
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '_', text)
    return text[:50]  # Limit length


def create_process_folder(tender: Tender) -> Path:
    """
    Create a process folder structure for a tender
    Returns: Path to the created folder
    """
    if not tender.open_date:
        year = "unknown"
        date_str = "no_date"
    else:
        year = str(tender.open_date.year)
        date_str = tender.open_date.strftime("%Y%m%d")
    
    # Create folder name: ORG_SLUG_OPEN_DATE
    org_slug = slugify(tender.organization)
    folder_name = f"{org_slug}_{date_str}"
    
    # Full path: process_folders/YEAR/ORG_SLUG_OPEN_DATE/
    folder_path = PROCESS_FOLDERS_ROOT / year / folder_name
    
    # Create subdirectories
    subdirs = [
        "Pliego",
        "Documentacion_Legal",
        "Propuesta_Tecnica",
        "Propuesta_Economica",
        "Notas_Internas"
    ]
    
    try:
        folder_path.mkdir(parents=True, exist_ok=True)
        
        for subdir in subdirs:
            (folder_path / subdir).mkdir(exist_ok=True)
        
        # Create a README with tender info
        readme_path = folder_path / "README.txt"
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(f"LICITACIÓN: {tender.title}\n")
            f.write(f"ORGANISMO: {tender.organization}\n")
            f.write(f"PROVINCIA: {tender.province or 'N/A'}\n")
            f.write(f"FECHA APERTURA: {tender.open_date or 'N/A'}\n")
            f.write(f"PUNTAJE: {tender.score_total} ({tender.priority.value})\n")
            f.write(f"URL: {tender.url or 'N/A'}\n")
            f.write(f"ID: {tender.id}\n")
        
        logger.info(f"Created process folder: {folder_path}")
        return folder_path
        
    except Exception as e:
        logger.error(f"Error creating process folder: {e}")
        raise
