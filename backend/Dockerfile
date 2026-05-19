# install python
FROM python:3.12-slim

# Stage 1: Temporarily pull the official Node image to grab the binary
FROM node:20-slim AS node_provider
COPY --from=node_provider /usr/local/bin/node /usr/local/bin/node
COPY --from=node_provider /usr/local/lib/node_modules /usr/local/lib/node_modules

# Install system dependencies including network handlers
RUN apt-get update && apt-get install -y \
    ca-certificates \
    ffmpeg \
    curl \
    libcurl4-openssl-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# install uv and copy specific file to run uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app
COPY . /app

RUN uv sync --frozen --no-cache
ENV PATH="/app/.venv/bin:$PATH"

# FIX: Boot the token generator backend, then launch your app immediately
CMD ["sh", "-c", "uv run python -m bgutil_ytdlp_pot_provider & uv run uvicorn main:app --host 0.0.0.0 --port 7860"]
