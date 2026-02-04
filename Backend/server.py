import uvicorn

if __name__ == "__main__":
    # HOST MUST BE 0.0.0.0 for Docker/Cloud
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)