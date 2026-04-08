FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    ffmpeg \
    libsndfile1 \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    shared-mime-info \
    fonts-noto-cjk 

COPY app/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# RUN apt-get update && apt-get install -y wkhtmltopdf && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY app/ .

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# CMD cd /app && python -m uvicorn main:app --host 0.0.0.0 --port 8000