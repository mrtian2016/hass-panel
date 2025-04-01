import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import { useLanguage } from '../../i18n/LanguageContext';
import { Input, Empty } from 'antd';
import './style.css';

function AddCardModal({ onClose, onSelect, cardTypes }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // 添加一个帮助函数来处理翻译键
  const getTranslationKey = (type) => {
    // 特殊情况处理
    if (type === 'ScriptPanel') return 'script';
    if (type === 'WaterPurifierCard') return 'water';
    if (type === 'LightOverviewCard') return 'lightOverview';
    // 一般情况处理
    return type.replace('Card', '').toLowerCase();
  };

  // 过滤卡片类型
  const filteredCardTypes = Object.entries(cardTypes).filter(([type]) => {
    const translationKey = getTranslationKey(type);
    const cardName = t(`cardTitles.${translationKey}`).toLowerCase();
    return cardName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('config.addCard')}</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            title={t('config.cancel')}
          >
            <Icon path={mdiClose} size={14} />
          </button>
        </div>
        
        <div className="search-container">
          <Input.Search
            placeholder={t('config.searchCards')}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            allowClear
          />
        </div>
        
        <div className="card-types">
          {filteredCardTypes.length > 0 ? (
            filteredCardTypes.map(([type, config]) => {
              const translationKey = getTranslationKey(type);
              return (
                <button
                  key={type}
                  className="card-type-button"
                  onClick={() => onSelect(type)}
                  title={t(`cardTitles.${translationKey}`)}
                >
                  <Icon path={config.icon} size={14} />
                  <span>{t(`cardTitles.${translationKey}`)}</span>
                </button>
              );
            })
          ) : (
            <Empty 
              description={t('config.noCardsFound')} 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AddCardModal; 