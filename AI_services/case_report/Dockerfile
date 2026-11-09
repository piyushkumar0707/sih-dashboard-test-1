FROM python:3.11-slim

WORKDIR /app
COPY AI_services/case_report/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY AI_services/case_report/ ./

EXPOSE 8002
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
