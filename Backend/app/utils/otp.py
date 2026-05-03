import secrets

def generate_otp_token():
    return str(secrets.randbelow(900000) + 100000)

