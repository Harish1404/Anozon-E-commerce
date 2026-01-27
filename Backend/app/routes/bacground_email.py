from fastapi import APIRouter, BackgroundTasks
from app.models.email_model import Email
from utils.email_sender import send_email

router = APIRouter()

@router.post("/send-email-bg")
async def send_email_background(background_tasks: BackgroundTasks, email: Email):
    
    background_tasks.add_task(send_email, email.to_email, email.subject, email.body)
    return {"status": "Email task scheduled", "to": email.to_email}
