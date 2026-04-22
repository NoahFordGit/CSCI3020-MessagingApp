from backend.database import db, client

try:
    # Ping the MongoDB server
    client.admin.command("ping")
    print("Successfully connected to MongoDB Atlas!")
    
    collections = client["messaging_app"].list_collection_names()
    print("Collections in 'messaging_app' database:", collections)

except Exception as e:
    print("Connection failed:")
    print(e)

# run with "python -m backend.services.test_connection"