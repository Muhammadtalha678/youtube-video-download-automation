# install python
FROM python:3.12-slim

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