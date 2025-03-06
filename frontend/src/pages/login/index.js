import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Checkbox } from 'antd';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import Icon from '@mdi/react';
import { 
  mdiGithub, 
  mdiGoogleTranslate, 
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
  mdiHomeAutomation,
  mdiMonitor
} from '@mdi/js';
import './style.css';
import { hashPassword } from '../../utils/helper';

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, setSpecificTheme } = useTheme();
  const { t, toggleLanguage } = useLanguage();
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(false);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return mdiWhiteBalanceSunny;
      case 'dark':
        return mdiWeatherNight;
      case 'system':
        return mdiMonitor;
      default:
        return mdiWhiteBalanceSunny;
    }
  };

  const handleClickOutside = useCallback((event) => {
    if (themeMenuVisible && !event.target.closest('.theme-menu-container')) {
      setThemeMenuVisible(false);
    }
  }, [themeMenuVisible]);

  useEffect(() => {
    // 检查本地存储中是否有保存的凭据
    const savedCredentials = localStorage.getItem('hass_panel_credentials');
    if (savedCredentials) {
      try {
        const { username, password, remember } = JSON.parse(savedCredentials);
        if (remember) {
          form.setFieldsValue({ username, password, remember });
          setRememberMe(remember);
        }
      } catch (error) {
        console.error('Failed to parse saved credentials', error);
      }
    }
    
    // 检查是否有单独保存的记住密码选项
    const rememberOption = localStorage.getItem('hass_panel_remember_option');
    if (rememberOption) {
      try {
        const remember = JSON.parse(rememberOption);
        setRememberMe(remember);
        form.setFieldsValue({ remember });
      } catch (error) {
        console.error('Failed to parse remember option', error);
      }
    }
  }, [form]);

  useEffect(() => {
    if (themeMenuVisible) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [themeMenuVisible, handleClickOutside]);

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
      
      // 保存记住密码选项到本地存储
      localStorage.setItem('hass_panel_remember_option', JSON.stringify(values.remember));
      
      // 根据记住我选项决定是否保存凭据
      if (values.remember) {
        localStorage.setItem('hass_panel_credentials', JSON.stringify({
          username: values.username,
          password: values.password,
          remember: true
        }));
      } else {
        // 如果不记住，则清除之前可能存在的凭据
        localStorage.removeItem('hass_panel_credentials');
      }
      
      message.success(t('login.success'));
      navigate('/');
    } catch (error) {
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
            size={28}
            className="login-logo"
            color="var(--color-primary)"
          />
          <h2>{t('title')}</h2>
        </div>
        <Form
          name="login"
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{ remember: rememberMe }}
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

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox onChange={(e) => setRememberMe(e.target.checked)}>
              {t('login.rememberPassword')}
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t('login.submit')}
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <div className="theme-menu-container">
            <button
              className="icon-button"
              onClick={() => setThemeMenuVisible(!themeMenuVisible)}
              title={t('theme.' + theme)}
            >
              <Icon
                path={getThemeIcon()}
                size={14}
                color="var(--color-text-primary)"
              />
            </button>

            {themeMenuVisible && (
              <div className="theme-menu">
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    setSpecificTheme('light');
                    setThemeMenuVisible(false);
                  }}
                >
                  <Icon path={mdiWhiteBalanceSunny} size={12} />
                  <span>{t('theme.light')}</span>
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    setSpecificTheme('dark');
                    setThemeMenuVisible(false);
                  }}
                >
                  <Icon path={mdiWeatherNight} size={12} />
                  <span>{t('theme.dark')}</span>
                </button>
                <button
                  className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                  onClick={() => {
                    setSpecificTheme('system');
                    setThemeMenuVisible(false);
                  }}
                >
                  <Icon path={mdiMonitor} size={12} />
                  <span>{t('theme.system')}</span>
                </button>
              </div>
            )}
          </div>
          <button
            className="icon-button"
            onClick={toggleLanguage}
            title={t('language.toggle')}
          >
            <Icon
              path={mdiGoogleTranslate}
              size={14}
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
              size={14}
              color="var(--color-text-primary)"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login; 