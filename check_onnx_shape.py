
import onnx
model = onnx.load("backend/idcard.onnx")
for output in model.graph.output:
    print(f"Output name: {output.name}")
    shape = []
    for dim in output.type.tensor_type.shape.dim:
        shape.append(dim.dim_value)
    print(f"Output shape: {shape}")
