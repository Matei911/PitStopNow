from fastapi import APIRouter, Depends, HTTPException, Request, File, Form, UploadFile
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user import User
from app.models.service import Service
from app.utils import generate_random_string
import shutil

router = APIRouter()

UPLOAD_DIR = "..\\PitStopNow\\public\\"

# API pentru User
@router.post("/")
async def create_user(request: Request, db: Session = Depends(get_db)):
    user_data = await request.json()
    user = User(
        username=user_data.get("username"),
        password=user_data.get("password"),
        name=user_data.get("name"),
        phone=user_data.get("phone"),
        email=user_data.get("email")
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la adaugarea userului: {str(e)}")


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


@router.get("/{token}")
def get_user(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": user.username, "password": user.password,
            "name": user.name, "phone": user.phone, "email": user.email,
            "id_service": user.id_service}


# API actualizare date personale user
@router.put("/{token}")
async def update_user(token: str, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_data = await request.json()
    user.username = user_data.get("username", user.username)
    user.password = user_data.get("password", user.password)
    user.name = user_data.get("name", user.name)
    user.phone = user_data.get("phone", user.phone)
    user.email = user_data.get("email", user.email)

    try:
        db.commit()
        db.refresh(user)
        return {"success": "User added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la actualizarea userului: {str(e)}")


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        db.delete(user)
        db.commit()
        return {"detail": "User deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la stergerea userului: {str(e)}")

@router.post("/upload_photo/")
async def upload_photo(file: UploadFile = File(...), filename: str = Form(...), token: str = Form(...),
                       db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    file_location = UPLOAD_DIR + filename

    user.photo = filename
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la adaugarea pozei: {str(e)}")

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": f"Fișierul a fost salvat ca {file_location}"}

# API pentru login
@router.post("/login/")
async def login_user(request: Request, db: Session = Depends(get_db)):
    login_data = await request.json()  # Timeout de 10 secunde
    username = login_data.get("username")
    password = login_data.get("password")

    user = db.query(User).filter(User.username == username, User.password == password).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = generate_random_string(32)
    token = str(user.id) + token

    user.token = token

    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la logarea userului: {str(e)}")

    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "id_service": user.id_service,
        "id_prog_finalizata": user.id_prog_finalizata,
        "photo": user.photo,
        "token": user.token
    }


# API pentru logout
@router.post("/logout/")
async def logout_user(request: Request, db: Session = Depends(get_db)):
    logout_data = await request.json()
    user = db.query(User).filter(User.token == logout_data.get("token")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.token = None
    try:
        db.commit()
        db.refresh(user)
        return {"message": "User logged out successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la delogarea userului: {str(e)}")


# API pentru Register user normal
@router.post("/register/user/")
async def register_user(request: Request, db: Session = Depends(get_db)):
    user_data = await request.json()

    # Verifica daca username-ul sau email-ul exista deja
    existing_user = db.query(User).filter(
        (User.username == user_data.get("username")) |
        (User.email == user_data.get("email")) |
        (User.phone == user_data.get("phone"))
    ).first()

    if existing_user:
        print(existing_user)
        raise HTTPException(status_code=400, detail="Username, email sau telefon deja utilizat.")

    # Creaza utilizatorul
    user = User(
        username=user_data.get("username"),
        password=user_data.get("password"),
        name=user_data.get("name"),
        phone=user_data.get("phone"),
        email=user_data.get("email")
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        return {"message": "User registered successfully", "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "id_service": user.id_service,
            "id_prog_finalizata": user.id_prog_finalizata
        }}
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=400, detail=f"Eroare la inregistrarea userului: {str(e)}")


# API pentru Register user cu service
@router.post("/register/service/")
async def register_user_service(request: Request, db: Session = Depends(get_db)):
    user_data = await request.json()

    # Verifica daca username-ul sau email-ul exista deja
    existing_user = db.query(User).filter(
        (User.username == user_data.get("username")) |
        (User.email == user_data.get("email")) |
        (User.phone == user_data.get("phone"))
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username, email sau telefon deja utilizat.")

    # Verifica daca service-ul exista
    service = db.query(Service).filter(Service.id == user_data.get("id_service"),
                                       Service.name == user_data.get("nameService")).first()
    if not service:
        raise HTTPException(status_code=400, detail="Service-ul este invalid")

    # Creaza utilizatorul
    user = User(
        username=user_data.get("username"),
        password=user_data.get("password"),
        name=user_data.get("name"),
        phone=user_data.get("phone"),
        email=user_data.get("email"),
        id_service=user_data.get("id_service")
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        return {"message": "User registered successfully", "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "id_service": user.id_service,
            "id_prog_finalizata": user.id_prog_finalizata
        }}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la inregistrarea userului: {str(e)}")


# API GET role user
@router.get("/role/{token}")
def get_user_role(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id_service:
        return {"role": "service"}
    return {"role": "user"}

@router.put("/rating_added/{token}")
async def add_rating(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.id_prog_finalizata = None
    try:
        db.commit()
        db.refresh(user)
        return {"success": "Rating added successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Eroare la adaugarea rating-ului: {str(e)}")