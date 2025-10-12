from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..utils.gemini_client import get_gemini_response

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    context: str  # e.g., JSON string of analysis data

class ChatResponse(BaseModel):
    response: str

@router.post("/chat_regen", response_model=ChatResponse)
async def chat_with_gemini(req: ChatRequest):
    """
    Handles chat requests by sending them to the Gemini API with context.
    """
    try:
        full_prompt = f"Context: {req.context}\n\nQuestion: {req.query}\n\nAnswer:"
        response_text = await get_gemini_response(full_prompt)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Gemini: {e}")