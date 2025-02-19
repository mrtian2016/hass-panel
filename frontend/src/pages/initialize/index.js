import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import './style.css';
import { hashPassword } from '../../utils/helper';

function InitializePage() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

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
                message.success('系统初始化成功！');
                navigate('/login');
            } else {
                const data = await response.json();
                if (data.code === 401) {
                    message.error('Home Assistant URL 无效');
                } else if (data.code === 402) {
                    message.error('Home Assistant Token 无效');
                } else {
                    message.error(data.message || '初始化失败，请重试');
                }
            }
        } catch (error) {
            message.error('系统错误，请重试');
        }
    };

    return (
        <div className={`initialize-container ${isDarkMode ? 'dark' : 'light'}`}>
            <div className="initialize-form-container">
                <h1>HassPanel - 初始化</h1>
                <Form
                    form={form}
                    name="initialize"
                    onFinish={onFinish}
                    layout="vertical"
                    requiredMark="optional"
                >
                    <Form.Item
                        label="管理员用户名"
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: '请输入管理员用户名',
                            },
                        ]}
                    >
                        <Input placeholder="请输入管理员用户名" />
                    </Form.Item>

                    <Form.Item
                        label="管理员密码"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: '请输入管理员密码',
                            },
                            {
                                min: 6,
                                message: '密码长度至少6位',
                            },
                        ]}
                    >
                        <Input.Password placeholder="请输入管理员密码" />
                    </Form.Item>

                    <Form.Item
                        label="确认密码"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            {
                                required: true,
                                message: '请确认管理员密码',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不一致'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="请再次输入管理员密码" />
                    </Form.Item>

                    <Form.Item
                        label="HomeAssistant地址"
                        name="hass_url"
                        rules={[
                            {
                                required: true,
                                message: '请输入HomeAssistant访问地址',
                            },
                            {
                                type: 'url',
                                message: '请输入有效的URL地址',
                            },
                        ]}
                    >
                        <Input placeholder="例如: http://homeassistant.local:8123" />
                    </Form.Item>

                    <Form.Item
                        label="HomeAssistant Token"
                        name="hass_token"
                    >
                        <Input.Password placeholder="请输入HomeAssistant长期访问令牌 (可选)" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            初始化系统
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}

export default InitializePage;