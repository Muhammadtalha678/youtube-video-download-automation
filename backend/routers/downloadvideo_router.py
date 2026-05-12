from fastapi import APIRouter,Depends

from models.pydanti_model import DownloadRequest
from ools.search_youtube_video_tool import download_videos

router = APIRouter(prefix="/api")

@router.post('/download-youtube-video')
def download_video(req:DownloadRequest):
    return download_videos(video_ids=req.video_ids,folder_path=req.download_path)