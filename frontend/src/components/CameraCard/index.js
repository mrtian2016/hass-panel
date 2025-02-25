import React, { useState, useEffect } from 'react';
import { SpinLoading } from 'antd-mobile';
import ReactPlayer from 'react-player';
import Modal from '../Modal';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';

function CameraCard({ camera, streamUrl, name, playUrl }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useHls, setUseHls] = useState(false);
  const { t } = useLanguage();
  const webrtc_play_url = playUrl || streamUrl;

  useEffect(() => {
    if (webrtc_play_url) {
      fetch(webrtc_play_url)
        .then(res => res.text())
        .then(data => {
          if (data.includes('Hass Panel')) {
            setUseHls(true);
          }
          if (data.includes('502 Bad Gateway')) {
            setUseHls(true);
          }
        })
        .catch(() => {
          setUseHls(true);
        });
    }
  }, [webrtc_play_url]);

  if (!camera) return null;

  const previewUrl = camera?.poster?.url || camera?.mjpeg?.url;
  const hlsUrl = camera?.stream?.url;

  const handleClick = () => {
    setIsModalVisible(true);
    setIsLoading(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setIsLoading(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleVideoReady = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
  };

  return (
    <div className="camera-card">
      <div className="camera-preview" onClick={handleClick}>
        {!imageLoaded && (
          <div className="camera-skeleton">
            <div className="skeleton-image pulse" />
            <div className="skeleton-title pulse" />
          </div>
        )}
        <img
          src={previewUrl}
          alt={name || camera.attributes?.friendly_name}
          className={`camera-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
        />
        <div className="camera-name">
          {name || camera.attributes?.friendly_name}
        </div>
      </div>

      <Modal
        visible={isModalVisible}
        onClose={handleClose}
        title={name || camera.attributes?.friendly_name}
      >
        <div className="camera-stream">
          {isLoading && (
            <div className="loading-container">
              <SpinLoading color='white' />
              <span className="loading-text">{t('camera.loading')}</span>
            </div>
          )}
          {(!webrtc_play_url && !hlsUrl) && (
            <div className="error-container">
              <span className="error-text">{t('camera.loadError')}</span>
            </div>
          )}
          {!useHls && webrtc_play_url && <iframe
            src={`${webrtc_play_url}${webrtc_play_url.includes('?') ? '&' : '?'}scrolling=no`}
            title={name || camera.attributes?.friendly_name}
            frameBorder="0"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
            scrolling="no"
            className={'stream-iframe'}
            onLoad={(e) => {
              handleVideoReady();
              try {
                e.target.contentWindow.postMessage({ type: 'disable-scroll' }, '*');
              } catch (err) {
                console.log('Failed to send message to iframe');
              }
            }}
            onError={handleVideoError}
          />}
          {useHls && hlsUrl && (
            <div className="player-wrapper">
              <ReactPlayer
                url={hlsUrl}
                className="react-player"
                width="100%"
                height="100%"
                playing
                controls
                playsinline
                config={{
                  file: {
                    forceHLS: true,
                    attributes: {
                      crossOrigin: "anonymous"
                    }
                  }
                }}
                onReady={handleVideoReady}
                onError={handleVideoError}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default CameraCard; 