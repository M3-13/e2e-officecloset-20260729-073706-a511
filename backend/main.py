from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .database import init_db
from .routers.auth_router import router as auth_router
from .routers.clothing_router import router as clothing_router
from .routers.image_router import router as image_router
from .routers.outfit_router import router as outfit_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Glamour Closet", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https?://(127\.0\.0\.1|localhost)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key="dev-session-secret-change-in-production",
    session_cookie="session",
    max_age=7 * 24 * 60 * 60,
    same_site="lax",
    https_only=False,
)

app.include_router(auth_router)
app.include_router(clothing_router)
app.include_router(outfit_router)
app.include_router(image_router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
