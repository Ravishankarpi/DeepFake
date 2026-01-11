import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
import torchvision.transforms as transforms
import timm
import cv2
import numpy as np
import torch.nn.functional as F

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "Backend is running"}

@app.post("/detect")
def detect():
    return {
        "deepfake_probability": 0.42,
        "note": "POC response"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)

# Pretrained XceptionNet (good for face deepfake detection)
model = timm.create_model("xception", pretrained=True)
model.eval()

transform = transforms.Compose([
    transforms.Resize((299, 299)),
    transforms.ToTensor()
])

def predict_image(image: Image.Image):
    img = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(img)  # shape: [1, 1000]

    probs = F.softmax(output, dim=1)

    # Heuristic: high entropy = likely AI generated
    entropy = -torch.sum(probs * torch.log(probs + 1e-9), dim=1)

    # Normalize entropy to 0–1 range
    score = min(entropy.item() / 6.9, 1.0)
    return score

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    image = Image.open(file.file).convert("RGB")
    score = predict_image(image)
    return {
        "type": "image",
        "deepfake_probability": round(score, 2),
        "result": "Likely AI Generated / Fake" if score > 0.5 else "Likely Real"
    }

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    contents = await file.read()
    with open("temp.mp4", "wb") as f:
        f.write(contents)

    cap = cv2.VideoCapture("temp.mp4")
    scores = []
    count = 0
    while cap.isOpened() and count < 5:  # first 5 frames
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(frame)
        score = predict_image(image)
        scores.append(score)
        count += 1
    cap.release()
    avg_score = sum(scores) / len(scores)
    return {
        "type": "video",
        "deepfake_probability": round(avg_score, 2),
        "result": "Likely Deepfake" if avg_score > 0.5 else "Likely Real"
    }
