# Stage 1: Build Frontend
FROM node:20-alpine AS build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# We don't set VITE_API_URL here, so it defaults to dynamic window.location.origin
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for some python packages if needed
RUN apt-get update && apt-get install -y gcc sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create directories for volumes
RUN mkdir -p /app/uploads /app/processed_data

# Give permissions (HF Spaces runs as user 1000)
RUN useradd -m -u 1000 user
RUN chown -R user:user /app
USER user

# Copy backend code
COPY --chown=user:user . .

# Copy built frontend from Stage 1
COPY --from=build --chown=user:user /app/frontend/dist /app/frontend/dist

# Set environment variables for production
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

EXPOSE 7860

# Run FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
