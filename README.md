# CSCI-3020 Messaging App

A full-stack messaging platform inspired by modern communication applications like Discord, featuring real-time messaging, server organization, and direct user communication.

## Features

### Core Messaging System
- Real-time messaging between users  
- Private direct messaging  
- Message filtering and conversation search  

### Server & Channel Organization
- Create and manage servers  
- Structured text channels within servers  

### Authentication & User Management
- Secure user registration and login  

### Full-Stack Architecture
- FastAPI backend with RESTful API design  
- MongoDB database integration  

### Frontend Experience
- Responsive React + Vite interface  
- Sidebar-based navigation for servers, channels, and DMs

## Installation Guide

### Video Setup Guide
A step-by-step installation guide is available here:
https://www.youtube.com/watch?v=F6En3AkKYvw

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
http://localhost:5173
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
