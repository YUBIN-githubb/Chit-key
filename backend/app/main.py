import logging

from fastapi import FastAPI

from app.core.error_handlers import register_error_handlers

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Chit-key API", version="0.1.0")

register_error_handlers(app)


@app.get("/health")
def health():
    return {"status": "ok"}
