import React from 'react';
import {Icon} from '@iconify/react';
import { 
  mdiWidgets
} from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import './style.css';
import { useEntity } from '@hakit/core';
import { notification } from 'antd';



function UniversalCard({ config }) {
  console.log('config', config);
  const titleVisible = config.titleVisible;
  const { theme } = useTheme();
  const { t } = useLanguage();
  const debugMode = localStorage.getItem('debugMode') === 'true';

  // 检查配置是否存在
  if (!config || !config.entities) {
    return (
      <BaseCard
        title={config.title}
        icon={"mdi:thermometer"}
        iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
      >
        <div className="universal-data">
          {t('universal.configIncomplete')}
        </div>
      </BaseCard>
    );
  }

  // 确保 config.entities 是数组
  const entityGroups = Array.isArray(config.entities) ? config.entities : [];

  // 修改动态加载实体的部分
  const loadedEntityGroups = entityGroups.map(group => {
    const entities = Object.entries(group.entities).reduce((acc, [id, entity]) => {
      try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const entityData = useEntity(entity.entity_id);
        acc[id] = {
          ...entity,
          entity: entityData,
        };
      } catch (error) {
        if (debugMode) {
          notification.error({
            message: t('universal.loadError'),
            description: t('universal.loadErrorDesc') + (entity.name || entity.entity_id) + ' - ' + error.message,
            placement: 'topRight',
            duration: 3,
            key: 'UniversalCard',
          });
        }
        acc[id] = {
          ...entity,
          entity: { state: null, error: true },
        };
      }
      return acc;
    }, {});

    return {
      ...group,
      entities,
    };
  });

  // 修改获取实体值的函数
  const getEntityValue = (entity) => {
    if (!entity.entity || entity.entity.error || 
        entity.entity.state === undefined || entity.entity.state === null) {
      return t('universal.noValue');
    }

    // 处理switch.*类型
    if (entity.entity_id.startsWith('switch')) {
      return entity.entity.state === 'on' ? t('universal.on') : t('universal.off');
    }

    const unit = entity.entity.attributes?.unit_of_measurement || '';
    return `${entity.entity.state} ${unit}`;
  };



  // 修改获取实体颜色的函数
  const getEntityColor = (entity) => {
    if (entity.entity_id.startsWith('switch') || entity.entity_id.startsWith('light')) {
      return entity.entity.state === 'on' ? 'var(--color-primary)' : 'var(--color-text-primary)';
    }
    return 'var(--color-text-primary)';
  };

  // 修改点击处理函数
  const handleEntityClick = (entity) => {
    if(entity.entity_id.startsWith('sensor')){
      console.log('handleEntityClick', entity);
      return
    }
   
    entity.entity.service.toggle();
    if (entity.entity_id.startsWith('switch')) {
      try {
      } catch (error) {
        if (debugMode) {
          notification.error({
            message: t('universal.operationError'),
            description: error.message,
            placement: 'topRight',
            duration: 3,
          });
        }
      }
    }
  };

  return (
    <BaseCard
      title={config.title || t('cardTitles.universal')}
      icon={mdiWidgets}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#4FC3F7'}
      titleVisible={titleVisible}
    >
      <div className="universal-data">
        {loadedEntityGroups.map(group => (
          <div key={group.id} className="entity-group">
            <div className="group-name">{group.name}</div>
            <div className="entity-items">
              {Object.entries(group.entities).map(([id, entity]) => (
                <div 
                  key={id} 
                  className={`entity-item`}
                  onClick={() => handleEntityClick(entity)}
                >
                  <Icon width="24"
                    className={`entity-icon`}
                    icon={entity.entity?.attributes?.icon} 
                    color={getEntityColor(entity)} 
                  />
                  <div className="entity-info">
                    <span className="label">
                      {entity.name}
                    </span>
                    <span className="value">
                      {getEntityValue(entity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

export default UniversalCard;
