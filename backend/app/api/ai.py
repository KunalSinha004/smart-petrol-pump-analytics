from fastapi import APIRouter, Depends
from app.schemas.all_schemas import AIQueryRequest
from app.ai.assistant import ai_assistant_service
from app.ai.recommendations import recommendations_service
from app.security.auth import get_current_user, User

router = APIRouter(prefix="/ai", tags=["AI Intelligence Center"])

@router.post("/query")
def ask_business_assistant(request: AIQueryRequest, current_user: User = Depends(get_current_user)):
    return ai_assistant_service.ask(request.question)

@router.get("/recommendations")
def get_smart_recommendations(current_user: User = Depends(get_current_user)):
    return recommendations_service.get_recommendations()
