# Duplicate Detection Fix - Summary

## Problem
The system was detecting the same person multiple times with different track IDs, resulting in:
- Multiple violation boxes for the same person (e.g., "nithwin v:2.0", "raju v:0.0", "Unknown v:0.0")
- Inconsistent tracking across frames
- Duplicate database entries

## Root Causes Identified

### 1. **Weak Tracker Matching Algorithm**
The original `SimpleTracker` only used centroid distance matching, which:
- Failed when people moved quickly or changed positions
- Couldn't distinguish between overlapping detections
- Created new IDs for the same person in different frames

### 2. **Loose Detection Parameters**
The YOLO model was using:
- Low confidence threshold (0.4) → accepting weak detections
- High IoU threshold (0.5) → keeping overlapping boxes
- No max detection limit → allowing unlimited detections

## Solutions Implemented

### ✅ **1. Improved Tracker Algorithm** (`tracker_simple.py`)

**Key Changes:**
- **IoU-based Matching**: Now uses Intersection over Union to compare bounding boxes
- **Combined Scoring**: 70% IoU + 30% centroid distance for robust matching
- **Stricter Thresholds**: 
  - IoU > 0.3 OR distance < 100 pixels to accept a match
  - max_disappeared reduced from 50 to 30 frames
- **Bbox Storage**: Stores both centroid AND bounding box for each tracked object

**Algorithm Flow:**
```python
1. Calculate IoU matrix between existing tracks and new detections
2. Calculate distance matrix between centroids
3. Combine scores: score = 0.7 * IoU + 0.3 * (1 - normalized_distance)
4. Match detections to tracks using combined score
5. Only accept matches with IoU > 0.3 OR distance < threshold
6. Register unmatched detections as new tracks
7. Remove tracks that disappeared for > 30 frames
```

### ✅ **2. Stricter Detection Parameters**

**Updated in all files:**
- `main.py`
- `server.py`
- `modules/live_feed.py`

**New Parameters:**
```python
results = model.predict(
    frame,
    conf=0.5,        # ↑ from 0.4 (higher confidence = fewer false positives)
    iou=0.4,         # ↓ from 0.5 (lower IoU = more aggressive NMS)
    agnostic_nms=True,  # Class-agnostic Non-Maximum Suppression
    max_det=10,      # NEW: Limit max detections per frame
    task='detect'
)
```

**Why These Values:**
- **conf=0.5**: Only accept detections with 50%+ confidence
- **iou=0.4**: Remove overlapping boxes more aggressively (NMS)
- **max_det=10**: Prevent explosion of detections in crowded scenes

### ✅ **3. Consistent Tracker Initialization**

All tracker instances now use:
```python
SimpleTracker(max_disappeared=30, distance_threshold=100)
```

## Files Modified

1. ✅ **`backend/modules/tracker_simple.py`** - Complete rewrite with IoU matching
2. ✅ **`backend/main.py`** - Updated detection params + tracker init
3. ✅ **`backend/server.py`** - Updated detection params
4. ✅ **`backend/modules/live_feed.py`** - Updated detection params + tracker init

## Expected Results

### Before Fix:
```
VIOLATION: nithwin | v:2.0
VIOLATION: raju | v:0.0
VIOLATION: Unknown | v:0.0
```
(Same person detected 3 times with different IDs)

### After Fix:
```
VIOLATION: nithwin | v:2.0
```
(Single, consistent detection per person)

## Testing Recommendations

1. **Test with Video**: Run `python main.py` with test2.mp4
2. **Test Live Feed**: Start server and check dashboard
3. **Verify Database**: Check that violations aren't duplicated
4. **Monitor FPS**: Should maintain similar or better performance

## Technical Details

### IoU Calculation
```python
def compute_iou(boxA, boxB):
    # Intersection area
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    
    # Union area
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    unionArea = boxAArea + boxBArea - interArea
    
    return interArea / unionArea
```

### Matching Logic
```python
# For each existing track and new detection:
iou_score = compute_iou(track_bbox, detection_bbox)
distance = euclidean_distance(track_centroid, detection_centroid)

# Combined score (higher is better)
score = 0.7 * iou_score + 0.3 * (1 - normalized_distance)

# Accept if good overlap OR close proximity
if iou_score > 0.3 or distance < 100:
    # Match this detection to this track
```

## Performance Impact

- **Accuracy**: ↑↑ Significantly improved (fewer duplicates)
- **Speed**: ≈ Similar (IoU computation is fast)
- **Memory**: ≈ Slightly higher (storing bboxes)
- **Stability**: ↑↑ Much more stable tracking

## Troubleshooting

If you still see duplicates:

1. **Lower `distance_threshold`**: Try 80 or 60 pixels
2. **Increase `conf`**: Try 0.6 for even stricter detection
3. **Lower `iou` for NMS**: Try 0.3 for more aggressive overlap removal
4. **Check camera quality**: Poor quality can cause detection issues

## Next Steps

Consider adding:
- [ ] Re-identification (ReID) features for person matching across cameras
- [ ] Kalman filtering for smoother tracking
- [ ] Deep SORT for even better tracking
- [ ] Face embedding matching for identity consistency
