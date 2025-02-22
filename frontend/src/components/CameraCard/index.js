import React, { useState } from 'react';
import { SpinLoading } from 'antd-mobile';
import Modal from '../Modal';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';

function CameraCard({ camera, streamUrl, name, playUrl }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { t } = useLanguage();
  const hassUrl = localStorage.getItem('hass_url');
  const webrtc_play_url = playUrl || streamUrl;


  if (!camera) return null;
  console.log(camera);

  const previewUrl = hassUrl + camera?.attributes?.entity_picture ;



  const handleClick = () => {
    setIsModalVisible(true);
    setIsLoading(true);
    setHasError(false);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setIsLoading(true);
    setHasError(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
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
          onError={() => setHasError(true)}
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
          {(hasError || !webrtc_play_url) && (
            <div className="error-container">
              <span className="error-text">{t('camera.loadError')}</span>
            </div>
          )}
          {webrtc_play_url && <iframe
            src={`${webrtc_play_url}${webrtc_play_url.includes('?') ? '&' : '?'}scrolling=no`}
            title={name || camera.attributes?.friendly_name}
            frameBorder="0"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
            scrolling="no"
            className={`stream-iframe ${isLoading ? 'loading' : ''}`}
            onLoad={(e) => {
              handleIframeLoad();
              // 尝试向 iframe 内部发送消息来禁用滚动
              try {
                e.target.contentWindow.postMessage({ type: 'disable-scroll' }, '*');
              } catch (err) {
                console.log('Failed to send message to iframe');
              }
            }}
            onError={handleIframeError}
          />}
        </div>
      </Modal>
    </div>
  );
}

export default CameraCard; 