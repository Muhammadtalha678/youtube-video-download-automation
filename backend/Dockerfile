# install python
FROM python:3.12-slim

# Install Node.js cleanly for yt-dlp challenge solving
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://nodesource.com nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# install uv and copy specific file to run uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# where all my project files are store
WORKDIR /app

# now copy all my project files into /app
COPY . /app

# Expose PORT
# EXPOSE 8000

RUN uv sync --frozen --no-cache

ENV PATH="/app/.venv/bin:$PATH"

# Run the application.
CMD ["uv", "run","uvicorn", "main:app", "--host", "0.0.0.0","--port", "7860"]
