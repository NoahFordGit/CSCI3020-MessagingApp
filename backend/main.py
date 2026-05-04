from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.users import router as users_router
from routes.servers import router as servers_router
from routes.channels import router as channels_router
from routes.messages import router as messages_router
from routes.direct_messages import router as direct_messages_router
from routes.aggregations import router as aggregations_router

app = FastAPI()

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(users_router)
app.include_router(servers_router)
app.include_router(channels_router)
app.include_router(messages_router)
app.include_router(direct_messages_router)
app.include_router(aggregations_router)