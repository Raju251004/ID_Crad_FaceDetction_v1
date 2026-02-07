
from ultralytics import YOLO
import numpy as np
import cv2
import traceback

print("Attempting to load model without task in constructor...")
model = YOLO("backend/idcard.onnx")

dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)

print("\nTesting predict(task='detect')...")
try:
    results = model.predict(dummy_frame, task='detect')
    print("Predict success!")
except Exception as e:
    print(f"Predict failed: {e}")
    traceback.print_exc()

print("\nTesting call(task='detect')...")
try:
    results = model(dummy_frame, task='detect')
    print("Call success!")
except Exception as e:
    print(f"Call failed: {e}")
    traceback.print_exc()

print("\nTesting track(task='detect')...")
try:
    results = model.track(dummy_frame, task='detect', persist=True)
    print("Track success!")
except Exception as e:
    print(f"Track failed: {e}")
    traceback.print_exc()
