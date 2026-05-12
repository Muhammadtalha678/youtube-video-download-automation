from fastapi import FastAPI,APIRouter,Depends
from models.pydanti_model  import YoutubeUploadId
from configs.agent_config import AgentConfig
from configs import env_config
from agents import Agent,Runner
from ools.search_youtube_video_tool import search_channel_videos

router = APIRouter(prefix="/api")

@router.get('/channel_youtube_videos')
async def search_channel_youtube_videos(req:YoutubeUploadId = Depends()):
    # agent = AgentConfig(api_key=env_config.api_key,base_url=env_config.base_url,model_name=env_config.model)
    # personal = Agent(
    #     name="CartoonSearcher",

    # )

    # result = await Runner.run(
    #     input="Hi",
    #     starting_agent=personal,
    #     run_config=agent.config()
    # )

    videos = search_channel_videos(upload_id=req.upload_id,past_days=req.past_days)
    return videos   
    