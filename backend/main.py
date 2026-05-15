from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.chat_router import router as ChatRouter 
from routers.searchchannel_router import router as SearchChannelRouter 
from routers.downloadvideo_router import router as DownloadVideoRouter 
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://192.168.0.119:8080"],
    # allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods
        allow_headers=["*"],  # Allows all headers
)
app.include_router(router=ChatRouter)
app.include_router(router=SearchChannelRouter)
app.include_router(router=DownloadVideoRouter)
