import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Select, Input } from 'antd';

function DailyQuoteConfig({ field, value, onChange }) {
   const { t } = useLanguage();
   const [apiSources, setApiSources] = useState([]);

   // 确保有初始值
   const quoteConfig = {
    source: 'manual',
    content: '',
    author: '',
    apiEndpoint: 'hitokoto',
    ...value
   };

   useEffect(() => {
     // 获取API源列表
     fetch('/api/daily_quote/sources')
       .then(response => response.json())
       .then(data => {
         setApiSources(data);
       })
       .catch(error => {
         console.error('获取API源列表失败:', error);
       });
   }, []);

   return (
    <div className="config-field">
      <label>{field.label}</label>
      <div className="quotes-config">
        <div className="config-field-row">
          <span className="field-name">{t('configField.quoteSource')}</span>
          <Select
            value={quoteConfig.source}
            onChange={(selectedValue) => {
              onChange({
                ...quoteConfig,
                source: selectedValue
              });
            }}
            options={[
              { value: 'manual', label: t('configField.manualInput') },
              { value: 'api', label: t('configField.apiSource') }
            ]}
          />
        </div>

        {quoteConfig.source === 'manual' && (
          <>
            <div className="config-field-row">
              <span className="field-name">{t('configField.quoteContent')}</span>
              <Input.TextArea
                value={quoteConfig.content}
                onChange={(e) => {
                  onChange({
                    ...quoteConfig,
                    content: e.target.value
                  });
                }}
                placeholder={t('configField.enterQuote')}
                rows={4}
              />
            </div>
            <div className="config-field-row">
              <span className="field-name">{t('configField.quoteAuthor')}</span>
              <Input
                value={quoteConfig.author}
                onChange={(e) => {
                  onChange({
                    ...quoteConfig,
                    author: e.target.value
                  });
                }}
                placeholder={t('configField.enterAuthor')}
              />
            </div>
          </>
        )}

        {quoteConfig.source === 'api' && (
          <div className="config-field-row">
            <span className="field-name">{t('configField.apiEndpoint')}</span>
            <Select
              value={quoteConfig.apiEndpoint}
              onChange={(selectedValue) => {
                onChange({
                  ...quoteConfig,
                  apiEndpoint: selectedValue
                });
              }}
              options={apiSources}
            />
          </div>
        )}
        
      </div>
    </div>
  );
}

export default DailyQuoteConfig;
