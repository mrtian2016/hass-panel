import { useLanguage } from '../../i18n/LanguageContext';
import { configApi,systemApi } from '../../utils/api';
import { Switch, message } from 'antd';
import { useRef, useEffect, useState } from 'react';
import './style.css';
function GlobalConfig({ setShowGlobalConfig }) {
    // 加载全局配置
    useEffect(() => {
        const loadGlobalConfig = async () => {
            try {
                const response = await configApi.getConfig();
                const config = response.data;
                if (config.globalConfig) {
                    setGlobalConfig(config.globalConfig);
                    applyGlobalConfig(config.globalConfig);
                }
            } catch (error) {
                console.error('加载全局配置失败:', error);
            }
        };
        loadGlobalConfig();
    }, []);

    // 应用全局配置
    const applyGlobalConfig = (config) => {
        if (config.backgroundColor) {
            document.body.style.backgroundColor = config.backgroundColor;
        } else {
            document.body.style.backgroundColor = '';
        }
        if (config.backgroundImage) {
            document.body.style.backgroundImage = `url(${config.backgroundImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        } else {
            document.body.style.backgroundImage = 'none';
        }
    };

    const [globalConfig, setGlobalConfig] = useState({
        backgroundColor: '',
        backgroundImage: '',
        betaVersion: false
    });

    // 保存全局配置
    const handleSaveGlobalConfig = async () => {
        try {
            await configApi.setGlobalConfig(globalConfig);
            setShowGlobalConfig(false);
        } catch (error) {
            console.error('保存全局配置失败:', error);
            message.error(t('config.saveFailed'));
        }
    };

    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    return (
        <>
            <div className="global-config-modal-overlay" onClick={() => setShowGlobalConfig(false)} />
            <div className="global-config-modal">
                <h3>{t('config.globalConfig')}</h3>
                <div className="global-config-form">
                    
                    <div className="global-config-form-item">
                        <label>{t('config.backgroundImage')}</label>
                        <div className="image-input-group">
                            <input
                                type="text"
                                value={globalConfig.backgroundImage}
                                onChange={(e) => setGlobalConfig({
                                    ...globalConfig,
                                    backgroundImage: e.target.value
                                })}
                                placeholder={t('config.backgroundImagePlaceholder')}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const filePath = await configApi.uploadBackground(file);
                                        setGlobalConfig({
                                            ...globalConfig,
                                            backgroundImage: filePath
                                        });
                                    }
                                }}
                                ref={fileInputRef}
                            />
                            <button
                                className="upload-button"
                                onClick={() => fileInputRef.current.click()}
                            >
                                {t('fields.upload')}
                            </button>
                            <button
                                className="reset-button"
                                onClick={() => setGlobalConfig({
                                    ...globalConfig,
                                    backgroundImage: ''
                                })}
                            >
                                {t('config.reset')}
                            </button>
                        </div>
                        <div className="hint">{t('config.backgroundImageHint')}</div>
                    </div>
                    <div className="global-config-form-item">
                        <label>{t('config.betaVersion')}</label>
                        <div className="switch-group">
                            <Switch
                                checked={globalConfig.betaVersion}
                                onChange={(checked) => setGlobalConfig({
                                    ...globalConfig,
                                    betaVersion: checked
                                })}
                            />
                        </div>
                        <div className="hint">{t('config.betaVersionHint')}</div>
                    </div>
                   
                    <div className="global-config-actions">
                        <button
                            className="reset-all"
                            onClick={() => {
                                setGlobalConfig({
                                    backgroundColor: '',
                                    backgroundImage: '',
                                    betaVersion: false
                                });
                            }}
                        >
                            {t('config.resetAll')}
                        </button>
                        <button
                            className="reinitialize"
                            onClick={async () => {
                                const result = await systemApi.reinitialize();
                                if (result.code === 200) {
                                    message.success(t('config.reinitializeSuccess'));
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 1000);
                                } else {
                                    message.error(t('config.reinitializeFailed'));
                                }
                            }}
                        >
                            {t('config.reinitialize')}
                        </button>
                        <button className="cancel" onClick={() => setShowGlobalConfig(false)}>
                            {t('config.cancel')}
                        </button>
                        <button className="save" onClick={handleSaveGlobalConfig}>
                            {t('config.save')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GlobalConfig;
