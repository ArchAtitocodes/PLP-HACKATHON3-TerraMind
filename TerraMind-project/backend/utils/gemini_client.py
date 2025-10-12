import google.generativeai as genai
from ..config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

async def get_gemini_response(prompt: str) -> str:
    """
    Sends a prompt to the Gemini API and returns the response.
    """
    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    response = await model.generate_content_async(prompt)
    
    return response.text