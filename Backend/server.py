import os
import uvicorn

if __name__ == "__main__":
    # HOST MUST BE 0.0.0.0 for Docker/Cloud
    
    # Logic: Default to "development" (Reload = True). 
    # Only disable it if we explicitly say "production".
    env_state = os.getenv("ENVIRONMENT", "development")
    is_prod = env_state == "production"

    if is_prod:
        print("🚀 Starting in PRODUCTION mode (No Reload)")
    else:
        print("🛠️ Starting in DEVELOPMENT mode (Hot Reload Enabled)")

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=not is_prod # True in dev, False in prod
    )