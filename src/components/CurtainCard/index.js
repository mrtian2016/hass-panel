import React from 'react';
import { mdiCurtains } from '@mdi/js';
import BaseCard from '../BaseCard';
import CurtainItem from './CurtainItem';
import { useLanguage } from '../../i18n/LanguageContext';
import './style.css';

function CurtainCard({ config }) {
  const { t } = useLanguage();
  
  return (
    <BaseCard title={config.title || t('cardTitles.curtain')} icon={mdiCurtains}>
      <div className="curtains-grid">
        {config.curtains.map(curtain => (
          <CurtainItem 
            key={curtain.entity_id}
            entity_id={curtain.entity_id}
            name={curtain.name}
          />
        ))}
      </div>
    </BaseCard>
  );
}

export default CurtainCard; 