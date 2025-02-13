import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Checkbox } from 'antd';
import { useLanguage } from '../../i18n/LanguageContext';

const WebdavConfig = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  initialValues,
  webdavConfig,
}) => {
  const [form] = Form.useForm();
  const { t } = useLanguage();
  // 当模态框打开时，设置表单初始值
  useEffect(() => {
    if (visible) {
      // 获取当前浏览器地址
      const currentUrl = window.location.origin;
      const defaultWebdavUrl = currentUrl.replace(/:\d+$/, ':5124');  // 替换端口为5124
      
      // 如果没有配置过WebDAV URL和用户名，则使用默认值
      const initialValues = {
        ...webdavConfig,
        url: webdavConfig.url || defaultWebdavUrl,
        username: webdavConfig.username || 'admin'
      };
      
      form.setFieldsValue(initialValues);
    }
  }, [visible, form, webdavConfig]);

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={t('webdav.config')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          label={t('webdav.url')}
          name="url"
          rules={[{ required: true, message: t('enterWebdavUrl') }]}
        >
          <Input placeholder={t('webdav.url')} />
        </Form.Item>

        <Form.Item
          label={t('webdav.username')}
          name="username"
        >
          <Input placeholder={t('webdav.username')} />
        </Form.Item>

        <Form.Item
          label={t('webdav.password')}
          name="password"
        >
          <Input.Password placeholder={t('webdav.password')} />
        </Form.Item>

        <Form.Item
          name="autoSync"
          valuePropName="checked"
        >
          <Checkbox>{t('webdav.autoSync')}</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            {t('webdav.save')}
          </Button>
          <Button onClick={onCancel}>
            {t('webdav.cancel')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WebdavConfig;



