# ---------- STEP 1: BASE IMAGE ----------
FROM python:3.10-slim

# Set work directory
WORKDIR /app

# ---------- STEP 2: INSTALL DEPENDENCIES ----------
# Copy requirements file
COPY requirements.txt .

# Install python packages
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ---------- STEP 3: COPY APP CODE ----------
COPY . .

# Expose the port (Back4App will use this)
EXPOSE 8000

# ---------- STEP 4: START COMMAND ----------
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
