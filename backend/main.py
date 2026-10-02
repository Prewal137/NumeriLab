from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NumeriLab API",
    description="Backend API for the NumeriLab Numerical Methods Platform",
    version="1.0.0",
)

# Allow the React development server to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "NumeriLab",
        "version": "1.0.0",
    }


@app.get("/")
def root():
    return {
        "message": "NumeriLab API is running",
        "docs": "/docs",
    }