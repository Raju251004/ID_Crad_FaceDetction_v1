
import onnxruntime as ort
import cv2
import numpy as np

class MockTensor:
    def __init__(self, data):
        self.data = np.array(data)
    def cpu(self):
        return self
    def numpy(self):
        return self.data
    def __getitem__(self, idx):
        return MockTensor(self.data[idx])
    def __len__(self):
        return len(self.data)
    def tolist(self):
        return self.data.tolist()
    def __int__(self):
        return int(self.data)
    def __float__(self):
        return float(self.data)
    def __repr__(self):
        return str(self.data)

class YOLOv8ONNX:
    def __init__(self, model_path):
        self.session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
        self.task = 'detect'
        self.names = {0: 'id_card', 1: 'person'}
        print(f"[INFO] YOLOv8ONNX wrapper loaded {model_path}")

    def predict(self, frame, conf=0.4, verbose=False, task='detect', **kwargs):
        h, w = frame.shape[:2]
        input_img = cv2.resize(frame, (640, 640))
        input_img = input_img.transpose(2, 0, 1)
        input_img = input_img.astype(np.float32) / 255.0
        input_img = input_img[np.newaxis, ...]

        outputs = self.session.run(None, {self.session.get_inputs()[0].name: input_img})
        output = outputs[0]

        if output.shape[1] == 25200:
            output = output[0]
            mask = output[:, 4] > conf
            output = output[mask]
            
            boxes = []
            if len(output) > 0:
                for det in output:
                    cx, cy, dw, dh, obj_conf = det[:5]
                    cls_confs = det[5:]
                    cls_id = np.argmax(cls_confs)
                    cls_conf = cls_confs[cls_id] * obj_conf
                    
                    if cls_conf > conf:
                        x1 = (cx - dw/2) * (w / 640)
                        y1 = (cy - dh/2) * (h / 640)
                        x2 = (cx + dw/2) * (w / 640)
                        y2 = (cy + dh/2) * (h / 640)
                        
                        box = type('Box', (), {
                            'xyxy': MockTensor([np.array([x1, y1, x2, y2])]),
                            'cls': MockTensor([np.array([cls_id])]),
                            'conf': MockTensor([np.array([cls_conf])]),
                            'id': None
                        })
                        boxes.append(box)
            
            return [type('Result', (), {'boxes': boxes})]
            
        return []

    def __call__(self, frame, **kwargs):
        return self.predict(frame, **kwargs)
