
import onnx

model_path = "backend/idcard.onnx"
fixed_path = "backend/idcard_fixed.onnx"

print(f"Loading {model_path}...")
model = onnx.load(model_path)

# Add metadata
metadata = {
    "task": "detect",
    "names": str({0: "id_card", 1: "person"}),
    "imgsz": str([640, 640])
}

# Remove existing if any
keys_to_remove = ["task", "names", "imgsz"]
props = [p for p in model.metadata_props if p.key not in keys_to_remove]
model.metadata_props.clear()
model.metadata_props.extend(props)

for k, v in metadata.items():
    prop = model.metadata_props.add()
    prop.key = k
    prop.value = v

print(f"Saving fixed model to {fixed_path}...")
onnx.save(model, fixed_path)
print("Done!")
