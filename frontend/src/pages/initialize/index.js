import React from 'react';
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

function InitializePage() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { t, toggleLanguage } = useLanguage();

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
                    message.error(data.message || t('initialize.initFailed'));
                }
            }
        } catch (error) {
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