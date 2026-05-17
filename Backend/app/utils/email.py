from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings
import logging

logger = logging.getLogger("uvicorn.error")

conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAIL_USER,
    MAIL_PASSWORD=settings.EMAIL_PASS,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.EMAIL_PORT,
    MAIL_SERVER=settings.EMAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_APP,
    MAIL_STARTTLS = settings.EMAIL_PORT == 587,
    MAIL_SSL_TLS = settings.EMAIL_PORT == 465,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_otp_email(email: str, otp: str):
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {{
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    max-width: 600px;
                    margin: auto;
                }}
                .otp-box {{
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    font-size: 24px;
                    font-weight: bold;
                    display: inline-block;
                    letter-spacing: 5px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>One Time Password (OTP)</h2>
                <p>Thank you for choosing Anozon! Please use the OTP below to verify your email:</p>
                
                <div class="otp-box">{otp}</div>
                
                <p>This OTP will expire in 5 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>Anozon Team</strong></p>
            </div>
        </body>
        </html>
    """

    message = MessageSchema(
        subject="Verify Your Email",
        recipients=[email],
        body=html_content,
        subtype="html",
        
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False
    
async def send_forget_password_email(email: str, token: str):
    html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {{
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    max-width: 600px;
                    margin: auto;
                }}
                .otp-box {{
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    font-size: 24px;
                    font-weight: bold;
                    display: inline-block;
                    letter-spacing: 5px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Forget Password</h2>
                <p>Thank you for choosing Anozon! </p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Click the link below to reset your password:</p>
                <a href="http://localhost:3000/reset-password?token={token}">Reset Password</a>
                <p>This link will expire in 15 minutes.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>Anozon Team</strong></p>
            </div>
        </body>
        </html>
    """

    message = MessageSchema(
        subject="Forget Password",
        recipients=[email],
        body=html_content,
        subtype="html",
        
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

