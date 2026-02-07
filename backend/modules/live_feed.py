import cv2
import threading
import queue
import numpy as np
import time
from modules.utils import save_snapshot

# ==========================================
# Threaded Camera
# ==========================================
class ThreadedCamera:
    def __init__(self, src=0):
        self.capture = cv2.VideoCapture(src)
        self.q = queue.Queue(maxsize=1) 
        self.t = threading.Thread(target=self._reader)
        self.t.daemon = True
        self.stopped = False
        self.t.start()

    def _reader(self):
        while not self.stopped:
            ret, frame = self.capture.read()
            if not ret:
                break
            if self.q.full():
                try:
                    self.q.get_nowait()
                except queue.Empty:
                    pass
            self.q.put(frame)

    def read(self):
        try:
            return self.q.get(timeout=1.0)
        except queue.Empty:
            return None

    def release(self):
        self.stopped = True
        self.t.join()
        self.capture.release()

# ==========================================
# Compliance Tracker V2 (Ported from main.py)
# ==========================================
class ComplianceTrackerV2:
    def __init__(self, face_identifier, session_maker):
        self.face_identifier = face_identifier
        self.session_maker = session_maker # Function to get DB session
        self.people_state = {} 
        self.BASE_THRESHOLD = 25
        self.FAST_MOVER_THRESHOLD = 10 
        self.trails = {} 

    def update(self, frame, person_tracks, id_card_boxes):
        results_to_display = []
        
        active_ids = {t[4] for t in person_tracks}
        self.trails = {k: v for k, v in self.trails.items() if k in active_ids}

        for track in person_tracks:
            x1, y1, x2, y2, track_id = track
            center_x, center_y = int((x1 + x2) / 2), int((y1 + y2) / 2)
            
            # --- Update Trails ---
            if track_id not in self.trails:
                self.trails[track_id] = []
            self.trails[track_id].append((center_x, center_y))
            if len(self.trails[track_id]) > 20: 
                self.trails[track_id].pop(0)

            # --- State Init ---
            if track_id not in self.people_state:
                self.people_state[track_id] = {
                    'no_id_frames': 0, 
                    'logged': False, 
                    'logged_verified': False,
                    'name': 'Unknown',
                    'prev_pos': (center_x, center_y),
                    'velocity': 0
                }
            
            state = self.people_state[track_id]
            
            # --- Velocity Calculation ---
            prev_cx, prev_cy = state['prev_pos']
            dist = np.sqrt((center_x - prev_cx)**2 + (center_y - prev_cy)**2)
            state['velocity'] = dist
            state['prev_pos'] = (center_x, center_y)

            threshold = self.FAST_MOVER_THRESHOLD if dist > 25 else self.BASE_THRESHOLD

            # --- ID Association ---
            has_id = False
            person_box = [x1, y1, x2, y2]
            for id_box in id_card_boxes:
                if self.check_overlap(person_box, id_box):
                    has_id = True
                    break

            # --- Status Logic ---
            if has_id:
                state['no_id_frames'] = 0
                status = "COMPLIANT"
                color = (0, 255, 0)
                
                # Verified Logging Logic
                if not state['logged_verified']:
                    if state['name'] == 'Unknown':
                         state['name'] = self.face_identifier.identify(frame, person_box)
                    
                    if state['name'] != 'Unknown':
                        # Save verified snapshot
                        image_path = save_snapshot(frame, state['name'], person_box, "database/verified")
                        self.log_to_db(state['name'], image_path, track_id, "VERIFIED")
                        state['logged_verified'] = True

            else:
                state['no_id_frames'] += 1
                
                if state['no_id_frames'] >= threshold:
                    if not state['logged']:
                        if state['name'] == 'Unknown':
                             state['name'] = self.face_identifier.identify(frame, person_box)
                        
                        image_path = save_snapshot(frame, state['name'], person_box, "database/violations")
                        self.log_to_db(state['name'], image_path, track_id, "VIOLATION")
                        state['logged'] = True
                    
                    status = f"VIOLATION: {state['name']}"
                    color = (0, 0, 255)
                elif state['logged']:
                    status = f"VIOLATION: {state['name']}"
                    color = (0, 0, 255)
                else:
                    status = f"CHECKING {state['no_id_frames']}/{threshold}"
                    color = (0, 255, 255)

            results_to_display.append({
                'bbox': person_box,
                'status': status,
                'color': color,
                'velocity': dist,
                'track_id': track_id
            })

        return results_to_display

    def check_overlap(self, person_box, id_box):
        px1, py1, px2, py2 = person_box
        ix1, iy1, ix2, iy2 = id_box
        icx, icy = (ix1 + ix2) / 2, (iy1 + iy2) / 2
        return px1 < icx < px2 and py1 < icy < py2

    def log_to_db(self, name, image_path, track_id, status_type):
        from database_config import ViolationLog, Session
        # Create a new session for this operation
        # Note: In threaded context, we need to be careful with sessions.
        session = next(self.session_maker())
        try:
            log = ViolationLog(
                person_name=name,
                image_path=image_path,
                track_id=track_id,
                status=status_type
            )
            session.add(log)
            session.commit()
        except Exception as e:
            print(f"DB Error: {e}")
        finally:
            session.close()

# Generator for streaming
def generate_frames(model, face_ident, session_maker):
    tracker = ComplianceTrackerV2(face_ident, session_maker)
    
    # SimpleTracker fallback import inside function to avoid circular imports if any
    from modules.tracker_simple import SimpleTracker
    # Initialize with stricter parameters to prevent duplicate detections
    person_tracker = SimpleTracker(max_disappeared=30, distance_threshold=100)
    
    cap = ThreadedCamera(0) # Open webcam 0 on server
    time.sleep(1.0) # Warmup

    try:
        while True:
            frame = cap.read()
            if frame is None:
                continue

            # --- Detection ---
            # Resize for speed
            orig_h, orig_w = frame.shape[:2]
            detect_w = 640
            scale = detect_w / orig_w
            detect_h = int(orig_h * scale)
            
            small_frame = cv2.resize(frame, (detect_w, detect_h))
            
            # Predict with stricter parameters to reduce duplicate detections
            results = model.predict(
                small_frame, 
                conf=0.5,  # Increased confidence threshold
                iou=0.4,   # Lower IoU = more aggressive NMS
                agnostic_nms=True, 
                verbose=False, 
                task='detect',
                max_det=10  # Limit max detections
            )
            
            person_tracks_raw = []
            id_card_boxes = []

            if results and results[0].boxes:
                for box in results[0].boxes:
                    cls = int(box.cls[0])
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    # Rescale back to original
                    x1, y1, x2, y2 = x1/scale, y1/scale, x2/scale, y2/scale
                    
                    if cls == 1: 
                        person_tracks_raw.append([x1, y1, x2, y2])
                    elif cls == 0: 
                        id_card_boxes.append([x1, y1, x2, y2])

            # Deduplicate
            from modules.utils import perform_nms
            person_tracks_raw = perform_nms(person_tracks_raw, scores=None, iou_threshold=0.3)

            # Update specialized trackers
            person_tracks = person_tracker.update(person_tracks_raw)
            display_data = tracker.update(frame, person_tracks, id_card_boxes)

            # --- Draw Viz on Frame ---
            for id, points in tracker.trails.items():
                if len(points) > 1:
                    for i in range(1, len(points)):
                        cv2.line(frame, points[i-1], points[i], (0, 165, 255), 2)

            for item in display_data:
                x1, y1, x2, y2 = map(int, item['bbox'])
                color = item['color']
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                
                label = f"{item['status']}"
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                cv2.rectangle(frame, (x1, y1 - 20), (x1 + tw, y1), color, -1)
                cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

            # Encode
            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
    finally:
        cap.release()
