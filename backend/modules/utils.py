import cv2
import numpy as np
import os
from datetime import datetime

def perform_nms(boxes, scores, iou_threshold=0.3):
    """
    Apply Non-Maximum Suppression to filter overlapping boxes.
    
    Args:
        boxes: List of [x1, y1, x2, y2]
        scores: List of confidence scores (optional, can be all 1.0)
        iou_threshold: Intersection over Union threshold (0.3 means remove if overlap > 30%)
        
    Returns:
        List of selected boxes [x1, y1, x2, y2]
    """
    if len(boxes) == 0:
        return []
    
    # Ensure boxes are float for calculation but return original format
    boxes_np = np.array(boxes).astype(float)
    
    # If no scores provided, prioritize by area (larger boxes first) or just order
    if not scores or len(scores) != len(boxes):
        # Calculate areas as proxy for score? Or just use index
        scores = np.ones(len(boxes))
    
    scores_np = np.array(scores)
    
    # Use OpenCV's NMS
    # cv2.dnn.NMSBoxes expects (x, y, w, h)
    boxes_xywh = []
    for x1, y1, x2, y2 in boxes_np:
        boxes_xywh.append([int(x1), int(y1), int(x2 - x1), int(y2 - y1)])
        
    indices = cv2.dnn.NMSBoxes(boxes_xywh, scores_np, score_threshold=0.0, nms_threshold=iou_threshold)
    
    selected_boxes = []
    if len(indices) > 0:
        for i in indices.flatten():
            selected_boxes.append(boxes[i])
            
    return selected_boxes

def blur_background(frame, focus_bbox):
    """
    Blurs the entire frame except for the region defined by focus_bbox (x1, y1, x2, y2).
    """
    if focus_bbox is None:
        return cv2.GaussianBlur(frame, (21, 21), 0)

    x1, y1, x2, y2 = map(int, focus_bbox)
    h, w = frame.shape[:2]

    # Add padding (e.g., 20% of width/height)
    pad_w = int((x2 - x1) * 0.2)
    pad_h = int((y2 - y1) * 0.2)

    x1 = max(0, x1 - pad_w)
    y1 = max(0, y1 - pad_h)
    x2 = min(w, x2 + pad_w)
    y2 = min(h, y2 + pad_h)
    
    # Global blur
    blurred_frame = cv2.GaussianBlur(frame, (99, 99), 30)
    
    # Copy the clear person (with padding) from original frame
    blurred_frame[y1:y2, x1:x2] = frame[y1:y2, x1:x2]
    
    return blurred_frame

def save_snapshot(frame, person_name, bbox, output_dir):
    """
    Saves the processed frame (blurred background) to the specified directory.
    Returns the filepath.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Sanitize filename
    safe_name = "".join([c for c in person_name if c.isalpha() or c.isdigit() or c==' ']).strip().replace(" ", "_")
    filename = f"{safe_name}_{timestamp}.jpg"
    
    # Use forward slashes for web compatibility
    filepath = f"{output_dir}/{filename}"

    # Process frame: blur everything except the person
    processed_frame = blur_background(frame, bbox)
    
    cv2.imwrite(filepath, processed_frame)
    # print(f"[LOG] Snapshot saved: {filepath}")
    return filepath

def save_violation(frame, person_name, bbox, violations_dir="database/violations"):
    return save_snapshot(frame, person_name, bbox, violations_dir)
