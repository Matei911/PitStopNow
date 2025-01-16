import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.service import Service
from app.models.user import User
from app.models.reservation import Reservation
from app.routes.reservation_routes import get_hour_slots
import datetime
import app.config

router = APIRouter()

API_KEY = "AAPTxy8BH1VEsoebNVZXo8HurIobXHsLq6aEcBZvlyrg7oOg9_g5fMynEoAhmzWDMFk4utg7tdzgxaar81plpPR_MuXAQX0pIna7ioSpsuGrhLqL2_8-Uds9zcmbXvIzqZ387ws9xFIwi7uinhVCW0hq5FQjxIJ_fL6gMDASSDwKdYPsZOmD4jP2pTkf9xRx1Tkzyubxm_81ufori67YF9mNQRlLOpsfQhWTxV_j_d4qK8U.AT1_LEkY6vXE"


# API pentru Add Service
@router.post("/add/")
async def register_service(request: Request, db: Session = Depends(get_db)):
    service_data = await request.json()
    services = service_data["services"]
    for service in services:
        new_service = Service(
            name=service["name"],
            address=service["address"],

        )
        db.add(new_service)
        try:
            db.commit()
            db.refresh(new_service)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Eroare la inregistrarea service-ului: {str(e)}")
    return services


def service_available(db: Session, service_id: int):
    users = db.query(User).filter(User.id_service == service_id).first()
    if not users:
        return False
    today = datetime.datetime.now().date()
    next_two_weeks = [today + datetime.timedelta(days=i) for i in range(14)]

    ok = False
    for day in next_two_weeks:
        if len(get_hour_slots(service_id, str(day), db)) > 0:
            ok = True
            break
    return ok


@router.get("/name/{service_id}")
def get_service_name(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"name": service.name}


@router.get("/get_id_name/")
def get_all_id_name(db: Session = Depends(get_db)):
    services = db.query(Service).all()
    services_id_name = []
    for service in services:
        services_id_name.append({
            "id": service.id,
            "name": service.name
        })
    return services_id_name


# API pentru GET la toate service-urile
@router.get("/get/")
def get_services(db: Session = Depends(get_db)):
    service_locations = app.config.get_service_locations()
    services = db.query(Service).all()
    for service in services:
        service.available = service_available(db, service.id)
    services_return = []
    for service in services:
        user = db.query(User).filter(User.id_service == service.id).first()
        if user:
            photo = user.photo
        else:
            photo = "background_3.jpg"
        if service.nr_total == 0:
            rating = 0
        else:
            rating = service.rating_total / service.nr_total
        rating = round(rating, 2)
        services_return.append({
            "id": service.id,
            "name": service.name,
            "address": service.address,
            "latitude": service_locations[str(service.id)]["y"],
            "longitude": service_locations[str(service.id)]["x"],
            "available": service.available,
            "rating": rating,
            "photo": photo
        })

    services_return.sort(key=lambda x: x["rating"], reverse=True)
    return services_return

    # geocoded_results = []
    # async with httpx.AsyncClient() as client:
    #     for service in services:
    #         params = {
    #             "SingleLine": service.address,
    #             "f": "json",
    #             "token": API_KEY
    #         }
    #         response = await client.get(f"{ARC_GIS_LOCATOR_URL}/findAddressCandidates", params=params)
    #         if response.status_code == 200:
    #             user = db.query(User).filter(User.id_service == service.id).first()
    #             if user:
    #                 photo = user.photo
    #             else:
    #                 photo = "background_3.jpg"
    #             data = response.json()
    #             if data.get("candidates"):
    #                 location = data["candidates"][0]["location"]
    #                 geocoded_results.append({
    #                     "id": service.id,
    #                     "name": service.name,
    #                     "address": service.address,
    #                     "latitude": location["y"],
    #                     "longitude": location["x"],
    #                     "available": service.available,
    #                     "rating": service.rating_total,
    #                     "nr_rating": service.nr_total,
    #                     "photo": photo
    #                 })
    #             else:
    #                 geocoded_results.append({
    #                     "id": service.id,
    #                     "name": service.name,
    #                     "address": service.address,
    #                     "error": "Location not found",
    #                     "available": service.available,
    #                     "rating": service.rating,
    #                     "nr_rating": service.reviews,
    #                     "photo": photo
    #                 })
    #         else:
    #             raise HTTPException(status_code=response.status_code, detail="Error communicating with ArcGIS API")
    # return geocoded_results


# API pentru GET la un service dupa id
@router.get("/get/{service_id}")
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    service.available = service_available(db, service.id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.put("/add_rating/{service_id}")
async def add_rating(service_id: int, request: Request, db: Session = Depends(get_db)):
    rating_data = await request.json()
    rating = rating_data["rating"]
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service.rating_total += rating
    service.nr_total += 1
    try:
        db.commit()
        db.refresh(service)
        return {"success": "Rating added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la adaugarea rating-ului: {str(e)}")
