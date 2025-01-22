import React from 'react';
import { mdiCurtains } from '@mdi/js';
import BaseCard from '../BaseCard';
import CurtainItem from './CurtainItem';
import './style.css';
function CurtainCard({ curtains }) {
  return (
    <BaseCard title="窗帘控制" icon={mdiCurtains}>
      <div className="curtains-grid">
        {curtains.map(curtain => (
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