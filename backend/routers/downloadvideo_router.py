import base64
import threading

from fastapi import APIRouter,HTTPException
from fastapi.responses import FileResponse
import urllib.parse

from models.pydanti_model import DownloadRequest
from ools.filename_modif import safe_filename_for_header
from ools.search_youtube_video_tool import download_videos
from yt_dlp import YoutubeDL
import os
from configs import env_config
router = APIRouter(prefix="/api")

@router.post('/download-youtube-video')
def download_video(req:DownloadRequest):
    return download_videos(video_ids=req.video_ids)
@router.get("/download/{video_id}")
def download_videos(video_id:str):
    download_dir = "downloads"
    os.makedirs(download_dir, exist_ok=True)

    # Base64 se wapas asli cookie format mein decode karein
    # cookie_content = base64.b64decode(env_config.cookie_q65533869.encode()).decode("utf-8")


    # 2. Ek temporary cookie file banayein
    # temp_cookie_path = os.path.join(download_dir, f"temp_COOKIE_DATA.txt")
    # with open(temp_cookie_path, "w", encoding="utf-8") as f:
    #     f.write(cookie_content)
    try:
        ydl_opts = {
    # NO cookiefile here — android client skips when cookies present
    
    "extractor_args": {
        "youtube": {
            # android first (no n-challenge), web as fallback (needs deno)
            "player_client": ["android", "web"],
            # suppress the PO token warning for android https formats
            "player_skip": ["configs"],
        }
    },
    "http_headers": {
        "User-Agent": (
            "com.google.android.youtube/19.09.37 "
            "(Linux; U; Android 11) gzip"   # android UA matches android client
        ),
    },

    "format": "best[ext=mp4]/best",
    "outtmpl": os.path.join(download_dir, "%(title)s.%(ext)s"),
    "merge_output_format": "mp4",

    "quiet": False,
    "noplaylist": True,
    "nocheckcertificate": True,
}
        with YoutubeDL(ydl_opts) as ydl:
            clean_id = video_id.strip()
            video_url = f"https://youtube.com/watch?v={clean_id}"
            info = ydl.extract_info(url=video_url,download=True)
            # file_path = ydl.prepare_filename(info)
            if "requested_downloads" in info and info["requested_downloads"]:
                file_path = info["requested_downloads"][0]["filepath"]
            else:
                file_path = ydl.prepare_filename(info)
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File not created after download")
        
        actual_filename = os.path.basename(file_path)
        header_filename = safe_filename_for_header(actual_filename, video_id)


        response = FileResponse(
                path=file_path,
                filename=header_filename,
                media_type="video/mp4",
                headers={
                    "Content-Disposition": (
                    f"attachment; "
                    f'filename="{header_filename}"; '
                    f"filename*=UTF-8''{urllib.parse.quote(actual_filename)}"
                    ),
            "Access-Control-Expose-Headers": "Content-Disposition",
                }
            )
        # delete after response
        def cleanup():
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                # if os.path.exists(temp_cookie_path):
                #     os.remove(temp_cookie_path)
            except Exception as e:
                pass

        threading.Timer(30, cleanup).start()
                    
        return response
    
    except Exception as e:
        print(e)
        # if os.path.exists(temp_cookie_path):
        #     os.remove(temp_cookie_path)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
