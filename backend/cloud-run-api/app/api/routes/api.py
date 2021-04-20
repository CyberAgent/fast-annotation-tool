from fastapi import APIRouter

from app.api.routes import annotation

router = APIRouter()

router.include_router(annotation.router, tags=["annotation"])
