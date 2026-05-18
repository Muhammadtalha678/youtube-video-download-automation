# Stage 1: Temporarily pull the official Node image to grab the binary
FROM node:20-slim AS node_provider

# Stage 2: Build your actual application container
FROM python:3.12-slim

# Copy Node.js directly from the official node image into your python path
COPY --from=node_provider /usr/local/bin/node /usr/local/bin/node
COPY --from=node_provider /usr/local/lib/node_modules /usr/local/lib/node_modules

# CRITICAL FIX: Install ffmpeg along with ca-certificates
RUN apt-get update && apt-get install -y \
    ca-certificates \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# install uv and copy specific file to run uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# where all my project files are store
WORKDIR /app

# now copy all my project files into /app
COPY . /app

# Run uv sync
RUN uv sync --frozen --no-cache

ENV PATH="/app/.venv/bin:$PATH"

# Run the application.
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
