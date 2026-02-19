# SignVision AI 🤟✨

> **Silence shouldn't be a barrier to connection.** > Communication is a fundamental human right, yet millions of Sign Language users remain "digitally muted." SignVision AI is a high-performance recognition engine designed to translate complex human gestures into text and speech in real-time.

---

## 🏗️ The Architecture: A Tri-Engine Hybrid Approach
To achieve high accuracy across static symbols and fluid motion, I engineered a multi-model pipeline:

* **🔤 The Alphabets (Static):** Leverages **YOLOv8** for lightning-fast, robust object detection of individual letters, even in varying lighting. *(Currently in testing/optimization phase)*.
* **🔢 The Numbers:** Integrated **MediaPipe** landmark extraction with a **K-Nearest Neighbors (KNN)** classifier for precise, logic-based finger counting.
* **🗣️ The Words (Dynamic):** Implemented an **LSTM (Long Short-Term Memory)** neural network via TensorFlow to analyze motion sequences over a 30-frame temporal window.
* **🤖 AI Chatbot:** A built-in assistant providing real-time instructions and guidance on how to use the application effectively.

---

## ✨ Key Technical Milestones
* **30+ FPS Inference:** Optimized using **OpenCV** and **CVZone** to maintain a consistent, lag-free user experience.
* **Spatial Normalization:** Developed landmark-based processing to ensure recognition accuracy regardless of hand distance from the sensor.
* **Contextual Switching:** Intelligent logic that swaps between classification engines based on user intent (Letters vs. Full Words).
* **Inclusive Engineering:** A low-latency system capable of running on standard edge devices without heavy GPU requirements.

---

## 🛠️ Tech Stack

### Frontend
* **React 18** (Modern UI)
* **MediaPipe Hands** (Browser-based tracking)
* **Axios** (API Communication)
* **Modern CSS** (Responsive Dark Theme)

### Backend
* **FastAPI** (High-performance Python API)
* **TensorFlow/Keras** (LSTM Models)
* **Ultralytics** (YOLOv8 Implementation)
* **WebSocket** (Real-time data streaming)

---

## 📁 Project Structure
```text
signvision_ai/
├── backend/
│   ├── app.py              # FastAPI server with all endpoints
│   ├── requirements.txt    # Python dependencies
│   ├── models/             # LSTM (.h5) & YOLOv8 (.pt) models
│   └── labels/             # Classes for alphabets, numbers, and words
└── frontend/
    ├── src/
    │   ├── components/     # HandCamera, HistoryPanel, ChatBot, ModeSelector
    │   └── App.js          # Main logic



```

---

## 🚀 Installation & Setup

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000

```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start

```

---

## 📋 Supported Signs

| Category | Content |
| --- | --- |
| **Words** | Bird, Brush, Call, Deer, Dislike, Friend, Handicap, I, I love you, Ill, Include, Like, More, Nice, Night, Ok, Pay, Scissors, Small, Stress, You |
| **Alphabet** | A-Z (26 letters) |
| **Numbers** | 0-10 |

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for improving the YOLOv8 accuracy or adding new dynamic signs, feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for the deaf and hard-of-hearing community.** *Let's make technology speak every language—including the silent ones.* 🌎

```

---

### Would you like me to help you write a "Technical Challenges" section for your LinkedIn post or GitHub to explain how you handled the 30-frame LSTM window?

```
