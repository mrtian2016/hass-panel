import React, { useState, useRef } from 'react';
import Icon from '@mdi/react';
import { 
  mdiPower,
  mdiBrightness6,
  mdiThermometer,
  mdiCreationOutline
} from '@mdi/js';
import { Popup, List } from 'antd-mobile';
import { useEntity } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';

function LightControl({ lightEntity, onClose }) {
  const { t } = useLanguage();
  const entity = useEntity(lightEntity.entity_id);
  const isDraggingRef = useRef(false);
  const isDraggingTempRef = useRef(false);
  const sliderRef = useRef(null);
  const tempSliderRef = useRef(null);
  const [showEffectPopup, setShowEffectPopup] = useState(false);
  
  

  // const handleColorTempChange = (e) => {
  //   const value = e.target.value;
  //   const min = entity.attributes?.min_mireds || 175;
  //   const max = entity.attributes?.max_mireds || 333;
  //   const percent = ((value - min) / (max - min)) * 100;
  //   const container = e.target.parentElement;
  //   container.style.setProperty('--value-percent', `${percent}%`);
  //   entity.service.turn_on({ serviceData: { color_temp: parseInt(value) } });
  // };

  const handleEffectChange = (effect) => {
    entity.service.turn_on({ serviceData: { effect } });
    setShowEffectPopup(false);
  };

  const updateBrightnessFromY = (y, height, updateService = true) => {
    console.log('Updating brightness, y:', y, 'height:', height);
    const boundedY = Math.min(Math.max(0, y), height);
    const percent = ((height - boundedY) / height) * 100;
    const brightness = Math.round((percent / 100) * 255);
    
    console.log('Setting brightness to:', brightness, 'percent:', percent);
    sliderRef.current.style.setProperty('--value-percent', `${percent}%`);
    
    if (updateService) {
      entity.service.turn_on({ serviceData: { brightness } });
    }
    return brightness;
  };

  // 鼠标事件处理
  const handleSliderMouseDown = (e) => {
    const isTouchEvent = e.type === 'touchstart';
    console.log('Event type:', e.type, 'isTouchEvent:', isTouchEvent);
    
    const eventData = isTouchEvent ? e.touches[0] : e;
    console.log('Event data:', eventData);
    
    const target = isTouchEvent 
      ? document.elementFromPoint(eventData.clientX, eventData.clientY)
      : e.target;
    
    console.log('Target:', target);
    const isHandle = target?.classList.contains('slider-handle');
    console.log('Is handle:', isHandle);
    
    if (!isHandle) {
      const slider = sliderRef.current;
      const rect = slider.getBoundingClientRect();
      const y = eventData.clientY - rect.top;
      updateBrightnessFromY(y, rect.height);
      return;
    }
    
    if (isTouchEvent) {
      e.preventDefault();
    }
    
    console.log('Starting drag');
    isDraggingRef.current = true;
    sliderRef.current.classList.add('dragging');

    const handleMove = (moveEvent) => {
      console.log('Move event type:', moveEvent.type);
      if (!isDraggingRef.current || !sliderRef.current) {
        console.log('Move ignored - isDragging:', isDraggingRef.current);
        return;
      }
      
      const moveData = moveEvent.type === 'touchmove' 
        ? moveEvent.touches[0] 
        : moveEvent;
      
      const slider = sliderRef.current;
      const rect = slider.getBoundingClientRect();
      const y = moveData.clientY - rect.top;
      console.log('Moving to y:', y);
      updateBrightnessFromY(y, rect.height, false);
    };

    const handleEnd = (endEvent) => {
      console.log('End event type:', endEvent.type);
      if (isDraggingRef.current && sliderRef.current) {
        const endData = endEvent.type === 'touchend'
          ? endEvent.changedTouches[0]
          : endEvent;
        
        const slider = sliderRef.current;
        const rect = slider.getBoundingClientRect();
        const y = endData.clientY - rect.top;
        console.log('Final y:', y);
        updateBrightnessFromY(y, rect.height, true);
      }
      
      isDraggingRef.current = false;
      sliderRef.current?.classList.remove('dragging');
      
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    if (isTouchEvent) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
  };

  const updateColorTempFromY = (y, height, updateService = true) => {
    const boundedY = Math.min(Math.max(0, y), height);
    const percent = 100 - (boundedY / height) * 100;
    
    const minK = entity.attributes?.min_color_temp_kelvin || 2700;
    const maxK = entity.attributes?.max_color_temp_kelvin || 6500;
    const kelvin = Math.round(maxK - (percent * (maxK - minK)) / 100);
    
    tempSliderRef.current.style.setProperty('--value-percent', `${percent}%`);
    
    if (updateService) {
      entity.service.turn_on({ 
        serviceData: { 
          color_temp_kelvin: kelvin
        } 
      });
    }
    return kelvin;
  };

  // 色温控制的鼠标事件
  const handleTempMouseDown = (e) => {
    const isTouchEvent = e.type === 'touchstart';
    const eventData = isTouchEvent ? e.touches[0] : e;
    
    const target = isTouchEvent 
      ? document.elementFromPoint(eventData.clientX, eventData.clientY)
      : e.target;
    
    const isHandle = target?.classList.contains('slider-handle');
    
    if (!isHandle) {
      const slider = tempSliderRef.current;
      const rect = slider.getBoundingClientRect();
      const y = eventData.clientY - rect.top;
      updateColorTempFromY(y, rect.height);
      return;
    }
    
    if (isTouchEvent) {
      e.preventDefault();
    }
    
    isDraggingTempRef.current = true;
    tempSliderRef.current.classList.add('dragging');

    const handleMove = (moveEvent) => {
      if (!isDraggingTempRef.current || !tempSliderRef.current) return;
      
      const moveData = moveEvent.type === 'touchmove' 
        ? moveEvent.touches[0] 
        : moveEvent;
      
      const slider = tempSliderRef.current;
      const rect = slider.getBoundingClientRect();
      const y = moveData.clientY - rect.top;
      updateColorTempFromY(y, rect.height, false);
    };

    const handleEnd = (endEvent) => {
      if (isDraggingTempRef.current && tempSliderRef.current) {
        const endData = endEvent.type === 'touchend'
          ? endEvent.changedTouches[0]
          : endEvent;
        
        const slider = tempSliderRef.current;
        const rect = slider.getBoundingClientRect();
        const y = endData.clientY - rect.top;
        updateColorTempFromY(y, rect.height, true);
      }
      
      isDraggingTempRef.current = false;
      tempSliderRef.current?.classList.remove('dragging');
      
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    if (isTouchEvent) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
  };
  // console.log(entity.attributes)
  React.useEffect(() => {
    const brightnessPercent = ((entity.attributes?.brightness || 0) / 255) * 100;
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--value-percent', `${brightnessPercent}%`);
    }

    if (tempSliderRef.current && entity.attributes?.color_temp_kelvin) {
      const minK = entity.attributes?.min_color_temp_kelvin || 2700;
      const maxK = entity.attributes?.max_color_temp_kelvin || 6500;
      const percent = ((maxK - entity.attributes.color_temp_kelvin) / (maxK - minK)) * 100;
      tempSliderRef.current.style.setProperty('--value-percent', `${percent}%`);
    }
  }, [
    entity
  ]);

  return (
    <div className="light-control">
      <div className="sliders-row">
        <div className={`brightness-control ${entity.state !== 'on' ? 'disabled' : ''}`}>
          <div 
            ref={sliderRef}
            className="custom-slider"
            onMouseDown={entity.state === 'on' ? handleSliderMouseDown : undefined}
            onTouchStart={entity.state === 'on' ? handleSliderMouseDown : undefined}
            onTouchMove={(e) => e.preventDefault()}
          >
            <div className="slider-track">
              <div className="slider-fill"></div>
            </div>
            <div className="slider-handle"></div>
          </div>
          <div className="control-label">
            <Icon path={mdiBrightness6} size={12} />
            <span>{t('lightOverview.lightControl.brightness')}</span>
          </div>
        </div>

        <div className={`color-temp-control ${entity.state !== 'on' ? 'disabled' : ''}`}>
          <div 
            ref={tempSliderRef}
            className="custom-slider"
            onMouseDown={entity.state === 'on' ? handleTempMouseDown : undefined}
            onTouchStart={entity.state === 'on' ? handleTempMouseDown : undefined}
            onTouchMove={(e) => e.preventDefault()}
          >
            <div className="slider-track">
              <div className="slider-fill"></div>
            </div>
            <div className="slider-handle"></div>
          </div>
          <div className="control-label">
            <Icon path={mdiThermometer} size={12} />
            <span>{t('lightOverview.lightControl.colorTemp')}</span>
          </div>
        </div>
      </div>
    <div>
        {entity.attributes?.effect_list?.length > 0 && (
          <div className="presets-row">
            <div className="effects-control">
              <div 
                className="effect-trigger"
                onClick={() => setShowEffectPopup(true)}
              >
                <span className="effect-value">
                  {entity.attributes?.effect || t('lightOverview.lightControl.effect')}
                </span>
                <div className="control-label">
                  <Icon path={mdiCreationOutline} size={12} />
                  <span>{t('lightOverview.lightControl.effect')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="power-control">
          <button 
            className={`power-button ${entity.state === 'on' ? 'active' : ''}`}
            onClick={() => entity.service.toggle()}
          >
            <Icon path={mdiPower} size={14} />
          </button>
        </div>
      </div>
      <Popup
        visible={showEffectPopup}
        onMaskClick={() => setShowEffectPopup(false)}
        position='bottom'
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          minHeight: '40vh',
          maxHeight: '80vh',
          backgroundColor: 'var(--color-background) !important',
        }}
      >
        <List header={t('lightOverview.lightControl.selectEffect')}>
          <List.Item
            key="default"
            onClick={() => handleEffectChange('')}
            className={!entity.attributes?.effect ? 'active' : ''}
          >
            {t('lightOverview.lightControl.defaultEffect')}
          </List.Item>
          {entity.attributes?.effect_list?.map(effect => (
            <List.Item
              key={effect}
              onClick={() => handleEffectChange(effect)}
              className={entity.attributes?.effect === effect ? 'active' : ''}
            >
              {effect}
            </List.Item>
          ))}
        </List>
      </Popup>
    </div>
  );
}

export default LightControl; 