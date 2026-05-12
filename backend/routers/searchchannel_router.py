from fastapi import APIRouter, Depends

from models.pydanti_model import ChannelName,ChannelNameResponse
from ools.search_youtube_video_tool import find_channels
router = APIRouter(prefix="/api")

@router.get('/search-youtube-channel',response_model=ChannelNameResponse)
def search_channel(request:ChannelName = Depends()):
    """
    Search all channels by the provided channel name
    """
    text = request.channel_name.replace(" ","")
    channel_data = find_channels(channel_name=text)

    return channel_data