from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class Email(BaseModel):
    to_email: EmailStr = Field(..., description="Email address to send the email to")
    subject: str = Field(..., description="Subject of the email")
    body: str = Field(..., description="Body of the email")