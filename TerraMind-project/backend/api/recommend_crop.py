from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from ..models.crop_recommendation import recommend_crops_for_profile
from ..utils.soil_api import get_soil_data
from ..utils.climate_api import get_climate_data

router = APIRouter()

class CropRecommendationRequest(BaseModel):
    lat: float
    lon: float
    ndvi: float

class Crop(BaseModel):
    name: str
    reason: str
    score: float

@router.post("/recommend_crop", response_model=List[Crop])
async def recommend_crop_endpoint(req: CropRecommendationRequest):
    """
    Recommends crops by fetching soil and climate data and running a model.
    """
    try:
        # 1. Fetch external data
        soil_properties = await get_soil_data(req.lat, req.lon)
        climate_properties = await get_climate_data(req.lat, req.lon)

        # 2. Get recommendations from the model
        recommendations = recommend_crops_for_profile(req.ndvi, soil_properties, climate_properties)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {e}")