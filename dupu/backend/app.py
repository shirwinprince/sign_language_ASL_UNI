from flask import Flask, render_template, Response, request, jsonify
from flask_cors import CORS
from camera import Camera
import time
import os
import atexit

app = Flask(__name__)
CORS(app)

# Lazy singleton for camera
camera_instance = None

def get_camera():
    global camera_instance
    if camera_instance is None:
        camera_instance = Camera()
    return camera_instance

def close_camera():
    global camera_instance
    if camera_instance:
        camera_instance.release()

atexit.register(close_camera)

def gen(camera):
    while True:
        frame, prediction = camera.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
        else:
            # If camera fails, wait a bit before retrying
            time.sleep(1)

@app.route('/video_feed')
def video_feed():
    cam = get_camera()
    return Response(gen(cam),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/set_model/<model_type>', methods=['POST'])
def set_model(model_type):
    cam = get_camera()
    cam.set_model(model_type)
    return jsonify({"status": "success", "model": model_type})

@app.route('/status', methods=['GET'])
def status():
    cam = get_camera()
    return jsonify({"prediction": cam.get_status()})

if __name__ == '__main__':
    # Disable reloader to prevent camera lock issues on Windows
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
