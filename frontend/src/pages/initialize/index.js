import React, {  useEffect, useCallback } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import Icon from '@mdi/react';
import { 
    mdiGithub, 
    mdiGoogleTranslate, 
    mdiWeatherNight,
    mdiWhiteBalanceSunny,
    mdiHomeAutomation
} from '@mdi/js';
import './style.css';
import { hashPassword } from '../../utils/helper';
import { systemApi } from '../../utils/api';
function InitializePage() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { t, toggleLanguage } = useLanguage();

    const checkAuth = useCallback(async () => {
        console.log('checkAuth');
        if (!localStorage.getItem('hass_panel_token')) {
            console.log('checkAuth 1');
            navigate('/login');
            return;
        }

        try {
            const data = await systemApi.getHassConfig();
            console.log('checkAuth 2', data);
            if (data.code === 200) {
                navigate('/');
                localStorage.setItem('hass_url', data.data.url);
            } else if (data.code === 401) {
                localStorage.removeItem('hass_panel_token');
                navigate('/login');
            }
        } catch (error) {
            console.log('checkAuth 3');
            console.error('获取 HASS 配置失败:', error);
        }
    }, [navigate]);

    const checkInitStatus = useCallback(async () => {
        try {
          const data = await systemApi.checkInitStatus();
          
          if (data.code === 200) {
            if (!data.data.is_initialized) {
              navigate('/initialize');
              return;
            }
            // 如果已初始化，检查认证状态
            checkAuth();
          } else {
            message.error('检查系统状态失败');
          }
        } catch (error) {
          console.error('检查系统状态失败:', error);
          navigate('/initialize');
        }
    }, [navigate, checkAuth]);
    
    useEffect(() => {
        checkInitStatus();
    }, [checkInitStatus, navigate]);

    const getHassUrl = () => {
        const currentUrl = window.location.href;
        if (currentUrl.includes('ingress')) {
            const matches = currentUrl.match(/https?:\/\/[^:/]+(?::\d+)?/);
            return matches ? matches[0] : '';
        }
        return '';
    };

    React.useEffect(() => {
        const hassUrl = getHassUrl();
        if (hassUrl) {
            form.setFieldValue('hass_url', hassUrl);
        }
    }, [form]);

    const onFinish = async (values) => {
        try {
            const requestData = {
                username: values.username,
                password: hashPassword(values.password),
                hass_url: values.hass_url,
                hass_token: values.hass_token,
            }
            const response = await fetch('./api/common/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                message.success(t('initialize.initSuccess'));
                navigate('/login');
            } else {
                const data = await response.json();
                if (data.code === 401) {
                    message.error(t('initialize.invalidHassUrl'));
                } else if (data.code === 402) {
                    message.error(t('initialize.invalidHassToken'));
                } else {
                    console.log(data);
                    message.error(data.message || t('initialize.initFailed'));
                }
            }
        } catch (error) {
            console.log(error);
            message.error(t('initialize.systemError'));
        }
    };

    return (
        <div className={`initialize-container ${theme}`}>
            <div className="initialize-box">
                <div className="initialize-header">
                    <Icon
                        path={mdiHomeAutomation}
                        size={2}
                        className="initialize-logo"
                        color="var(--color-primary)"
                    />
                    <h2>{t('title')}</h2>
                </div>
                <Form
                    form={form}
                    name="initialize"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark="optional"
                >
                    <Form.Item
                        label={t('initialize.adminUsername')}
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: t('initialize.usernameRequired'),
                            },
                        ]}
                    >
                        <Input placeholder={t('initialize.usernamePlaceholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('initialize.adminPassword')}
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: t('initialize.passwordRequired'),
                            },
                            {
                                min: 6,
                                message: t('initialize.passwordMinLength'),
                            },
                        ]}
                    >
                        <Input.Password placeholder={t('initialize.passwordPlaceholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('initialize.confirmPassword')}
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            {
                                required: true,
                                message: t('initialize.confirmPasswordRequired'),
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error(t('initialize.passwordMismatch')));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder={t('initialize.confirmPasswordPlaceholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('initialize.hassUrl')}
                        name="hass_url"
                        rules={[
                            {
                                required: true,
                                message: t('initialize.hassUrlRequired'),
                            },
                            {
                                type: 'url',
                                message: t('initialize.invalidUrl'),
                            },
                        ]}
                    >
                        <Input placeholder={t('initialize.hassUrlPlaceholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('initialize.hassToken')}
                        name="hass_token"

                    >
                        <Input.Password placeholder={t('initialize.hassTokenPlaceholder')} />
                        <Button size="small" type="link" onClick={() => window.open('https://community.home-assistant.io/t/how-to-get-long-lived-access-token/162159', '_blank')}>{t('initialize.hassTokenHelp')}</Button>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {t('initialize.submit')}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="initialize-footer">
                    <button
                        className="icon-button"
                        onClick={toggleTheme}
                        title={t('theme.' + (theme === 'light' ? 'light' : 'dark'))}
                    >
                        <Icon
                            path={theme === 'light' ? mdiWeatherNight : mdiWhiteBalanceSunny}
                            size={1}
                            color="var(--color-text-primary)"
                        />
                    </button>
                    <button
                        className="icon-button"
                        onClick={toggleLanguage}
                        title={t('language.toggle')}
                    >
                        <Icon
                            path={mdiGoogleTranslate}
                            size={1}
                            color="var(--color-text-primary)"
                        />
                    </button>
                    <button
                        className="icon-button"
                        onClick={() => window.open('https://github.com/mrtian2016/hass-panel', '_blank')}
                        title="GitHub"
                    >
                        <Icon
                            path={mdiGithub}
                            size={1}
                            color="var(--color-text-primary)"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InitializePage;