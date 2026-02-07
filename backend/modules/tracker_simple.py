
import numpy as np

class SimpleTracker:
    def __init__(self, max_disappeared=30, distance_threshold=100):
        """
        Improved tracker with IoU-based matching to prevent duplicate detections.
        
        Args:
            max_disappeared: Frames before removing a lost track
            distance_threshold: Maximum pixel distance for centroid matching
        """
        self.next_id = 0
        self.objects = {}  # {id: (centroid, bbox)}
        self.disappeared = {}
        self.max_disappeared = max_disappeared
        self.distance_threshold = distance_threshold

    def register(self, centroid, bbox):
        """Register a new object with centroid and bounding box"""
        self.objects[self.next_id] = (centroid, bbox)
        self.disappeared[self.next_id] = 0
        self.next_id += 1

    def deregister(self, object_id):
        """Remove an object from tracking"""
        del self.objects[object_id]
        del self.disappeared[object_id]

    def compute_iou(self, boxA, boxB):
        """
        Compute Intersection over Union (IoU) between two bounding boxes.
        Boxes format: [x1, y1, x2, y2]
        """
        # Determine coordinates of intersection rectangle
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])

        # Compute area of intersection
        interArea = max(0, xB - xA) * max(0, yB - yA)

        # Compute area of both boxes
        boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

        # Compute IoU
        iou = interArea / float(boxAArea + boxBArea - interArea + 1e-6)
        return iou

    def update(self, rects):
        """
        Update tracker with new detections.
        Uses IoU + centroid distance for better matching.
        """
        if len(rects) == 0:
            # Mark all existing objects as disappeared
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            return []

        # Calculate centroids for new detections
        input_centroids = np.zeros((len(rects), 2), dtype="int")
        input_bboxes = []
        
        for (i, (startX, startY, endX, endY)) in enumerate(rects):
            cX = int((startX + endX) / 2.0)
            cY = int((startY + endY) / 2.0)
            input_centroids[i] = (cX, cY)
            input_bboxes.append([startX, startY, endX, endY])

        # If no existing objects, register all new detections
        if len(self.objects) == 0:
            for i in range(len(input_centroids)):
                self.register(input_centroids[i], input_bboxes[i])
        else:
            object_ids = list(self.objects.keys())
            object_centroids = np.array([self.objects[oid][0] for oid in object_ids])
            object_bboxes = [self.objects[oid][1] for oid in object_ids]

            # Compute distance matrix between existing and new centroids
            D = np.linalg.norm(object_centroids[:, np.newaxis] - input_centroids, axis=2)
            
            # Compute IoU matrix
            IoU = np.zeros((len(object_bboxes), len(input_bboxes)))
            for i, obj_bbox in enumerate(object_bboxes):
                for j, inp_bbox in enumerate(input_bboxes):
                    IoU[i, j] = self.compute_iou(obj_bbox, inp_bbox)

            # Combined matching score: prioritize IoU, use distance as tiebreaker
            # Normalize distance to 0-1 range (higher is better)
            max_dist = np.max(D) if np.max(D) > 0 else 1
            D_norm = 1 - (D / max_dist)
            
            # Combined score: 70% IoU + 30% distance
            combined_score = 0.7 * IoU + 0.3 * D_norm

            # Sort by combined score (higher is better)
            rows = combined_score.max(axis=1).argsort()[::-1]
            cols = combined_score.argmax(axis=1)[rows]

            used_rows = set()
            used_cols = set()

            # Match existing objects to new detections
            for (row, col) in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue
                
                # Check if match is good enough
                iou_score = IoU[row, col]
                dist = D[row, col]
                
                # Accept match if IoU > 0.3 OR distance < threshold
                if iou_score > 0.3 or dist < self.distance_threshold:
                    object_id = object_ids[row]
                    self.objects[object_id] = (input_centroids[col], input_bboxes[col])
                    self.disappeared[object_id] = 0
                    used_rows.add(row)
                    used_cols.add(col)

            # Handle unmatched existing objects
            unused_rows = set(range(len(object_centroids))).difference(used_rows)
            unused_cols = set(range(len(input_centroids))).difference(used_cols)

            # Mark disappeared objects
            for row in unused_rows:
                object_id = object_ids[row]
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)

            # Register new objects
            for col in unused_cols:
                self.register(input_centroids[col], input_bboxes[col])

        # Build output with track IDs
        tracked_rects = []
        for i, bbox in enumerate(input_bboxes):
            # Find the best matching object ID for this detection
            best_id = -1
            best_score = -1
            
            for object_id, (obj_centroid, obj_bbox) in self.objects.items():
                # Calculate IoU with current bbox
                iou = self.compute_iou(obj_bbox, bbox)
                
                # Calculate centroid distance
                dist = np.linalg.norm(np.array(obj_centroid) - input_centroids[i])
                
                # Combined score
                score = 0.7 * iou + 0.3 * (1 - min(dist / self.distance_threshold, 1))
                
                if score > best_score:
                    best_score = score
                    best_id = object_id
            
            tracked_rects.append([bbox[0], bbox[1], bbox[2], bbox[3], best_id])
        
        return tracked_rects
