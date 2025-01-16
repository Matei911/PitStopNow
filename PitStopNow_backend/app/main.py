from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.db import Base, engine, SessionLocal
from app.routes import *
import httpx
import logging
from pydantic import BaseModel
import app.config as config

app = FastAPI()

origins = [
    "http://localhost:4200",  # Angular dev server
    "http://127.0.0.1:4200",  # În cazul în care folosești `127.0.0.1`
    "https://3353-2a02-2f00-106-400-315f-c1a8-5957-d0e6.ngrok-free.app",  # Ngrok
    "0.0.0.0",
    "http://100.97.206.200:4200",
    "http://avoapp.website:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

app.include_router(user_router, prefix="/users", tags=["users"])
app.include_router(service_router, prefix="/services", tags=["services"])
app.include_router(reservation_router, prefix="/reservations", tags=["reservations"])
app.include_router(history_router, prefix="/history", tags=["history"])

API_KEY = "AAPTxy8BH1VEsoebNVZXo8HurIobXHsLq6aEcBZvlyrg7oOg9_g5fMynEoAhmzWDMFk4utg7tdzgxaar81plpPR_MuXAQX0pIna7ioSpsuGrhLqL2_8-Uds9zcmbXvIzqZ387ws9xFIwi7uinhVCW0hq5FQjxIJ_fL6gMDASSDwKdYPsZOmD4jP2pTkf9xRx1Tkzyubxm_81ufori67YF9mNQRlLOpsfQhWTxV_j_d4qK8U.AT1_LEkY6vXE"

ARC_GIS_BASE_URL = "https://www.arcgis.com"


@app.api_route("/proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy(path: str, request: Request):
    query_params = dict(request.query_params)
    body = await request.body()

    query_params["token"] = API_KEY

    url = f"{ARC_GIS_BASE_URL}/{path}"
    async with httpx.AsyncClient() as client:
        response = await client.request(
            method=request.method,
            url=url,
            params=query_params,
            content=body,
            headers={key: value for key, value in request.headers.items() if key != "host"}
        )

    return response.text, response.status_code, response.headers.items()

ARC_GIS_ROUTE_URL = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve"

class RouteRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float

@app.post("/route")
async def get_route(route_request: RouteRequest):
    """
    Get a route from ArcGIS World Routing Service using start and end coordinates.
    """
    # Format the "stops" as "lon1,lat1;lon2,lat2"
    stops = f"{route_request.start_lon},{route_request.start_lat};{route_request.end_lon},{route_request.end_lat}"

    payload = {
        "f": "json",
        "token": API_KEY,
        "stops": stops,
        "startTime": "now",
        "returnDirections": "true",
        "directionsLanguage": "en",  # Change this if needed
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(ARC_GIS_ROUTE_URL, data=payload)


        if response.status_code == 200:
            data = response.json()
            if data.get("routes", {}).get("features"):
                # Return the geometry directly in the structure expected by your Angular app
                return {
                    "routes": {
                        "features": data["routes"]["features"]
                    }
                }
            else:
                raise HTTPException(status_code=404, detail="No route found")
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error communicating with ArcGIS API: {response.text}",
            )

# Creeaza tabelele daca nu exista
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    # Creează o sesiune de database manual
    db = SessionLocal()
    try:
        config.set_service_locations(db)  # Apelezi funcția direct
    finally:
        db.close()


# Ruta de baza
@app.get("/")
def read_root():
    return {"message": "Serverul functioneaza!"}



# Pornire server
if __name__ == "__main__":
    uvicorn.run("__main__:app", host="0.0.0.0", port=8000, reload=True)
