import logging
from brevo import AsyncBrevo
from brevo.transactional_emails import SendTransacEmailRequestSender, SendTransacEmailRequestToItem
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

# Configure Brevo API Client
client = AsyncBrevo(api_key=settings.BREVO_API_KEY)

async def send_email_via_brevo(subject: str, recipients: list[str], html_content: str) -> bool:
    try:
        sender = SendTransacEmailRequestSender(
            name=settings.MAIL_FROM_APP,
            email=settings.MAIL_FROM
        )
        
        to_recipients = [
            SendTransacEmailRequestToItem(email=email) 
            for email in recipients
        ]
        
        await client.transactional_emails.send_transac_email(
            subject=subject,
            html_content=html_content,
            sender=sender,
            to=to_recipients
        )
        return True
    except Exception as e:
        logger.error(f"Error sending email via Brevo: {e}")
        return False

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

    return await send_email_via_brevo("Verify Your Email", [email], html_content)
    
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

    return await send_email_via_brevo("Forget Password", [email], html_content)
