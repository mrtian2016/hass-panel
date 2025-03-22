import React, { useState } from 'react';
import { mdiWashingMachine, mdiPower, mdiMenuDown } from '@mdi/js';
import {  notification } from 'antd';
import { Popup, List } from 'antd-mobile';
import BaseCard from '../BaseCard';
import Icon from '@mdi/react';
import './style.css';
import { useEntity } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import WashingAnimation from './WashingAnimation';

function WashingMachineCard({ config }) {
  const { t } = useLanguage();
  const debugMode = localStorage.getItem('debugMode') === 'true';
  
  // State for popup visibility
  const [showModePopup, setShowModePopup] = useState(false);
  
  // Extract entities from the card configuration
  const switchEntity = useEntity(config?.config?.switchEntity || '', {returnNullIfNotFound: true});
  const startEntity = useEntity(config?.config?.startEntity || '', {returnNullIfNotFound: true});
  const stopEntity = useEntity(config?.config?.stopEntity || '', {returnNullIfNotFound: true});
  const modeEntity = useEntity(config?.config?.modeEntity || '', {returnNullIfNotFound: true});
  const statusEntity = useEntity(config?.config?.statusEntity || '', {returnNullIfNotFound: true});
  const cycleEntity = useEntity(config?.config?.cycleEntity || '', {returnNullIfNotFound: true});
  const remainingTimeEntity = useEntity(config?.config?.remainingTimeEntity || '', {returnNullIfNotFound: true});
  console.log(switchEntity)
  
  // Determine if the washing machine is running
  const isWashingRunning =  switchEntity?.state === 'on' && statusEntity?.state === '启动';
  const isPowerOn =  switchEntity?.state === 'on';
  
  // Check if required entities are loaded
  if (
    (config?.config?.switchEntity && !switchEntity)
  ) {
    if (debugMode) {
      notification.error({
        message: t('washingMachine.loadError'),
        description: t('washingMachine.loadErrorDesc') + ' ' + config?.config?.switchEntity,
        placement: 'topRight',
        duration: 3,
        key: 'WashingMachineCard',
      });
    }
  }
  
  // Handle power button click
  const handlePowerToggle = () => {
    if (switchEntity) {
      switchEntity.service.toggle();
    }
  };
  
  // Handle start/stop button
  const handleStartStop = () => {
    if (isWashingRunning) {
      if (stopEntity) {
        stopEntity.service.press();
      }
    } else {
      if (startEntity) {
        startEntity.service.press();
      }
    }
  };
  
  // Handle mode selection
  const handleModeChange = (value) => {
    if (modeEntity) {
      modeEntity.service.select_option({serviceData:{ option: value }});
      setShowModePopup(false);
    }
  };

  return (
    <BaseCard
      title={config.title || t('cardTitles.washingMachine')}
      titleVisible={config.titleVisible}
      icon={mdiWashingMachine}
      className="washing-machine-card"
      headerRight={
        <button 
          className={`power-button ${!isPowerOn ? 'off' : ''}`} 
          onClick={handlePowerToggle}
        >
          <Icon path={mdiPower} size={14} />
        </button>
      }
    >
      <div className="washing-machine-content">
        {/* Status Section - Single Row */}
        {(switchEntity || cycleEntity || remainingTimeEntity) && (
          <div className="status-row">
            {switchEntity && (
              <div className="status-item">
                <span className="status-label">{t('washingMachine.status.title')}</span>
                <span className={`status-value ${switchEntity.state === 'on' ? 'active' : ''}`}>
                  {switchEntity.state === 'on' ? 
                    t('washingMachine.status.on') : 
                    t('washingMachine.status.off')}
                </span>
              </div>
            )}
            
            {remainingTimeEntity && (
              <div className="status-item">
                <span className="status-label">{t('washingMachine.remainingTime')}</span>
                <span className="status-value">{remainingTimeEntity.state || '0'} min</span>
              </div>
            )}
          </div>
        )}
        
        {/* Washing Animation - Central Focus */}
        <WashingAnimation isRunning={isWashingRunning} />
        
        {/* Controls Row - Bottom */}
        <div className="controls-row">
          {/* Mode Selection */}
          {modeEntity && (
            <div className="control-button">
              <button
                className="wash-control-btn mode-btn"
                onClick={() => setShowModePopup(true)}
                disabled={!isPowerOn}
              >
                {modeEntity.state || t('washingMachine.mode')}
                  <Icon path={mdiMenuDown} size={14} />
              </button>
              
              <Popup
                visible={showModePopup}
                onMaskClick={() => setShowModePopup(false)}
                bodyStyle={{ height: '40vh',backgroundColor: 'var(--color-background) !important', }}
                className="mode-popup"
              >
                <div className="popup-header">
                  <h3>{t('washingMachine.mode')}</h3>
                </div>
                <List>
                  {modeEntity.attributes?.options?.map(option => (
                    <List.Item
                      key={option}
                      onClick={() => handleModeChange(option)}
                      className={modeEntity.state === option ? 'active-mode' : ''}
                    >
                      {option}
                    </List.Item>
                  ))}
                </List>
              </Popup>
            </div>
          )}
          
          {/* Start/Stop Button */}
          {(startEntity || stopEntity) && (
            <div className="control-button">
              <button 
                className={`wash-control-btn ${isWashingRunning ? 'stop-btn' : 'start-btn'}`}
                onClick={handleStartStop}
                disabled={!isPowerOn}
              >
                {isWashingRunning 
                  ? t('washingMachine.pauseWash') 
                  : t('washingMachine.startWash')}
              </button>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
}

export default WashingMachineCard; 