
from ultralytics import YOLO
try:
    print("Testing idcard.pt...")
    model = YOLO("backend/idcard.pt")
    print(f"Model task: {model.task}")
    print(f"Model names: {model.names}")
    print("Exporting to ONNX (YOLOv8 format)...")
    model.export(format="onnx")
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")
