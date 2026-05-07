# CSCI3020 Messaging App

A full-stack messaging platform inspired by modern communication applications like Discord, featuring real-time messaging, server organization, and direct user communication.

## Features

- Secure user registration and login
- Server creation and management
- Organized text channels within servers
- Real-time messaging system
- Private direct messaging between users
- Message filtering and conversation search
- Responsive React + Vite frontend
- FastAPI backend with RESTful API architecture
- MongoDB database integration
- Modern sidebar-based interface for servers, channels, and DMs

## Installation Guide

### Requirements

- Python 3.11+
- Node.js and npm
- MongoDB

### Clone the Repository

```bash
git clone https://github.com/NoahFordGit/CSCI3020-MessagingApp.git
cd CSCI3020-MessagingApp
```

## Backend Setup (FastAPI)
> Requires Python 3.11+

### Navigate to the Backend Directory

```bash
cd backend
```

### Create a Python Virtual Environment

#### - Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

#### - macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```
### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Run the Backend Server

```bash
python -m uvicorn main:app --reload
```

The backend API will run on:

```text
http://localhost:8000
```

## Frontend Setup (React + Vite)

> Requires Node.js and npm

### Navigate to the Frontend Directory

```bash
cd frontend
```

### Install Frontend Dependencies

```bash
npm install
```

### Run the Frontend Development Server

```bash
npm run dev
```

The frontend application will run on:

```text
http://localhost:5137
```

## Environment Variables

Environment variable files (`.env`) are not included in this repository for security reasons.

You will need to create your own `.env` files for both the backend and frontend configurations before running the application.

Example values may include:

- MongoDB connection URI
- Database name
- API base URLs
- Secret keys or authentication settings

<sub>Made for ETSU CSCI-3020 (Advanced Database Topics)</sub>
