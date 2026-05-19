# Stage 1: Temporarily pull the official Node image to grab the binary
FROM node:20-slim AS node_provider

# Stage 2: Build your actual application container
FROM python:3.12-slim

# Copy Node.js cleanly from Stage 1 into your python image path
COPY --from=node_provider /usr/local/bin/node /usr/local/bin/node
COPY --from=node_provider /usr/local/lib/node_modules /usr/local/lib/node_modules

# Install system dependencies including network handlers and compilation tools
RUN apt-get update && apt-get install -y \
    ca-certificates \
    ffmpeg \
    curl \
    libcurl4-openssl-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv and copy specific files to run uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Where all project files are stored
WORKDIR /app

# Copy all project files into /app
COPY . /app

# Run uv sync to install your pinned python modules
RUN uv sync --frozen --no-cache

ENV PATH="/app/.venv/bin:$PATH"

# Run the token generator server on port 4416 in the background, then launch your FastAPI app immediately
CMD ["sh", "-c", "uv run python -m bgutil_ytdlp_pot_provider & uv run uvicorn main:app --host 0.0.0.0 --port 7860"]
