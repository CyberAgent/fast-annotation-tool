from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException

from app.api.errors.http_error import http_error_handler
from app.api.errors.validation_error import http422_error_handler
from app.api.routes.api import router as api_router
from app.config.api_config import PROJECT_NAME, VERSION, DEBUG


def get_app() -> FastAPI:
    app = FastAPI(title=PROJECT_NAME, version=VERSION, debug=DEBUG)

    app.add_exception_handler(HTTPException, http_error_handler)
    app.add_exception_handler(RequestValidationError, http422_error_handler)

    app.include_router(api_router)

    return app


app = get_app()
