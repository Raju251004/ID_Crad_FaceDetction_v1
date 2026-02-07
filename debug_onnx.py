
from ultralytics import YOLO
import numpy as np
import cv2

model = YOLO("backend/idcard.onnx", task="detect")
model.task = "detect"
print(f"Model task: {model.task}")

# Test dummy frame
dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)
try:
    print("Testing track...")
    results = model.track(dummy_frame, persist=True)
    print("Track success!")
except Exception as e:
    print(f"Track failed: {e}")
    import traceback
    traceback.print_exc()

try:
    print("Testing call...")
    results = model(dummy_frame)
    print("Call success!")
except Exception as e:
    print(f"Call failed: {e}")
    traceback.print_exc()
