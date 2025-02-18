import { FC } from 'react';
import { Form, Input, Button, message } from 'antd';
import { login } from '../api/auth';

const LoginForm: FC = () => {
  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const result = await login(values);
      // 存储token
      localStorage.setItem('token', result.access_token);
      message.success('登录成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
    }
  };

  return (
    <Form onFinish={onFinish}>
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input placeholder="用户名" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password placeholder="密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          登录
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm; 