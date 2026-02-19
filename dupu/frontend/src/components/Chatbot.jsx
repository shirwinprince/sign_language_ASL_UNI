import React, { useState, useRef, useEffect } from 'react';
import '../styles/Chatbot.css';

// Simple similarity function for better NLP
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(shorter, longer);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (s1, s2) => {
  const costs = [];
  for (let l1 = 0; l1 <= s1.length; l1++) {
    let lastValue = l1;
    for (let l2 = 0; l2 <= s2.length; l2++) {
      if (l1 === 0) {
        costs[l2] = l2;
      } else if (l2 > 0) {
        let newValue = costs[l2 - 1];
        if (s1.charAt(l1 - 1) !== s2.charAt(l2 - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[l2]) + 1;
        }
        costs[l2 - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (l1 > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

const Chatbot = ({ activeModel = 'number', isCameraOn = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm SignBot, your AI assistant for Sign Language Recognition. I'm here to help you learn about our project, answer your questions, and guide you through the features. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: ['About Project', 'Get Started', 'Models', 'Features']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useVoiceInput, setUseVoiceInput] = useState(false);
  const [conversationContext, setConversationContext] = useState('general');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
        setUseVoiceInput(false);
      };

      recognition.onerror = () => {
        setUseVoiceInput(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    synthesisRef.current = window.speechSynthesis;
  }, []);

  const botResponses = {
    greeting: [
      "Hi! 👋 I'm here to help you learn about our Sign Language Recognition project. What would you like to know?",
      "Hello! Ask me about our project, how it works, or what you can do with it!",
      "Welcome! 🎉 I'm your AI assistant. Feel free to ask me anything about sign language recognition!",
    ],
    about: [
      "🤖 This is a Sign Language Recognition system that uses AI to recognize hand signs and gestures. We offer three models:\n\n1️⃣ **Number Model** - Recognizes numeric hand signs (0-9)\n2️⃣ **Alphabet Model** - Recognizes letter signs from ASL/ISL\n3️⃣ **Word Model** - Recognizes complete sign language words\n\nYou're currently viewing this project built by **Anti-Gravity**! 🚀",
      "Our project bridges the communication gap and makes sign language accessible through cutting-edge AI technology!"
    ],
    usecase: [
      "📱 **Real-World Applications:**\n\n🏫 **Education** - Help students learn sign language interactively\n♿ **Accessibility** - Enable communication for deaf/hard of hearing individuals\n🎮 **Entertainment** - Create interactive games and apps\n🔄 **Live Translation** - Real-time sign language to text/speech conversion\n📞 **Virtual Communication** - Video calls with sign language support\n🔬 **Research** - Analyze sign language patterns and variations",
      "The system can be deployed in hospitals, schools, offices, and workplaces to improve accessibility!"
    ],
    how: [
      "⚙️ **Technical Process:**\n\n📸 Camera captures your hand gestures in real-time\n🧠 AI analyzes 21 hand landmarks to detect hand positions\n🔍 Deep learning model recognizes the sign pattern\n✅ System displays and speaks the recognized sign\n📊 Predictions are recorded for your history\n\n**Accuracy Factors:**\n- Lighting conditions (well-lit = better results)\n- Hand visibility (both hands should be clear)\n- Hand positioning (match training examples)",
      "Our neural networks have been trained on 100+ examples per sign for best accuracy!"
    ],
    models: [
      "🎯 **Available Models (Choose by use case):**\n\n1️⃣ **Number Model** (Quick Math)\n   - Recognizes: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9\n   - Best for: Phone numbers, dates, prices\n   - Speed: ⚡⚡⚡ Very Fast\n\n2️⃣ **Alphabet Model** (Spell Words)\n   - Recognizes: A-Z + special signs\n   - Best for: Spelling out words letter by letter\n   - Speed: ⚡⚡ Fast\n\n3️⃣ **Word Model** (Full Meaning)\n   - Recognizes: 50+ complete words\n   - Signs: Bird, Brush, Call, Deer, Like, Ok, Scissors, etc.\n   - Speed: ⚡ Slightly Slower\n   - Best for: Natural conversations",
      "Pro Tip: Combine models! Use Word model for natural signs, Alphabet model for names!"
    ],
    features: [
      "✨ **Powerful Features:**\n\n🎥 **Live Video Feed** - See yourself with real-time predictions\n📹 **HD Camera Support** - Works with most webcams\n📊 **Prediction History** - Track all 50+ recognized signs\n🔊 **Text-to-Speech** - Hear predictions spoken aloud\n🎚️ **Model Switching** - Instantly switch between 3 models\n⚡ **Low Latency** - Process in milliseconds\n🌍 **Web-Based** - No installation needed\n🔒 **Privacy-First** - Runs locally on your machine",
      "All features are designed for accessibility and ease of use!"
    ],
    start: [
      "🚀 **Quick Start Guide:**\n\nSTEP 1️⃣ : Click 'Start Camera' button (bottom-left)\nSTEP 2️⃣ : Choose a model (Number, Alphabet, or Word)\nSTEP 3️⃣ : Face the camera and show a sign\nSTEP 4️⃣ : Wait for the prediction (1-2 seconds)\nSTEP 5️⃣ : You'll hear it spoken aloud!\nSTEP 6️⃣ : Try different signs and models\n\n💡 **Pro Tips:**\n- Good lighting = better accuracy\n- Keep hands clear and visible\n- Relax and use natural hand positions",
      "Your first sign should be a Number (0-9) for best results! Start simple and build up!"
    ],
    tech: [
      "💻 **Technology Stack (Advanced):**\n\n🐍 **Python Backend** (Flask server)\n⚛️ **React Frontend** (Interactive UI)\n🧠 **TensorFlow/Keras** (Neural Networks)\n📹 **OpenCV** (Image Processing)\n🤚 **MediaPipe** (Hand Detection - 21 landmarks)\n📡 **REST API** (Real-time communication)\n🎯 **WebRTC** (Video Streaming)\n🔐 **CORS** (Security)\n\nAll components optimized for real-time performance!",
      "The system achieves 30+ FPS on standard laptops!"
    ],
    accuracy: [
      "📊 **Accuracy Metrics:**\n\n✅ **Number Model**: ~95% accuracy\n✅ **Alphabet Model**: ~85% accuracy  \n✅ **Word Model**: ~90% accuracy\n\n**What Affects Accuracy?**\n- 🌞 Lighting (bright environments = +10%)\n- 📏 Hand distance from camera (optimal: 50cm)\n- 🖐️ Hand visibility (both hands clear = better)\n- 🎯 Hand positioning (match training style)\n- 🔄 Model training data quality\n\n**Improvement Tips:**\n1. Practice consistent hand shapes\n2. Use good lighting\n3. Maintain proper distance\n4. Try similar signs to see differences",
      "The more you practice, the better the system learns your signing style!"
    ],
    troubleshoot: [
      "🔧 **Troubleshooting Tips:**\n\n❌ **Camera not working?**\n   - Check browser permissions\n   - Ensure no other app is using camera\n   - Try refreshing the page\n\n❌ **Low accuracy?**\n   - Increase lighting (move to a brighter area)\n   - Move closer to camera (50-100cm)\n   - Check hand visibility\n\n❌ **Predictions are slow?**\n   - Close other browser tabs\n   - Check internet connection\n   - Try Number model (it's faster)",
      "Still having issues? Check your camera settings and browser permissions!"
    ],
    tips: [
      "💡 **Pro Tips for Better Recognition:**\n\n1️⃣ **Lighting is KEY** ☀️\n   - Sit near a window or lamp\n   - Avoid backlighting\n\n2️⃣ **Hand Positioning** 🖐️\n   - Keep hands in the center of frame\n   - Show complete hand shapes\n   - Avoid partially hidden hands\n\n3️⃣ **Camera Distance** 📱\n   - 50-120cm from camera is ideal\n   - Don't get too close\n\n4️⃣ **Practice** 🎯\n   - Repeat signs to train muscle memory\n   - Try variations to understand differences\n\n5️⃣ **Switch Models** 🔄\n   - Use Alphabet for spelling\n   - Use Words for natural signing\n   - Use Numbers for digits",
      "Remember: Consistency is key! Keep hand shapes consistent for best results!"
    ],
    system: [
      `📊 **System Status:**\n\n✅ **Current Model:** ${activeModel.toUpperCase()}\n${isCameraOn ? '✅ **Camera:** ON (Active)' : '⚪ **Camera:** OFF'}\n✅ **Browser:** Web-based (no installation)\n✅ **Privacy:** Local processing (data stays on device)\n✅ **Version:** 1.0 (AI-Powered)\n\nReady to recognize signs! 🚀`,
      `📡 **Real-Time Status:**\nModel: ${activeModel} | Camera: ${isCameraOn ? 'Active' : 'Inactive'}`
    ]
  };

  const findResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();

    const patterns = [
      { regex: /\b(hello|hi|hey|greetings|sup|yo)\b/, key: 'greeting', weight: 0.9 },
      { regex: /\b(what is|tell me about|about|project|this|system)\b/, key: 'about', weight: 0.95 },
      { regex: /\b(use case|usecase|application|where|purpose|benefit|help)\b/, key: 'usecase', weight: 0.92 },
      { regex: /\b(how|work|process|function|operate|explain)\b/, key: 'how', weight: 0.9 },
      { regex: /\b(model|models|available|choose|type|which)\b/, key: 'models', weight: 0.95 },
      { regex: /\b(feature|features|capability|can you|what can|ability)\b/, key: 'features', weight: 0.88 },
      { regex: /\b(start|begin|get started|how to use|guide|tutorial|first)\b/, key: 'start', weight: 0.93 },
      { regex: /\b(technology|tech|stack|python|react|tensorflow|backend|frontend)\b/, key: 'tech', weight: 0.91 },
      { regex: /\b(accu|precise|accurate|confident|error|mistake)\b/, key: 'accuracy', weight: 0.89 },
      { regex: /\b(problem|issue|trouble|help|error|bug|fix)\b/, key: 'troubleshoot', weight: 0.85 },
      { regex: /\b(tip|trick|hint|advice|better|improve|optimize)\b/, key: 'tips', weight: 0.88 },
      { regex: /\b(status|info|current|now|system|state)\b/, key: 'system', weight: 0.8 },
    ];

    let bestMatch = null;
    let bestWeight = 0;

    for (const pattern of patterns) {
      if (pattern.regex.test(message)) {
        if (pattern.weight > bestWeight) {
          bestWeight = pattern.weight;
          bestMatch = pattern.key;
        }
      }
    }

    if (bestMatch && botResponses[bestMatch]) {
      const responses = botResponses[bestMatch];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    let highestSimilarity = 0;
    let closestKey = null;

    for (const key in botResponses) {
      const similarity = calculateSimilarity(message, key);
      if (similarity > highestSimilarity && similarity > 0.4) {
        highestSimilarity = similarity;
        closestKey = key;
      }
    }

    if (closestKey) {
      const responses = botResponses[closestKey];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    return "Great question! 🤔 I can help with:\n\n📚 **Information:**\n• About the project\n• Use cases & applications\n• How it works\n• Available models\n\n🚀 **Getting Started:**\n• Quick start guide\n• Tips & tricks\n• Troubleshooting\n• System status\n\n💻 **Technical:**\n• Technology stack\n• Accuracy metrics\n\nWhat would you like to know?";
  };

  const speak = (text) => {
    if (synthesisRef.current) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      setUseVoiceInput(true);
      recognitionRef.current.start();
    } else {
      alert('Voice input not supported in your browser');
    }
  };

  const getContextualSuggestions = () => {
    if (isCameraOn && activeModel) {
      return [
        '🎥 How to improve accuracy?',
        `📝 About ${activeModel} model`,
        '💡 Pro tips',
        '🔄 Switch models'
      ];
    }
    return ['🚀 Get Started', '❓ About Project', '🎯 Models', '⚡ Features'];
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setTotalQuestions(prev => prev + 1);

    const newUserMessage = {
      id: messages.length + 1,
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = findResponse(userText);
      const newBotMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: getContextualSuggestions(),
      };
      setMessages(prev => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 700);
  };

  const handleQuickQuestion = (question) => {
    const cleanQuestion = question.replace(/[🎥📝💡🔄❓🚀⚡🎯📊]/g, '').trim();
    const newUserMessage = {
      id: messages.length + 1,
      text: cleanQuestion,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setTotalQuestions(prev => prev + 1);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = findResponse(cleanQuestion);
      const newBotMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: getContextualSuggestions(),
      };
      setMessages(prev => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 700);
  };

  const clearHistory = () => {
    setMessages([{
      id: 1,
      text: "Conversation cleared! 🧹 How can I help you now?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: getContextualSuggestions(),
    }]);
    setTotalQuestions(0);
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button
          className="chatbot-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open Chatbot"
        >
          💬
          <span className="notification-badge">{totalQuestions > 0 ? totalQuestions : ''}</span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-content">
              <h3>🤖 SignBot</h3>
              <span className="header-subtitle">Your AI Assistant</span>
            </div>
            <div className="header-actions">
              <button
                className="chatbot-icon-btn"
                onClick={clearHistory}
                title="Clear History"
              >
                🗑️
              </button>
              <button
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close Chatbot"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chatbot-message ${msg.sender}`}>
                <div className={`message-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
                {msg.suggestions && msg.sender === 'bot' && (
                  <div className="message-suggestions">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button 
                        key={idx}
                        className="suggestion-btn"
                        onClick={() => handleQuickQuestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="chatbot-message bot">
                <div className="message-bubble bot typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-questions">
            {getContextualSuggestions().map((suggestion, idx) => (
              <button 
                key={idx}
                onClick={() => handleQuickQuestion(suggestion)} 
                className="quick-btn"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="chatbot-input-form">
            <button
              type="button"
              className={`chatbot-voice-btn ${useVoiceInput ? 'active' : ''}`}
              onClick={startVoiceInput}
              title="Voice Input"
            >
              🎙️
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={useVoiceInput ? "Listening..." : "Ask me anything..."}
              disabled={useVoiceInput}
              className="chatbot-input"
            />
            <button type="submit" className="chatbot-send-btn">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
