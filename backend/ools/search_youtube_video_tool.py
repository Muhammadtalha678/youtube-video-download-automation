from fastapi import HTTPException,status
from googleapiclient.discovery import build,HttpError
# from datetime import timedelta,datetime,UTC
from configs import env_config
import datetime

from models.pydanti_model import ChannelName
from yt_dlp import YoutubeDL
import os
youtube = build(serviceName="youtube",version="v3",developerKey=env_config.youtube_ap_key)

def find_channels(channel_name:ChannelName):
    search_channel = youtube.channels().list(
        forHandle = channel_name, part="snippet,contentDetails"
    ).execute()
    if search_channel.get("items"):
        # upload_playlist_id = search_channel["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
        return {
            "channel_id": search_channel["items"][0]["id"],
            "name": search_channel["items"][0]["snippet"]["title"],
            "image": search_channel["items"][0]["snippet"]["thumbnails"]["medium"]["url"],
            "uploads_playlist_id": search_channel["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"],
        }
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Channel not found")
    


def search_channel_videos(upload_id:str,past_days:int):
    
    months_ago = (datetime.datetime.now(datetime.timezone.utc)- datetime.timedelta(days=past_days)).isoformat().replace("+00:00","Z")
   
    
    videos_list = []
    next_page_token = None

    i = 0
    stop_loop = False 
    try:
        while True:
            i = i+1
            print("how many times while loop runs",i)
            playlist_response = youtube.playlistItems().list(
                    playlistId=upload_id,
                    part="snippet",
                    # type="video",
                    # publishedAfter=months_ago,
                    maxResults=50,
                    # order="date",
                    pageToken=next_page_token
                ).execute()    
            items = playlist_response.get("items", [])
            if not items:
                    # If it's the first page and no items, the channel is empty
                    if not next_page_token:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND, 
                            detail="No videos found in this channel."
                        )
                    break
            for v in playlist_response["items"]:
                if v['snippet']['publishedAt'] >= months_ago:
                    # print(v)
                    videos_list.append({
                        "title":v["snippet"]["title"],
                        "id":v["snippet"]["resourceId"]["videoId"],
                        "image":v["snippet"]["thumbnails"]["medium"]["url"],
                        "published_at":v["snippet"]["publishedAt"]
                    })  
                else:
                    # Stop adding videos and prevent the next page from loading
                    stop_loop = True 
                    break 

            # Check if we should stop fetching new pages
            
            if stop_loop :
                break
            next_page_token = playlist_response.get("nextPageToken")

            if not next_page_token:
                break
    
    # 2. HANDLE YOUTUBE API ERRORS            
    except HttpError as e:
        status_code = e.resp.status
        error_details = e.error_details[0] if e.error_details else {}
        reason = error_details.get("reason", "Unknown Error")

        if reason == "quotaExceeded":
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
                detail="YouTube API quota exceeded. Try again tomorrow."
            )
        elif reason == "playlistNotFound":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="The channel's upload playlist was not found."
            )
        else:
            # Pass the original Google status and message to your frontend
            raise HTTPException(status_code=status_code, detail=f"YouTube API Error: {reason}")

    # 3. HANDLE NETWORK/OTHER ERRORS
    except Exception as e:
        if isinstance(e, HTTPException): # Don't catch the exceptions we just raised
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Internal Server Error: {str(e)}"
        )
        
    return videos_list
   # ... other code above ...
def download_videos(video_ids: list[str], folder_path: str):
    target_dir = os.path.abspath(folder_path)
    
    if os.path.isfile(target_dir):
        target_dir = os.path.dirname(target_dir)

    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)

    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': os.path.join(target_dir, '%(title)s.%(ext)s'),
        'ignoreerrors': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['web', 'web_embedded', 'android'],
            }
        },
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
    }

    results = []
    with YoutubeDL(ydl_opts) as ydl:
        for vid_id in video_ids:
            clean_id = vid_id.strip()
            if not clean_id: 
                continue 
            
            try:
                # ADDED THE MISSING /watch?v= HERE
                video_url = f"https://youtube.com/watch?v={clean_id}"
                
                # Pass the corrected URL to download
                status = ydl.download([video_url])
                results.append({"id": clean_id, "success": status == 0})
            except Exception as e:
                results.append({"id": clean_id, "success": False, "error": str(e)})
                
    return {"message": "Process completed", "results": results}
