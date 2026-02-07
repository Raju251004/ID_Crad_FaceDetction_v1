
import onnx

model_path = "backend/idcard.onnx"
fixed_path = "backend/idcard_fixed.onnx"

print(f"Loading {model_path}...")
model = onnx.load(model_path)

# Add comprehensive metadata
metadata = {
    "task": "detect",
    "names": str({0: "id_card", 1: "person"}),
    "imgsz": str([640, 640]),
    "batch": "1",
    "stride": "32",
    "version": "8.0.0",
    "author": "Ultralytics"
}

model.metadata_props.clear()
for k, v in metadata.items():
    prop = model.metadata_props.add()
    prop.key = k
    prop.value = v

print(f"Saving fixed model to {fixed_path}...")
onnx.save(model, fixed_path)
print("Done!")
