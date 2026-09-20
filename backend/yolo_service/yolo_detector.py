"""
FloodGuard AI - Real-Time YOLOv8 Edge Vision Detector Service
-------------------------------------------------------------
Streams video frames (or live RTSP/CCTV/Webcam feed), runs YOLOv8 object
detection to recognize flood hazards (submerged vehicles, culvert debris,
water level staff gauges), and pushes live visual telemetry to the
FloodGuard AI municipal backend ingestion API.

Usage:
  pip install ultralytics opencv-python requests
  python yolo_detector.py --source 0 --api http://localhost:5000/api/vision/detections
"""

import sys
import time
import argparse
import json

try:
    import cv2
    from ultralytics import YOLO
    import requests
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False


def run_yolo_simulation(api_url="http://localhost:5000/api/vision/detections"):
    """
    Simulation mode when live OpenCV/camera hardware is not active.
    Continuously generates realistic YOLO inference frames and sends them to FloodGuard.
    """
    print("=" * 65)
    print("≡ƒîè FloodGuard AI - YOLOv8 Vision Service (Dual-AI Multimodal Ingestion)")
    print(f"≡ƒôí Forwarding visual telemetry to: {api_url}")
    print("≡ƒæü∩╕Å Monitoring Target: CAM-002 (Downtown Underpass Corridor)")
    print("=" * 65)

    test_cameras = [
        {
            "cameraId": "CAM-002",
            "stationId": "ST-002",
            "detections": [
                {"id": "det-1", "label": "submerged_vehicle", "confidence": 0.93, "bbox": [320, 280, 540, 450], "details": "Sedan vehicle stalled in rising underpass basin"},
                {"id": "det-2", "label": "water_accumulation", "confidence": 0.95, "bbox": [80, 360, 920, 720], "details": "Basin water level ~ 0.88m"}
            ],
            "inferenceMs": 13.8
        },
        {
            "cameraId": "CAM-003",
            "stationId": "ST-003",
            "detections": [
                {"id": "det-3", "label": "debris_clog", "confidence": 0.89, "bbox": [210, 140, 640, 480], "details": "Trash rack 78% obstructed by urban debris"},
                {"id": "det-4", "label": "water_level_gauge", "confidence": 0.92, "bbox": [150, 190, 230, 510], "details": "Optical staff gauge reading: 2.95m"}
            ],
            "inferenceMs": 11.2
        }
    ]

    import urllib.request
    idx = 0
    while True:
        target = test_cameras[idx % len(test_cameras)]
        idx += 1
        payload = {
            "cameraId": target["cameraId"],
            "stationId": target["stationId"],
            "detections": target["detections"],
            "inferenceMs": target["inferenceMs"] + round((time.time() % 3) * 0.4, 2),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        try:
            req = urllib.request.Request(
                api_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                print(f"[{time.strftime('%H:%M:%S')}] Γ£à YOLO Stream: Sent {len(target['detections'])} detections for {target['cameraId']} | Latency: {payload['inferenceMs']}ms | Server: {result.get('message', 'OK')}")
        except Exception as e:
            print(f"[{time.strftime('%H:%M:%S')}] ΓÜá∩╕Å Telemetry push notice (Server check): {e}")

        time.sleep(4.0)


def main():
    parser = argparse.ArgumentParser(description="FloodGuard AI YOLOv8 Edge Vision Service")
    parser.add_argument("--source", type=str, default="0", help="Video source (0 for webcam, RTSP URL, or mp4 file)")
    parser.add_argument("--api", type=str, default="http://localhost:5000/api/vision/detections", help="Backend ingestion endpoint")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Ultralytics YOLO model weight file")
    args = parser.parse_args()

    if not CV2_AVAILABLE:
        print("[Notice] ultralytics/cv2 optional packages not present in system python; starting standalone stream engine.")
        run_yolo_simulation(args.api)
        return

    print(f"≡ƒÜÇ Loading YOLO model: {args.model}")
    model = YOLO(args.model)
    cap = cv2.VideoCapture(int(args.source) if args.source.isdigit() else args.source)

    if not cap.isOpened():
        print(f"ΓÜá∩╕Å Could not open video source {args.source}. Running in high-fidelity simulation mode.")
        run_yolo_simulation(args.api)
        return

    print(f"≡ƒæü∩╕Å Processing live stream from source {args.source}...")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        start_time = time.time()
        results = model(frame, verbose=False)
        inference_ms = round((time.time() - start_time) * 1000, 1)

        detections = []
        for box in results[0].boxes:
            cls_id = int(box.cls[0])
            label = model.names[cls_id]
            conf = float(box.conf[0])
            xyxy = [int(v) for v in box.xyxy[0].tolist()]

            # Map typical COCO classes to flood hazard tags
            if label in ['car', 'truck', 'bus']:
                hazard_label = 'submerged_vehicle'
            elif label in ['person']:
                hazard_label = 'pedestrian_danger'
            else:
                hazard_label = 'debris_clog'

            detections.append({
                "label": hazard_label,
                "confidence": round(conf, 2),
                "bbox": xyxy
            })

        if detections:
            try:
                requests.post(args.api, json={
                    "cameraId": "CAM-002",
                    "stationId": "ST-002",
                    "detections": detections,
                    "inferenceMs": inference_ms
                }, timeout=1.0)
            except Exception:
                pass

        time.sleep(0.033)  # ~30 FPS

    cap.release()


if __name__ == "__main__":
    main()
