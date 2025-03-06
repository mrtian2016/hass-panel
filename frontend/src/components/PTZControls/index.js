import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Slider, message } from 'antd';
import Icon from '@mdi/react';
import {
    mdiMagnifyPlus,
    mdiMagnifyMinus,
    mdiCogOutline,
    mdiBookmarkOutline
} from '@mdi/js';
import {  Icon as IconifyIcon } from '@iconify/react';
import { useLanguage } from '../../i18n/LanguageContext';
import { cameraApi } from '../../utils/api';
import './style.css';

function PTZControls({ entityId, stream_url }) {
    const { t } = useLanguage();
    const [distance, setDistance] = useState(0.5);
    const [speed, setSpeed] = useState(0.5);
    const moveMode = 'ContinuousMove';
    const [showSettings, setShowSettings] = useState(false);
    const [presets, setPresets] = useState([]);
    const [showPresets, setShowPresets] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    // Refs for tracking button press state
    const isPressing = useRef(false);
    const currentAction = useRef(null);
    const currentValue = useRef(null);

    // 获取预设位置
    const fetchPresets = useCallback(async () => {
        try {
            const presetList = await cameraApi.getPresets(entityId, stream_url);
            setPresets(presetList);
        } catch (error) {
            console.error('Failed to get presets:', error);
        }
    }, [entityId, stream_url]);

    // 组件加载时获取预设位置
    useEffect(() => {
        fetchPresets();
    }, [fetchPresets]);

    const executePTZCommand = useCallback(async (action, value) => {
        try {
            const ptzData = {
                entity_id: entityId,
                stream_url: stream_url,
                move_mode: action === 'stop' ? 'Stop' : moveMode,
                distance: distance,
                speed: speed
            };

            // 设置方向
            if (action === 'pan') {
                ptzData.pan = value;
            } else if (action === 'tilt') {
                ptzData.tilt = value;
            } else if (action === 'zoom') {
                ptzData.zoom = value;
            }

            console.log('PTZ控制数据:', ptzData);
            
            // 调用PTZ控制API
            await cameraApi.ptzControl(ptzData);
        } catch (error) {
            console.error('PTZ control error:', error);
            message.error(t('ptz.error'));
        }
    }, [entityId, stream_url, moveMode, distance, speed, t]);

    const handlePTZStart = (action, value) => {
        isPressing.current = true;
        currentAction.current = action;
        currentValue.current = value;

        // 开始移动
        executePTZCommand(action, value);
    };

    const handlePTZStop = () => {
        if (isPressing.current) {
            isPressing.current = false;

            // 停止移动
            executePTZCommand('stop');
        }
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
        setShowPresets(false);
    };

    const togglePresets = () => {
        setShowPresets(!showPresets);
        setShowSettings(false);
        if (!showPresets) {
            fetchPresets();
        }
    };

    const handleGotoPreset = async (presetToken) => {
        try {
            await cameraApi.gotoPreset(entityId, presetToken, speed, stream_url);
            message.success(t('ptz.presetMoved'));
        } catch (error) {
            console.error('Failed to goto preset:', error);
            message.error(t('ptz.presetMoveFailed'));
        }
    };

    const handleSetPreset = async () => {
        if (!newPresetName.trim()) {
            message.warning(t('ptz.presetNameRequired'));
            return;
        }

        try {
            await cameraApi.setPreset(entityId, newPresetName, stream_url);
            message.success(t('ptz.presetSaved'));
            setNewPresetName('');
            fetchPresets();
        } catch (error) {
            console.error('Failed to set preset:', error);
            message.error(t('ptz.presetSaveFailed'));
        }
    };

    const handleRemovePreset = async (presetToken) => {
        try {
            await cameraApi.removePreset(entityId, presetToken, stream_url);
            message.success(t('ptz.presetRemoved'));
            fetchPresets();
        } catch (error) {
            console.error('Failed to remove preset:', error);
            message.error(t('ptz.presetRemoveFailed'));
        }
    };

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (isPressing.current) {
                executePTZCommand('stop');
            }
        };
    }, [executePTZCommand]);

    return (
        <div className="ptz-controls">
            <div className="ptz-controls-header">
                <h3>{t('ptz.title')}</h3>
                <div className="ptz-header-buttons">
                    <Button
                        className="preset-button"
                        onClick={togglePresets}
                        type="text"
                        icon={<Icon path={mdiBookmarkOutline} size={14} />}
                        title={t('ptz.presets')}
                    />
                    <Button
                        className="settings-button"
                        onClick={toggleSettings}
                        type="text"
                        icon={<Icon path={mdiCogOutline} size={14} />}
                        title={t('ptz.settings')}
                    />
                </div>
            </div>

            <div className="ptz-buttons">
                <div className="ptz-direction-controls">
                    <div className="ptz-circle">
                        <Button
                            className="ptz-button ptz-up ptz-sector"
                            onMouseDown={() => handlePTZStart('tilt', 'UP')}
                            onMouseUp={handlePTZStop}
                            onMouseLeave={handlePTZStop}
                            onTouchStart={() => handlePTZStart('tilt', 'UP')}
                            onTouchEnd={handlePTZStop}
                            title={t('ptz.tilt.up')}
                        >
                            <div className="ptz-icon-container">
                                <IconifyIcon icon="mdi:keyboard-arrow-up" width={48} color="white" />
                            </div>
                        </Button>
                       
                        <Button
                            className="ptz-button ptz-left ptz-sector"
                            onMouseDown={() => handlePTZStart('pan', 'LEFT')}
                            onMouseUp={handlePTZStop}
                            onMouseLeave={handlePTZStop}
                            onTouchStart={() => handlePTZStart('pan', 'LEFT')}
                            onTouchEnd={handlePTZStop}
                            title={t('ptz.pan.left')}
                        >
                            <div className="ptz-icon-container">
                            <IconifyIcon icon="mdi:keyboard-arrow-left" width={48} color="white" />
                            </div>
                        </Button>
                        <Button
                            className="ptz-button ptz-right ptz-sector"
                            onMouseDown={() => handlePTZStart('pan', 'RIGHT')}
                            onMouseUp={handlePTZStop}
                            onMouseLeave={handlePTZStop}
                            onTouchStart={() => handlePTZStart('pan', 'RIGHT')}
                            onTouchEnd={handlePTZStop}
                            title={t('ptz.pan.right')}
                        >
                            <div className="ptz-icon-container">
                                <IconifyIcon icon="mdi:keyboard-arrow-right" width={48} color="white" />
                            </div>
                        </Button>
                      
                        <Button
                            className="ptz-button ptz-down ptz-sector"
                            onMouseDown={() => handlePTZStart('tilt', 'DOWN')}
                            onMouseUp={handlePTZStop}
                            onMouseLeave={handlePTZStop}
                            onTouchStart={() => handlePTZStart('tilt', 'DOWN')}
                            onTouchEnd={handlePTZStop}
                            title={t('ptz.tilt.down')}
                        >
                            <div className="ptz-icon-container">
                                <IconifyIcon icon="mdi:keyboard-arrow-down" width={48} color="white" />
                            </div>
                        </Button>
                        
                        <div className="ptz-center">
                        </div>
                    </div>
                </div>

                <div className="ptz-zoom-controls">
                    <Button
                        className="ptz-button"
                        onMouseDown={() => handlePTZStart('zoom', 'ZOOM_IN')}
                        onMouseUp={handlePTZStop}
                        onMouseLeave={handlePTZStop}
                        onTouchStart={() => handlePTZStart('zoom', 'ZOOM_IN')}
                        onTouchEnd={handlePTZStop}
                        title={t('ptz.zoom.in')}
                        icon={<Icon path={mdiMagnifyPlus} size={21} />}
                    />
                    <Button
                        className="ptz-button"
                        onMouseDown={() => handlePTZStart('zoom', 'ZOOM_OUT')}
                        onMouseUp={handlePTZStop}
                        onMouseLeave={handlePTZStop}
                        onTouchStart={() => handlePTZStart('zoom', 'ZOOM_OUT')}
                        onTouchEnd={handlePTZStop}
                        title={t('ptz.zoom.out')}
                        icon={<Icon path={mdiMagnifyMinus} size={21} />}
                    />
                </div>
            </div>

            {showSettings && (
                <div className="ptz-settings">
                   
                    <div className="ptz-setting">
                        <label>{t('ptz.distance')}: {distance}</label>
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={distance}
                            onChange={setDistance}
                        />
                    </div>
                    <div className="ptz-setting">
                        <label>{t('ptz.speed')}: {speed}</label>
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={speed}
                            onChange={setSpeed}
                        />
                    </div>
                </div>
            )}

            {showPresets && (
                <div className="ptz-presets">
                    <div className="ptz-preset-list">
                        {presets.length > 0 ? (
                            presets.map(preset => (
                                <div key={preset.token} className="ptz-preset-item">
                                    <span>{preset.name}</span>
                                    <div className="ptz-preset-actions">
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => handleGotoPreset(preset.token)}
                                            title={t('ptz.gotoPreset')}
                                        >
                                            {t('ptz.goto')}
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="small"
                                            danger
                                            onClick={() => handleRemovePreset(preset.token)}
                                            title={t('ptz.removePreset')}
                                        >
                                            {t('ptz.remove')}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="ptz-no-presets">{t('ptz.noPresets')}</div>
                        )}
                    </div>
                    <div className="ptz-add-preset">
                        <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder={t('ptz.presetName')}
                        />
                        <Button type="primary" onClick={handleSetPreset}>{t('ptz.savePreset')}</Button>
                    </div>
                </div>
            )}
        </div>
    );
}


export default PTZControls; 