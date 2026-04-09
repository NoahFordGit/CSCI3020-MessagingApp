# CSCI3020-MessagingApp

## Overview
A full-stack messaging application similar to Discord.  
Users can create accounts, join or create servers, send messages in channels or privately, and manage roles and permissions.

## Tech Stack
- **Backend:** Python + FastAPI  
- **Frontend:** React.js  
- **Database:** MongoDB Atlas  
- **Realtime:** WebSockets  
- **Auth:** Google OAuth (optional)  

## Database Collections
- **users:** user info, profile, server memberships  
- **servers:** server details, channels, roles  
- **channels:** text channels in servers  
- **messages:** messages with author, content, timestamp  
- **roles:** permissions in servers  
            
## Features
- CRUD for users, servers, channels, and messages  
- Search/filter and display related data  
- Real-time messaging  
- Role-based permissions  
- Message edit/delete  

## Setup
1. Clone repo
```bash
git clone https://github.com/NoahFordGit/CSCI3020-MessagingApp.git
```

Made for ETSU CSCI-3020: Advanced Database
