
from sqlalchemy import Column, Integer, String, ForeignKey, Date
from app.db import Base

# Model History
class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    data = Column(Date, nullable=False)
    ora = Column(String, nullable=False)
    id_service = Column(Integer, ForeignKey("services.id"), nullable=False)
    tip_programare = Column(String, nullable=False)
    id_user = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)