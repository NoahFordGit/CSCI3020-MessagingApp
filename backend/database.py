from dotenv import load_dotenv
import os

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

load_dotenv()

username = os.getenv("MONGO_USERNAME")
password = os.getenv("MONGO_PASSWORD")

uri = f"mongodb+srv://{username}:{password}@project2-cluster.iijwinj.mongodb.net/?appName=project2-cluster"

client = MongoClient(uri, server_api=ServerApi('1'))

db = client["messaging_app"]
# to use our database instance, import this file and use the 'db' variable. For example:
# from database import db