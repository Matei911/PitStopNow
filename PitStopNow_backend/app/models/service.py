from sqlalchemy import Column, Integer, String, Float, Boolean
from app.db import Base


# Model Service
class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    available = Column(Boolean, default=False)
    nr_total = Column(Integer, default=0)
    rating_total = Column(Float, default=0.0)
