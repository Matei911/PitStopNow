from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Configurare baza de date
DATABASE_URL = "postgresql://postgres:admin@localhost/PitStopNow"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency pentru sesiunea bazei de date
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
