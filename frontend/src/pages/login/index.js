import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { useTheme } from '../../theme/ThemeContext';
import './style.css';
import { hashPassword } from '../../utils/helper';
function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const onFinish = async (values) => {
    setLoading(true);
    try {
        const requestData = {
            username: values.username,
            password: hashPassword(values.password),
        }
        console.log(requestData);
        
      const response = await fetch('./api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData).toString(),
      });
      
      const data = await response.json();
      
      if (data.code === 200) {
        // 存储token
        localStorage.setItem('hass_panel_token', JSON.stringify({
          access_token: data.data.access_token,
        }));
        message.success('登录成功');
        setTimeout(() => {
          navigate('/');
          window.location.reload(); // 刷新页面以重新获取配置
        }, 2000);
      } else {
        message.error(data.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={`login-container ${theme}`}>
        <div className="login-box">
          <h2>登录</h2>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login; 