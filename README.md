# Messaging App

A full-stack messaging application built with **FastAPI**, **MongoDB**, and a React frontend. The project provides a simple system for user management and messaging between users through a REST API.

---

## Features

- User registration and management  
- Send and receive messages between users  
- RESTful API built with FastAPI  
- MongoDB database integration  
- Modular backend structure (routes, models, database layer)  

---

## Tech Stack

- Backend: FastAPI (Python)  
- Database: MongoDB (PyMongo)  
- Frontend: React  
- Environment: python-dotenv  

---

## Setup & Run

### 1. Clone the repository
```bash
git clone https://github.com/NoahFordGit/CSCI3020-MessagingApp.git
cd CSCI3020-MessagingApp
```

### 2. Create virtual environment
```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the backend server
```bash
python -m uvicorn backend.main:app --reload
```

---

## API Docs

Once running, visit:

- http://127.0.0.1:8000/docs

---

## Notes

- Requires MongoDB running locally or configured via `.env`
- `.env`, `.venv`, and `node_modules` are ignored via `.gitignore`
