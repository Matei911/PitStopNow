from app.db import get_db
import requests as request_request
from app.models.service import Service
from fastapi import Depends
from sqlalchemy.orm import Session


service_locations = {}
ARC_GIS_LOCATOR_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
API_KEY = "AAPTxy8BH1VEsoebNVZXo8HurIobXHsLq6aEcBZvlyrg7oOg9_g5fMynEoAhmzWDMFk4utg7tdzgxaar81plpPR_MuXAQX0pIna7ioSpsuGrhLqL2_8-Uds9zcmbXvIzqZ387ws9xFIwi7uinhVCW0hq5FQjxIJ_fL6gMDASSDwKdYPsZOmD4jP2pTkf9xRx1Tkzyubxm_81ufori67YF9mNQRlLOpsfQhWTxV_j_d4qK8U.AT1_LEkY6vXE"


def set_service_locations(db: Session = Depends(get_db)):
    global service_locations
    services = db.query(Service).all()
    for service in services:
        params = {
            "SingleLine": service.address,
            "f": "json",
            "token": API_KEY
        }
        response = request_request.get(f"{ARC_GIS_LOCATOR_URL}/findAddressCandidates", params=params)
        if response.status_code == 200:
            data = response.json()
            if data.get("candidates"):
                location = data["candidates"][0]["location"]
                service_locations[str(service.id)] = {
                    "x": location["x"],
                    "y": location["y"]
                }
            else:
                service_locations[service.id] = {
                    "error": "Location not found"
                }
        else:
            return "Error communicating with ArcGIS API"

    return service_locations


def get_service_locations():
    global service_locations
    return service_locations
