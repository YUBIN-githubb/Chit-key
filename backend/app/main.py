import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import agents, artifacts, chats, experiences, users
from app.core.error_handlers import register_error_handlers

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Chit-key API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(users.router, prefix="/api/v1")
app.include_router(experiences.router, prefix="/api/v1")
app.include_router(chats.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(artifacts.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}
