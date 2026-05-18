
import re
import unicodedata


def safe_filename_for_header(filename: str, fallback: str) -> str:
    normalized = unicodedata.normalize("NFKD", filename)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_name = re.sub(r'[^\w\s\-.]', '', ascii_name).strip()
    ascii_name = re.sub(r'\s+', ' ', ascii_name)
    if not ascii_name or ascii_name.strip(".") == "":
        ascii_name = f"{fallback}.mp4"
    return ascii_name