from fastapi import FastAPI
from routers.chat_router import router as ChatRouter 
from routers.searchchannel_router import router as SearchChannelRouter 
from routers.downloadvideo_router import router as DownloadVideoRouter 
app = FastAPI()

app.include_router(router=ChatRouter)
app.include_router(router=SearchChannelRouter)
app.include_router(router=DownloadVideoRouter)
