import React from 'react';
import { useHass } from '@hakit/core';
import { Command } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useLanguage } from '../../i18n/LanguageContext';
import { notification } from 'antd';
import BaseCard from '../BaseCard';
import './style.css';
import { useTheme } from '../../theme/ThemeContext';

function ScriptPanel({ config }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { callService } = useHass();

  const handleScriptClick = async (entityId, scriptName) => {
    try {
      await callService({
        domain: 'script',
        service: 'turn_on',
        target: {
          entity_id: entityId
        }
      });
    } catch (error) {
      notification.error({
        message: t('script.executeError'),
        description: t('script.executeErrorDesc') + (scriptName || entityId) + ' - ' + error.message,
        placement: 'topRight',
        duration: 3,
        key: 'ScriptPanel',
      });
    }
  };

  return (
    <BaseCard 
      title={config.title || t('cardTitles.scriptpanel')} 
      icon={<Command size={24} />} 
      className="script-panel" 
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
    >
      <div className="script-buttons">
        {config.scripts.map((script) => (
          <button
            key={script.entity_id}
            className="script-button"
            onClick={() => handleScriptClick(script.entity_id, script.name)}
          >
            <DynamicIcon name={script.icon} size={20} className="script-icon" />
            <span className="script-name">{script.name}</span>
          </button>
        ))}
      </div>
    </BaseCard>
  );
}

export default ScriptPanel; 