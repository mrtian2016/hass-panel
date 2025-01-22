import React from 'react';
import { useHass } from '@hakit/core';
import { Command } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import BaseCard from '../BaseCard';
import './style.css';
import { useTheme } from '../../theme/ThemeContext';

function ScriptPanel({ config }) {
  const { theme } = useTheme();
  const { callService } = useHass();

  const handleScriptClick = (entityId) => {
    callService({
      domain: 'script',
      service: 'turn_on',
      target: {
        entity_id: entityId
      }
    });
  };

  return (
    <BaseCard 
      title="快捷指令" 
      icon={<Command size={24} />} 
      className="script-panel" 
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
    >
      <div className="script-buttons">
        {config.map((script) => (
          <button
            key={script.entity_id}
            className="script-button"
            onClick={() => handleScriptClick(script.entity_id)}
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