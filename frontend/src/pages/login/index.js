import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
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

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t, toggleLanguage } = useLanguage();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const requestData = {
        username: values.username,
        password: hashPassword(values.password),
      }
        
      const response = await fetch('./api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData).toString(),
      });
      if (response.status !== 200) {
        message.error(t('login.error'));
        return;
      }
      const data = await response.json();
  
      localStorage.setItem('hass_panel_token', JSON.stringify({
        access_token: data.access_token,
      }));
      message.success(t('login.success'));
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.log(error);
      message.error(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${theme}`}>
      <div className="login-box">
        <div className="login-header">
          <Icon
            path={mdiHomeAutomation}
            size={2}
            className="login-logo"
            color="var(--color-primary)"
          />
          <h2>{t('title')}</h2>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label={t('login.username')}
            name="username"
            rules={[{ required: true, message: t('login.usernameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t('login.password')}
            name="password"
            rules={[{ required: true, message: t('login.passwordRequired') }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t('login.submit')}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
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

export default Login; 