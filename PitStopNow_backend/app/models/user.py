from sqlalchemy import Column, Integer, String, ForeignKey
from app.db import Base


# Model User
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    id_service = Column(Integer, ForeignKey("services.id"), nullable=True)
    id_prog_finalizata = Column(Integer, nullable=True)
    photo = Column(String, nullable=False)
    token = Column(String, nullable=True, unique=True)
