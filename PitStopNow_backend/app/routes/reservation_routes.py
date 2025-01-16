from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.reservation import Reservation
from app.models.user import User
from app.models.history import History
from app.models.service import Service
from datetime import datetime

router = APIRouter()


@router.post("/service/finish/{reservation_id}")
def finish_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {"detail": move_to_history(reservation, db)}

# API GET rezervare dupa id_user
@router.get("/current_reservation/{token}")
def get_reservations(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    reservation = db.query(Reservation).filter(Reservation.id_user == user.id).first()
    if not reservation:
        return {"detail": "No reservation found"}
    service = db.query(Service).filter(Service.id == reservation.id_service).first()
    data = reservation.data.strftime("%Y-%m-%d")
    ora = reservation.ora
    return {"data": data,
            "time": ora,
            "title": reservation.tip_programare,
            "name": service.name,
            "address": service.address,
            "status": reservation.status}


# API POST rezervare noua
@router.post("/add/")
async def add_reservation(request: Request, db: Session = Depends(get_db)):
    reservation_data = await request.json()
    user_token = reservation_data.get("token")
    id_user = db.query(User).filter(User.token == user_token).first().id
    existing_reservation = db.query(Reservation).filter((Reservation.id_user == id_user)).all()
    if existing_reservation:
        raise HTTPException(status_code=400, detail="Userul are deja o programare in curs")

    reservation = Reservation(
        data=reservation_data.get("data"),
        ora=reservation_data.get("ora"),
        id_service=reservation_data.get("id_service"),
        tip_programare=reservation_data.get("tip_programare"),
        id_user=id_user,
        status="pending"
    )
    db.add(reservation)
    try:
        db.commit()
        db.refresh(reservation)
        return reservation
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la adaugarea programarii: {str(e)}")


# API POST rezerva toata ziua pentru un service
@router.post("/add_all_day/{service_id}/{data}")
def add_all_day(service_id: int, data: str, db: Session = Depends(get_db)):
    list_hours_free = ["08:00", "09:00", "10:00", "11:00", "12:00",
                       "13:00", "14:00", "15:00", "16:00"]
    for ora in list_hours_free:
        reservation = Reservation(
            data=data,
            ora=ora,
            id_service=service_id,
            tip_programare="all_day",
            id_user=-1
        )
        db.add(reservation)
    try:
        db.commit()
        return {"detail": "All day reservations added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la adaugarea programarilor: {str(e)}")


def move_to_history(reservation, db):
    history = History(
        data=reservation.data,
        ora=reservation.ora,
        id_service=reservation.id_service,
        tip_programare=reservation.tip_programare,
        id_user=reservation.id_user,
        status="finished"
    )
    user = db.query(User).filter(User.id == reservation.id_user).first()
    try:
        db.add(history)
        db.delete(reservation)
        db.commit()
        db.refresh(history)
        user.id_prog_finalizata = history.id
        db.commit()

        return history
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la mutarea programarii in history: {str(e)}")


# API verificare daca programarea unui user s a terminat
@router.get("/check/{token}")
def check_reservation(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id_prog_finalizata is None:
        return {"detail": "No finished reservation found"}
    history = db.query(History).filter(History.id == user.id_prog_finalizata).first()
    if not history:
        return {"detail": "No finished reservation found"}
    return {"detail": "Reservation finished", "id_service_reservation": history.id_service, "service_name": db.query(Service).filter(Service.id == history.id_service).first().name}


# API pentru delete rezervare
@router.delete("/service/delete/{reservation_id}")
def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise {"detail": "Reservation deleted successfully"}
    try:
        db.delete(reservation)
        db.commit()
        return {"detail": "Reservation deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la stergerea programarii: {str(e)}")


# API GET sloturi ore libere dupa id_service si data
@router.get("/free/{service_id}/{data}")
def get_hour_slots(service_id: int, data: str, db: Session = Depends(get_db)):
    reservations = db.query(Reservation).filter(Reservation.id_service == service_id, Reservation.data == data).all()
    list_hours_occupied = [x.ora for x in reservations]
    list_hours_free = ["08:00", "09:00", "10:00", "11:00", "12:00",
                       "13:00", "14:00", "15:00", "16:00"]
    if datetime.strptime(data, "%Y-%m-%d").date() == datetime.now().date():
        list_hours_free = [x for x in list_hours_free
                           if datetime.strptime(x, "%H:%M").time().hour > (datetime.now().time().hour + 1)]

    list_hours = [x for x in list_hours_free if x not in list_hours_occupied]
    return list_hours


@router.put("/service/accept/{reservation_id}")
def accept_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    reservation.status = "accepted"
    try:
        db.commit()
        return {"detail": "Reservation accepted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la acceptarea programarii: {str(e)}")




@router.get("/service/{service_id}")
def get_service_reservations(service_id: int, db: Session = Depends(get_db)):
    reservations = db.query(Reservation).filter(Reservation.id_service == service_id).all()
    reservations_return = []
    for r in reservations:
        user = db.query(User).filter(User.id == r.id_user).first()
        reservations_return.append({
            "id": r.id,
            "date": r.data,
            "time": r.ora,
            "type": r.tip_programare,
            "name": user.name,
            "phone": user.phone,
            "status": r.status
        })
    return {"reservations": reservations_return}