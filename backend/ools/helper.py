
import base64
import os
import tempfile

def get_cookie_file() -> str | None:
    """Decode cookie from env secret into a temp file. Returns path or None."""
    cookie_b64 = os.environ.get("cookie_q65533869")
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

# def build_ydl_opts(cookie_path: str | None) -> dict:
#     opts = {
#         "quiet": True,
#         "skip_download": True,
#         "nocheckcertificate": True,
#         "retries": 10,
#         "socket_timeout": 30,
        
#         # FIX: Format as a nested config dictionary instead of a list
#         "js_runtimes": {"node": {}},
        
#         "extractor_args": {
#             "youtube": {
#                 "formats": ["missing_pot"],
#             }
#         },
#     }
    
#     if cookie_path:
#         opts["cookiefile"] = cookie_path
#         opts["extractor_args"]["youtube"]["player_client"] = ["web", "tv"]
#         opts["http_headers"] = {
#             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
#         }
#     else:
#         opts["extractor_args"]["youtube"]["player_client"] = ["android", "ios"]
#         opts["http_headers"] = {
#             "User-Agent": "Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0"
#         }

#     return opts

def build_ydl_opts(cookie_path: str | None = None) -> dict:
    opts = {
        "quiet": True,
        "skip_download": True,
        "nocheckcertificate": True,
        "retries": 10,
        "socket_timeout": 30,
        "js_runtimes": {"node": {}},
        
        "extractor_args": {
            "youtube": {
                # Shift priority to ios/android app clients to avoid the web base.js timeout
                "player_client": ["ios", "android", "mweb", "web"],
                "formats": ["missing_pot"]
            }
        },
        "http_headers": {
            # Use an iOS user agent to match our client settings
            "User-Agent": "com.google.ios.youtube/19.17.2 (iPhone16,2; U; CPU OS 17_5 like Mac OS X; en_US)",
            "Accept-Language": "en-US,en;q=0.9"
        }
    }

    if cookie_path:
        opts["cookiefile"] = cookie_path
        # When cookies are present, web and tv are mandatory
        opts["extractor_args"]["youtube"]["player_client"] = ["web", "tv"]
        opts["http_headers"] = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }

    return opts

