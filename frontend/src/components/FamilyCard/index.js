import React from 'react';
import BaseCard from '../BaseCard';
import { mdiAccountGroup, mdiHome, mdiWalk, mdiAccount } from '@mdi/js';
import { useEntity } from '@hakit/core';
import Icon from '@mdi/react';
import { useTheme } from '../../theme/ThemeContext';
import './style.css';
import MapCardModal from '../MapCardModal';
function FamilyCard({ config, visible = true, titleVisible = true }) {
  const hassUrl = localStorage.getItem('hass_url');
  
  const { theme } = useTheme();

  const renderPerson = (person) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const entity = useEntity(person.entity_id);
    console.log(entity);
    const isHome = entity?.state === 'home';
    const personIcon = entity?.attributes?.entity_picture 
      ? `${hassUrl}${entity.attributes.entity_picture}`
      : null;

    return (
      <div className="family-person" key={person.entity_id}>
        <div className="person-avatar">
          {personIcon ? (
            <img src={personIcon} alt={person.name} />
          ) : (
            <div className="default-avatar" >
            <Icon 
              path={mdiAccount} 
              size={3} 
              color="white"
            />
            </div>
          )}
          <div className="status-indicator">
            <Icon 
              path={isHome ? mdiHome : mdiWalk} 
              size={0.7} 
              color={theme === 'dark' ? 'white' : 'black'}
            />
          </div>
        </div>
        <div className="person-name">
          {entity?.attributes?.friendly_name}
        </div>
      </div>
    );
  };

  if (!visible) return null;

  return (
    <BaseCard
      title={config.title}
      titleVisible={titleVisible}
      icon={mdiAccountGroup}
    >
      <div className="family-members-container">
        <div className={`family-members members-${config.persons?.length || 0}`}>
          {config.persons?.map(renderPerson)}
        </div>
      </div>
      <MapCardModal
        visible={false}
      />
    </BaseCard>
  );
}

export default FamilyCard;
