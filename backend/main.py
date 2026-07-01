import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse

from database.db import engine
from database.models import Base
from routers import modules, lessons, quiz, progress, streak

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Signovate API")

# Broad CORS configuration to enable port 5500 to pull from port 8000 smoothly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. CORE API ROUTERS REGISTERED FIRST
app.include_router(modules.router)
app.include_router(lessons.router)
app.include_router(quiz.router)
app.include_router(progress.router)
app.include_router(streak.router)

# Locate directories explicitly
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
frontend_path = os.path.normpath(os.path.join(BASE_DIR, "..", "frontend"))

@app.get("/api/status")
def root():
    return {"message": "Signovate API is running. Docs at /docs"}


# 2. DEDICATED STREAMING ROUTE
@app.get("/stream-video")
def stream_video(path: str, request: Request):
    """
    Dynamically streams mp4 videos handling byte-range requests for HTML5 video tags.
    """
    clean_path = path.lstrip("/")
    video_file_path = os.path.normpath(os.path.join(frontend_path, clean_path))
    
    if not os.path.isfile(video_file_path):
        raise HTTPException(status_code=404, detail="Video file not found")

    file_size = os.path.getsize(video_file_path)
    range_header = request.headers.get("range", None)
    
    def send_bytes(start_byte, end_byte):
        with open(video_file_path, "rb") as video:
            video.seek(start_byte)
            bytes_to_read = end_byte - start_byte + 1
            chunk_size = 1024 * 1024  # 1MB Chunks
            while bytes_to_read > 0:
                amount_to_read = min(chunk_size, bytes_to_read)
                data = video.read(amount_to_read)
                if not data:
                    break
                bytes_to_read -= len(data)
                yield data

    if range_header:
        try:
            range_values = range_header.replace("bytes=", "").split("-")
            start = int(range_values[0]) if range_values[0] else 0
            end = int(range_values[1]) if range_values[1] else file_size - 1
        except ValueError:
            start, end = 0, file_size - 1
            
        if start >= file_size:
            raise HTTPException(status_code=416, detail="Requested range not satisfiable")
            
        end = min(end, file_size - 1)
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(end - start + 1),
            "Content-Type": "video/mp4",
        }
        return StreamingResponse(send_bytes(start, end), status_code=206, headers=headers)
    
    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(file_size),
        "Content-Type": "video/mp4",
    }
    return StreamingResponse(send_bytes(0, file_size - 1), headers=headers)


# 3. STATIC MOUNTING AND SUBFOLDER CORRECTION
if os.path.isdir(frontend_path):
    for folder in ["js", "css", "assets"]:
        sub_folder_path = os.path.join(frontend_path, folder)
        if os.path.isdir(sub_folder_path):
            app.mount(f"/{folder}", StaticFiles(directory=sub_folder_path), name=folder)

    # 4. ROOT HTML FALLBACK MOUNT
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")