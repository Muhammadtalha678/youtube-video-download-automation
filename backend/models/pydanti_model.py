from pydantic import BaseModel,Field
class YoutubeUploadId(BaseModel):
    upload_id: str
    past_days:int
class ChannelName(BaseModel):
    channel_name:str = Field(min_length=1)

class ChannelNameResponse(BaseModel):
    channel_id:str
    name:str
    image:str
    uploads_playlist_id:str

class DownloadRequest(BaseModel):
    video_ids: list[str]  # ["abc123", "def456", ...] confirmed by user
    download_path: str    # same folder path