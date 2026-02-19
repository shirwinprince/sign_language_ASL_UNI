import React from 'react';
import { History } from 'lucide-react';

const PredictionHistory = ({ history }) => {
    return (
        <div className="prediction-history">
            <div className="history-header">
                <div className="header-title">
                    <History size={20} />
                    <h3>Prediction History</h3>
                </div>
                <span className="history-count">{history.length} items</span>
            </div>

            <div className="history-list">
                {history.length === 0 ? (
                    <div className="empty-history">
                        No predictions yet...
                    </div>
                ) : (
                    history.slice().reverse().map((item, index) => (
                        <div key={index} className="history-item">
                            <div className="history-content">
                                <span className="prediction-text">{item.text}</span>
                                <div className="history-meta">
                                    <span className="model-badge">
                                        {item.model}
                                    </span>
                                    <span className="time-badge">{item.time}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PredictionHistory;
