
import base64
import os
import tempfile
from configs import env_config
def get_cookie_file() -> str | None:
    """Decode cookie from env secret into a temp file. Returns path or None."""
    cookie_b64 = env_config.cookie_q65533869
    if not cookie_b64:
        return None
    try:
        cookie_bytes = base64.b64decode(cookie_b64.encode())
        # Write to /tmp — persists for the life of the request
        tmp = tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=".txt",
            delete=False,
            prefix="yt_cookies_"
        )
        tmp.write(cookie_bytes)
        tmp.close()
        return tmp.name
    except Exception as e:
        print(f"Cookie decode error: {e}")
        return None

import ssl
import httpx

def build_ydl_opts(cookie_path: str | None) -> dict:
    opts = {
        "quiet": True,
        "skip_download": True,
        "nocheckcertificate": True,      # ← disable SSL verification in yt-dlp
        "retries": 10,                    # ← more retries for flaky HF network
        "socket_timeout": 30,
        "extractor_args": {
            "youtube": {
                "player_client": ["web_creator", "web"],
            }
        },
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        },
    }
    if cookie_path:
        opts["cookiefile"] = cookie_path
    else:
        # No cookies → try android (no SSL issues, no bot check for public videos)
        opts["extractor_args"]["youtube"]["player_client"] = ["android", "web_creator"]

    return opts
def build_ydl_optss(cookie_path: str | None) -> dict:
    opts = {
        "quiet": True,
        "skip_download": True,
        "extractor_args": {
            "youtube": {
                # web_creator works well with cookies on server IPs
                "player_client": ["web_creator", "web", "android"],
            }
        },
    }
    if cookie_path:
        opts["cookiefile"] = cookie_path
        # Use web client when cookies present (android ignores cookies)
        opts["extractor_args"]["youtube"]["player_client"] = ["web_creator", "web"]

    return opts