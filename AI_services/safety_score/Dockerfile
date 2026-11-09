FROM python:3.11-slim

WORKDIR /app
COPY AI_services/safety_score/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY AI_services/safety_score/ ./

EXPOSE 8001
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
