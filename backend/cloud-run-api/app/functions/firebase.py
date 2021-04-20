import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage
from firebase_admin import firestore

firebase_admin.initialize_app()
db = firestore.client()
