import cv2
import mediapipe as mp
import numpy as np
import pandas as pd
import joblib
import itertools
import copy
import math
import os
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
from tensorflow.keras.models import load_model

# --- Shared MediaPipe Initialization for Number & Word (to avoid multiple instances if possible, or keep separate to match user code) ---
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

from sklearn.neighbors import KNeighborsClassifier

class NumberModel:
    def __init__(self, model_path_ignored=None):
        # We ignore the model_path (h5) and load numbers.csv directly from the same dir
        # Assuming model_path was "NUM/models/nummodel.h5", we look for "NUM/models/numbers.csv"
        self.csv_path = "NUM/models/numbers.csv"
        
        print(f"Loading Number Model Trace data from {self.csv_path}...")
        try:
            # Load dataset
            # header=None because the file seems to be raw data
            self.df = pd.read_csv(self.csv_path, header=None)
            
            # Check if dataset is valid
            if self.df.empty:
                raise Exception("numbers.csv is empty")

            # Features are all columns except the last one
            self.X = self.df.iloc[:, :-1].values
            # Labels are the last column
            self.y = self.df.iloc[:, -1].values
            
            # Train KNN
            self.knn = KNeighborsClassifier(n_neighbors=1)
            self.knn.fit(self.X, self.y)
            print(f"Number Model (KNN) trained on {len(self.df)} samples. Classes: {np.unique(self.y)}")
            
        except Exception as e:
            print(f"FATAL: Failed to load numbers.csv for NumberModel: {e}")
            self.knn = None

        self.hands = mp_hands.Hands(
            model_complexity=0,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles

    def calc_landmark_list(self, image, landmarks):
        image_width, image_height = image.shape[1], image.shape[0]
        landmark_point = []
        for _, landmark in enumerate(landmarks.landmark):
            landmark_x = min(int(landmark.x * image_width), image_width - 1)
            landmark_y = min(int(landmark.y * image_height), image_height - 1)
            landmark_point.append([landmark_x, landmark_y])
        return landmark_point

    def pre_process_landmark(self, landmark_list):
        temp_landmark_list = copy.deepcopy(landmark_list)
        base_x, base_y = 0, 0
        for index, landmark_point in enumerate(temp_landmark_list):
            if index == 0:
                base_x, base_y = landmark_point[0], landmark_point[1]
            temp_landmark_list[index][0] = temp_landmark_list[index][0] - base_x
            temp_landmark_list[index][1] = temp_landmark_list[index][1] - base_y
        temp_landmark_list = list(itertools.chain.from_iterable(temp_landmark_list))
        max_value = max(list(map(abs, temp_landmark_list)))
        def normalize_(n):
            return n / max_value if max_value != 0 else 0
        temp_landmark_list = list(map(normalize_, temp_landmark_list))
        return temp_landmark_list

    def predict(self, image):
        if self.knn is None:
            cv2.putText(image, "ERR: NO DATA", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            return image, "Error"

        # 1. Flip image to match local script behavior (mirror mode)
        image = cv2.flip(image, 1)
        debug_image = copy.deepcopy(image)
        
        # 2. Convert to RGB for MediaPipe
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(image_rgb)
        
        prediction_label = ""
        
        if results.multi_hand_landmarks:
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                # 3. Calculate landmarks using debug_image (as per user script)
                landmark_list = self.calc_landmark_list(debug_image, hand_landmarks)
                pre_processed_landmark_list = self.pre_process_landmark(landmark_list)
                
                # 4. Draw landmarks
                self.mp_drawing.draw_landmarks(
                    image, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing_styles.get_default_hand_landmarks_style(),
                    self.mp_drawing_styles.get_default_hand_connections_style())
                
                # 5. Predict using KNN
                # Helper function expects list, KNN expects 2D array
                input_data = np.array([pre_processed_landmark_list])
                
                try:
                    prediction = self.knn.predict(input_data)
                    prediction_label = str(prediction[0])
                    print(f"DEBUG: KNN Predicted Label: {prediction_label}")
                except Exception as e:
                    print(f"Prediction Error: {e}")
                    prediction_label = "?"
                
                # 6. Draw Prediction
                cv2.putText(image, prediction_label, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 255), 2)
        
        return image, prediction_label


class AlphabetModel:
    def __init__(self, model_path, labels_path):
        self.detector = HandDetector(maxHands=1)
        self.classifier = Classifier(model_path, labels_path)
        self.labels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q"
          ,"R","S","T","U","V","W","X","Y","Z"]
        self.offset = 20
        self.imgSize = 300

    def predict(self, img):
        imgOutput = img.copy()
        hands, img = self.detector.findHands(img, draw=True) # Draw on original img? User used draw=True implicitly or separate call
        # cvzone findHands returns hands list and the image with drawing
        
        prediction_label = ""

        if hands:
            hand = hands[0]
            x, y, w, h = hand['bbox']
            
            imgWhite = np.ones((self.imgSize, self.imgSize, 3), np.uint8) * 255
            
            # Safe crop
            y1 = max(0, y - self.offset)
            y2 = min(img.shape[0], y + h + self.offset)
            x1 = max(0, x - self.offset)
            x2 = min(img.shape[1], x + w + self.offset)
            
            imgCrop = img[y1:y2, x1:x2]

            if imgCrop.size != 0:
                aspectRatio = h / w
                if aspectRatio > 1:
                    k = self.imgSize / h
                    wCal = math.ceil(k * w)
                    imgResize = cv2.resize(imgCrop, (wCal, self.imgSize))
                    wGap = (self.imgSize - wCal) // 2
                    imgWhite[:, wGap:wGap + wCal] = imgResize
                else:
                    k = self.imgSize / w
                    hCal = math.ceil(k * h)
                    imgResize = cv2.resize(imgCrop, (self.imgSize, hCal))
                    hGap = (self.imgSize - hCal) // 2
                    imgWhite[hGap:hGap + hCal, :] = imgResize

                try:
                    prediction, index = self.classifier.getPrediction(imgWhite, draw=False)
                    prediction_label = self.labels[index]
                except Exception as e:
                    print(f"Prediction error: {e}")

                cv2.rectangle(imgOutput, (x - self.offset, y - self.offset - 50),
                              (x - self.offset + 100, y - self.offset - 50 + 50), (255, 0, 255), cv2.FILLED)
                cv2.putText(imgOutput, prediction_label, (x, y - 26), cv2.FONT_HERSHEY_COMPLEX, 2, (255, 255, 255), 2)
                cv2.rectangle(imgOutput, (x - self.offset, y - self.offset), (x + w + self.offset, y + h + self.offset), (255, 0, 255), 4)

        return imgOutput, prediction_label


class WordModel:
    def __init__(self, model_path, dataset_path):
        self.model = load_model(model_path)
        try:
            self.actions = sorted(os.listdir(dataset_path))
        except:
            print("Warning: Dataset path not found, using empty actions list.")
            self.actions = []
            
        self.sequence_length = 30
        self.sequence = []
        self.threshold = 0.7
        
        # --- Optimization Variables ---
        self.frame_counter = 0        # Tracks frames to trigger inference
        self.last_label = ""          # Stores last result to prevent flicker
        self.last_confidence = 0.0    # Stores last confidence score
        
        self.hands = mp_hands.Hands(
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )

    def predict(self, image):
        # 1. MediaPipe Processing (MUST run every frame for smooth tracking)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(image_rgb)
        
        if results.multi_hand_landmarks:
            for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
                if i >= 2: break
                mp_drawing.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
        
        # 2. Keypoint Extraction (MUST run every frame for LSTM memory)
        keypoints = np.zeros(126) 
        if results.multi_hand_landmarks:
            for i, hand_landmarks in enumerate(results.multi_hand_landmarks):
                if i >= 2: break
                hand_data = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark]).flatten()
                keypoints[i*63:(i+1)*63] = hand_data

        self.sequence.append(keypoints)
        self.sequence = self.sequence[-self.sequence_length:]

        # 3. Optimized Inference Logic
        self.frame_counter += 1
        
        # Only run the heavy TensorFlow prediction every 5 frames
        if self.frame_counter % 5 == 0:
            if len(self.sequence) == self.sequence_length:
                res = self.model.predict(np.expand_dims(self.sequence, axis=0), verbose=0)[0]
                best_idx = np.argmax(res)
                confidence = res[best_idx]
                
                if confidence > self.threshold and len(self.actions) > best_idx:
                    self.last_label = self.actions[best_idx]
                    self.last_confidence = confidence
                else:
                    # Optional: Clear label if confidence drops significantly
                    # self.last_label = "" 
                    pass

        # 4. Consistent UI Drawing (Uses last known prediction during skipped frames)
        if self.last_label:
            cv2.putText(image, f"{self.last_label} ({self.last_confidence:.2f})", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

        return image, self.last_label
