# PitStopNow - Auto Service Booking Platform

## Overview
PitStopNow is a full-stack web application that allows users to find, book, and manage auto repair services. The system is built using **FastAPI** for the backend and **Angular** for the frontend, integrated with a **PostgreSQL** database.

## Features
### **Backend Features (FastAPI)**
- User authentication and management (registration, login, profile management)
- Auto service management (add, update, delete, list services)
- Reservation system (schedule, update, delete appointments)
- Historical records for past reservations
- Integration with **ArcGIS API** for geolocation and route calculations
- Role-based access for users and service providers
- Secure API endpoints using tokens

### **Frontend Features (Angular)**
- User-friendly interface for booking and managing reservations
- Map integration for locating auto services
- Admin panel for service providers to manage bookings
- Secure authentication and authorization system
- Responsive design for mobile and desktop

---

## Technologies Used
### **Backend**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy ORM
- ArcGIS API (for geolocation and route services)
- Docker (optional for containerization)

### **Frontend**
- Angular
- TypeScript
- HTML, CSS
- RxJS (for state management)

---

## Installation and Setup

### **Backend Setup**
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PitStopNow.git
   cd PitStopNow/PitStopNow_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### **Frontend Setup**
1. Navigate to the frontend directory:
   ```bash
   cd ../src
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   ng serve
   ```

---

## API Endpoints (Backend)

### **User Management**
- Register a new user: `POST /users/register`
- Login: `POST /users/login`
- Get user info: `GET /users/{token}`
- Update user: `PUT /users/{token}`

### **Service Management**
- Add a service: `POST /services/add/`
- Get all services: `GET /services/get/`
- Get a service by ID: `GET /services/get/{id}`

### **Reservation System**
- Create a reservation: `POST /reservations/add/`
- Get user reservations: `GET /reservations/current_reservation/{token}`
- Get service reservations: `GET /reservations/service/{service_id}`
- Accept a reservation: `PUT /reservations/service/accept/{reservation_id}`
- Cancel a reservation: `DELETE /reservations/service/delete/{reservation_id}`

### **History**
- Get user history: `GET /history/user/{token}`
- Get service history: `GET /history/service/{service_id}`

---

## Database Schema
The database includes the following tables:
- **Users**: Stores user details and authentication tokens.
- **Services**: Stores details of auto repair services.
- **Reservations**: Handles user bookings.
- **History**: Keeps track of past reservations.

---

