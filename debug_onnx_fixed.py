
from ultralytics import YOLO
import numpy as np
import cv2
import traceback

print("Testing with idcard_fixed.onnx...")
try:
    model = YOLO("backend/idcard_fixed.onnx")
    print(f"Model task: {model.task}")
    print(f"Model names: {model.names}")
    
    dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)
    print("Testing track...")
    results = model.track(dummy_frame, persist=True)
    print("Track success!")
except Exception as e:
    print(f"Failed: {e}")
    traceback.print_exc()
