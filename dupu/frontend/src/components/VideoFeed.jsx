import React from 'react';

const VideoFeed = ({ isCameraOn }) => {
    return (
        <div className="video-feed-container">
            {isCameraOn ? (
                <img
                    src="http://localhost:5000/video_feed"
                    alt="Sign Language Feed"
                    className="video-stream"
                />
            ) : (
                <div className="camera-off-placeholder">
                    Camera is Off
                </div>
            )}
            <div className="video-overlay" />
        </div>
    );
};

export default VideoFeed;
