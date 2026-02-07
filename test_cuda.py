import torch
from ultralytics import YOLO

# This should print True
print(f"Is GPU available? {torch.cuda.is_available()}")

# This will show you which GPU it found (e.g., RTX 3060, etc.)
if torch.cuda.is_available():
    print(f"Using GPU: {torch.cuda.get_device_name(0)}")

# Load the model and force it to use GPU (device=0)
model = YOLO('yolov8n.pt')
model.to('cuda')