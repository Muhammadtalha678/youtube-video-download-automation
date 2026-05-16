import threading

from fastapi import APIRouter,HTTPException
from fastapi.responses import FileResponse

from models.pydanti_model import DownloadRequest
from ools.search_youtube_video_tool import download_videos
from yt_dlp import YoutubeDL
import os
router = APIRouter(prefix="/api")

@router.post('/download-youtube-video')
def download_video(req:DownloadRequest):
    return download_videos(video_ids=req.video_ids)
@router.get("/download/{video_id}")
def download_videos(video_id:str):
    download_dir = "downloads"
    os.makedirs(download_dir, exist_ok=True)
    try:
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'outtmpl': os.path.join(download_dir, '%(title)s.%(ext)s'),
            # 'ignoreerrors': True,
            # 'extractor_args': {
            #     'youtube': {
            #         'player_client': ['web', 'web_embedded', 'android'],
            #     }
            # },
            # 'http_headers': {
            #     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            # }
            "quiet": True,
            "noplaylist": True,
        }
        results = []
        with YoutubeDL(ydl_opts) as ydl:
            clean_id = video_id.strip()
            video_url = f"https://youtube.com/watch?v={clean_id}"
            info = ydl.extract_info(url=video_url,download=True)
            file_path = ydl.prepare_filename(info)
        response = FileResponse(
                path=file_path,
                filename=os.path.basename(file_path),
                media_type="video/mp4"
            )
        # delete after response
        def cleanup():
            try:
                os.remove(file_path)
            except Exception as e:
                pass

        threading.Timer(30, cleanup).start()
                    
        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )