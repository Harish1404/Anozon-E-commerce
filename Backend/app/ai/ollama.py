from app.core.config import settings
from fastapi import APIRouter, Query, HTTPException, Depends
from app.deps.auth import get_current_user
import requests

API_KEY = settings.OLLAMA_API_URL
OLLAMA_URL = settings.OLLAMA_URL

router = APIRouter(tags=["Ollama AI routes"])

@router.get("/ollama/ai/chat")
def ask_ollama_ai(message: str = Query(..., description="Enter a prompt...") ):

    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        response = requests.post(
            f"{OLLAMA_URL}/chat",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "qwen3-coder:480b-cloud",
                "messages": [
                    {"role": "user",
                    "content": message}
                ],
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 100,
                    "top_k": 3
                }})
        response.raise_for_status()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": str(e)})
    
    return response_cleaner(response.json())

def response_cleaner(response_json: dict) -> dict:
    return {
        "response": response_json["message"]["content"],
        "total_duration_ms": round(response_json.get("total_duration", 0) / 1e6, 2),
        "model": response_json.get("model"),
    }
    




