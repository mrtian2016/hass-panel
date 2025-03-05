import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Modal from '../Modal';
import { useLanguage } from '../../i18n/LanguageContext';
import PTZControls from '../PTZControls';
import './style.css';

function CameraCard({ camera, streamUrl, name, playUrl,supports_ptz }) {


  const entityId = camera.entity_id;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useHls, setUseHls] = useState(false);
  const { t } = useLanguage();
  const webrtc_play_url =  playUrl || streamUrl;
  
  // 检查摄像头是否支持PTZ控制
  const supportsPTZ = supports_ptz === true;

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
              <Spin />
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
          
          
          {/* 只有当摄像头支持PTZ控制时才显示控制按钮 */}
          {!useHls && entityId && entityId.startsWith('camera.') && supportsPTZ && (
            <PTZControls entityId={entityId} stream_url={streamUrl}/>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default CameraCard; 