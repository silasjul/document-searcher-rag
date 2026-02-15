from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.files import router as files_router
from app.routes.users import router as users_router
from app.routes.worker import router as worker_router

app = FastAPI(title="Document Searcher API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Client-facing routes
app.include_router(files_router)
app.include_router(users_router)

# Worker routes (called by Google Cloud Tasks)
app.include_router(worker_router)


@app.get("/")
def health():
    return {"status": "ok"}
