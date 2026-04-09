from fastapi import FastAPI

app = FastAPI()

# include the routers for the different endpoints as they are created. For example:
# from endpoints import users, messages
# app.include_router(users.router)
# app.include_router(messages.router)