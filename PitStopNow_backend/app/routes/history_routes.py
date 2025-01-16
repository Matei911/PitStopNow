from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.history import History
from app.models.user import User
from app.models.service import Service
from app.models.reservation import Reservation

router = APIRouter()


# API GET istoric programari
@router.get("/user/{token}")
def get_history(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    history = db.query(History).filter(History.id_user == user.id).all()
    history_return = []
    for h in history:
        service = db.query(Service).filter(Service.id == h.id_service).first()
        history_return.append({
            "data": h.data.strftime("%Y-%m-%d"),
            "ora": h.ora,
            "title": h.tip_programare,
            "name": service.name,
            "address": service.address,
            "status": h.status
        })
    if len(history_return) == 0:
        return {"detail": "No history found"}
    return {"history": history_return}


@router.get("/service/{service_id}")
def get_history_service(service_id: int, db: Session = Depends(get_db)):
    history = db.query(History).filter(History.id_service == service_id).all()
    history_return = []
    for h in history:
        user = db.query(User).filter(User.id == h.id_user).first()
        history_return.append({
            "type": h.tip_programare, "time": h.ora, "date": h.data, "name": user.name, "phone": user.phone
        })
    return {"history": history_return}


