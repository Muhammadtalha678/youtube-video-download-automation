const backend_url = import.meta.env.VITE_BACKEND_URL

const apiUrls = {
    "channel_search" : `${backend_url}/api/search-youtube-channel`,
    "video_search" : `${backend_url}/api/channel_youtube_videos`,
    "dowload_video" : `${backend_url}/api/download-youtube-video`,
    "download" : `${backend_url}/api/download`,
}

export {apiUrls}