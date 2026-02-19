import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import VideoFeed from './components/VideoFeed';
import ControlPanel from './components/ControlPanel';
import PredictionHistory from './components/PredictionHistory';
import Chatbot from './components/Chatbot';

// Determine backend URL (default logic)
const BACKEND_URL = 'http://localhost:5000';

const App = () => {
  const [activeModel, setActiveModel] = useState('number');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [history, setHistory] = useState([]);
  const [lastPrediction, setLastPrediction] = useState('');

  // Use a ref to track if we are already speaking to avoid overlap
  const isSpeaking = useRef(false);

  // Switch model on backend when activeModel changes
  useEffect(() => {
    const switchModel = async () => {
      try {
        await axios.post(`${BACKEND_URL}/set_model/${activeModel}`);
      } catch (error) {
        console.error("Failed to set model:", error);
      }
    };
    switchModel();
  }, [activeModel]);

  // Polling for status
  useEffect(() => {
    let intervalId;

    if (isCameraOn) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/status`);
          const prediction = response.data.prediction;

          if (prediction && prediction !== lastPrediction && prediction !== '?') {
            handleNewPrediction(prediction);
          }
        } catch (error) {
          console.error("Error fetching status:", error);
        }
      }, 1000); // Check every second
    }

    return () => clearInterval(intervalId);
  }, [isCameraOn, lastPrediction, activeModel]);

  const handleNewPrediction = (text) => {
    setLastPrediction(text);

    // Add to history
    const newEntry = {
      text: text,
      model: activeModel,
      time: new Date().toLocaleTimeString(),
    };
    setHistory(prev => [...prev, newEntry]);

    // Speak
    speak(text);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel current speech if any? Or queue it? 
      // User said "give me in the voice output".
      // Usually better to cancel previous if a new one comes quickly? 
      // But 1s interval is slow enough.

      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    // Note: Backend stream starts/stops based on request to video_feed, 
    // but we can also conceptually "stop" it by hiding the img and maybe telling backend?
    // Current backend keeps running. That's fine for now.
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sign Language Recognition</h1>
        <p className="subtitle"></p>
      </header>

      <main className="main-content">
        <div className="left-column">
          <VideoFeed isCameraOn={isCameraOn} />
          <ControlPanel
            activeModel={activeModel}
            setModel={setActiveModel}
            isCameraOn={isCameraOn}
            toggleCamera={toggleCamera}
          />
        </div>
        <div className="right-column">
          <PredictionHistory history={history} />
        </div>
      </main>

      <Chatbot activeModel={activeModel} isCameraOn={isCameraOn} />
    </div>
  );
};

export default App;
