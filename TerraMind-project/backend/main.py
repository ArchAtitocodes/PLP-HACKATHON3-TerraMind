from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import analyze_land, recommend_crop, track_progress, chat_regen

app = FastAPI(
    title="TerraMind API",
    description="AI-Powered Land Regeneration Assistant",
    version="1.0.0"
)

# CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost:3000",  # Next.js frontend
    # Add production frontend URL here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_land.router, prefix="/api", tags=["Analysis"])
app.include_router(recommend_crop.router, prefix="/api", tags=["Recommendations"])
app.include_router(track_progress.router, prefix="/api", tags=["Tracking"])
app.include_router(chat_regen.router, prefix="/api", tags=["Gemini Chat"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the TerraMind API!"}