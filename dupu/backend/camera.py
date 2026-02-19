import cv2
from model_utils import NumberModel, AlphabetModel, WordModel

class Camera:
    def __init__(self):
        # Do not open camera in init to avoid resource locks during import
        self.video = None
        self.current_model = None
        self.model_type = None
        self.last_prediction = ""
        
        self.models = {}
        # Paths - Preserving user's modified paths
        self.model_paths = {
            'number': r"NUM/models/nummodel.h5",
            'alphabet': (r"Model/alphabetmodel.h5", r"Model/labels.txt"),
            'word': (r"Word/wordmodel.h5", r"Word/dataset")
        }

    def ensure_camera_open(self):
        if self.video is None or not self.video.isOpened():
            self.video = cv2.VideoCapture(0)
            if not self.video.isOpened():
                print("Error: Could not open video device 0")

    def set_model(self, model_type):
        print(f"Switching to model: {model_type}")
        self.model_type = model_type
        
        if model_type not in self.models:
            print(f"Loading {model_type} model...")
            try:
                if model_type == 'number':
                    self.models['number'] = NumberModel(self.model_paths['number'])
                elif model_type == 'alphabet':
                    p1, p2 = self.model_paths['alphabet']
                    self.models['alphabet'] = AlphabetModel(p1, p2)
                elif model_type == 'word':
                    p1, p2 = self.model_paths['word']
                    self.models['word'] = WordModel(p1, p2)
            except Exception as e:
                print(f"Error loading model {model_type}: {e}")
                self.models[model_type] = None

        self.current_model = self.models.get(model_type)

    def get_frame(self):
        self.ensure_camera_open()
        
        if self.video is None or not self.video.isOpened():
            return None, "Camera Error"

        success, image = self.video.read()
        if not success:
            return None, ""

        # processing
        prediction = ""
        if self.current_model:
            try:
                image, prediction = self.current_model.predict(image)
            except Exception as e:
                print(f"Prediction error: {e}")
        
        self.last_prediction = prediction

        ret, jpeg = cv2.imencode('.jpg', image)
        return jpeg.tobytes(), prediction

    def get_status(self):
        return self.last_prediction
    
    def release(self):
        if self.video and self.video.isOpened():
            self.video.release()
