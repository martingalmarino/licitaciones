"""
CLI script para refrescar datos manualmente
Uso: python -m app.refresh
"""
import asyncio
from app.db import SessionLocal, init_db
from app.services.refresh import refresh_all

async def main():
    """Main function to refresh all sources"""
    init_db()
    db = SessionLocal()
    try:
        print("Iniciando actualización de datos...")
        results = await refresh_all(db)
        print("\nResultados:")
        for result in results:
            if "error" in result:
                print(f"  {result['source']}: ERROR - {result['error']}")
            else:
                print(f"  {result['source']}:")
                print(f"    - Obtenidos: {result['items_fetched']}")
                print(f"    - Insertados: {result['items_inserted']}")
                print(f"    - Actualizados: {result['items_updated']}")
                print(f"    - Errores: {result['errors_count']}")
        print("\nActualización completada.")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
