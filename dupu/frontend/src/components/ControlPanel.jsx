import React from 'react';
import { Camera, CameraOff, Type, Hash, Keyboard } from 'lucide-react';

const ControlPanel = ({ activeModel, setModel, isCameraOn, toggleCamera }) => {
    const models = [
        { id: 'number', label: 'Number', icon: Hash },
        { id: 'alphabet', label: 'Alphabet', icon: Type },
        { id: 'word', label: 'Word', icon: Keyboard },
    ];

    return (
        <div className="control-panel">
            <div className="control-section">
                <h3 className="section-title">Select Model</h3>
                <div className="model-grid">
                    {models.map((model) => {
                        const Icon = model.icon;
                        return (
                            <button
                                key={model.id}
                                onClick={() => setModel(model.id)}
                                className={`model-btn ${activeModel === model.id ? 'active' : ''}`}
                            >
                                <Icon size={24} />
                                <span className="btn-label">{model.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="control-section">
                <h3 className="section-title">Camera Control</h3>
                <button
                    onClick={toggleCamera}
                    className={`camera-btn ${isCameraOn ? 'stop' : 'start'}`}
                >
                    {isCameraOn ? (
                        <>
                            <CameraOff size={24} /> Stop Camera
                        </>
                    ) : (
                        <>
                            <Camera size={24} /> Start Camera
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;
