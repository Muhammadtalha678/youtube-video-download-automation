
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


def build_ydl_opts(cookie_path: str | None) -> dict:
    opts = {
        "quiet": True,
        "skip_download": True,
        "nocheckcertificate": True,
        "retries": 10,
        "socket_timeout": 30,
        "extractor_args": {
            "youtube": {
                # Force mobile/TV clients to bypass web SABR experiments entirely
                "player_client": ["android", "ios", "tv", "web"],
            }
        },
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Android 14; Mobile; rv:128.0) Gecko/128.0 Firefox/128.0"
            ),
        },
    }
    if cookie_path:
        opts["cookiefile"] = cookie_path
        # When cookies are active, prioritize ios/android over standard desktop web
        opts["extractor_args"]["youtube"]["player_client"] = ["ios", "android", "web"]

    return opts
