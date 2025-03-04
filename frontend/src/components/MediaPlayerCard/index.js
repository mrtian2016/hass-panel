import React from 'react';
import { notification } from 'antd';
import { 
  mdiPlayCircle,
} from '@mdi/js';
// import { useService } from '@hakit/core';
import { useLanguage } from '../../i18n/LanguageContext';
import BaseCard from '../BaseCard';
import './style.css';
import { useEntity } from '@hakit/core';
import MiniPlayerCard from '../MiniPlayerCard';
function MediaPlayerCard({ config }) {
  
  const titleVisible = config.titleVisible;
  const { t } = useLanguage();
  const debugMode = localStorage.getItem('debugMode') === 'true';
  // 检查配置是否存在
  if (!config || !config.mediaPlayers) {
    return (
      <BaseCard
        title={config.title || t('cardTitles.mediaplayer')}
        icon={mdiPlayCircle}
      >
        <div className="media-players">
          {t('mediaPlayer.configIncomplete')}
        </div>
      </BaseCard>
    );
  }

  // 确保 mediaPlayers 是数组
  const mediaPlayers = Array.isArray(config.mediaPlayers) ? config.mediaPlayers : [];

  // 动态加载播放器实体
  const mediaPlayerEntities = mediaPlayers.map(player => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const entity = useEntity(player.entity_id);
      return {
        ...player,
        entity,
      };
    } catch (error) {
      if (debugMode) {
        notification.error({
          message: t('mediaPlayer.loadError'),
          description: t('mediaPlayer.loadErrorDesc') + (player.name || player.entity_id) + ' - ' + error.message,
          placement: 'topRight',
          duration: 3,
          key: 'MediaPlayerCard',
        });
      }
      return {
        ...player,
        entity: { state: null, error: true },
      };
    }
  });


  // 安全获取媒体标题
  const getMediaTitle = (entity) => {
    if (!entity || entity.error || !entity.attributes?.media_title) {
      return t('mediaPlayer.notPlaying');
    }
    return entity.attributes.media_title;
  };

  // 安全获取音量级别
  const getVolumeLevel = (entity) => {
    

    if (!entity || entity.error || entity.attributes?.volume_level === undefined) {
      return 0;
    }
    return entity.attributes.volume_level;
  };

  const handlePlayPause = (player) => {
    if (player && !player.error) {
      player.service?.mediaPlayPause();
    }
  };

  const handlePrevious = (player) => {
    if (player && !player.error) {
      player.service?.mediaPreviousTrack();
    }
  };

  const handleNext = (player) => {
    if (player && !player.error) {
      player.service?.mediaNextTrack();
    }
  };

  const handleVolumeUp = (player) => {
    if (player && !player.error) {
      player.service?.volumeUp();
    }
  };

  const handleVolumeDown = (player) => {
    if (player && !player.error) {
      player.service?.volumeDown();
    }
  };

  const handleVolumeSet = (player, volume) => {
    if (player && !player.error) {
      player.service?.volumeSet({ serviceData: { "volume_level": volume } });
    }
  };

  return (
    <BaseCard
      title={config.title || t('cardTitles.mediaplayer')}
      icon={mdiPlayCircle}
      titleVisible={titleVisible}
    >
  
      <div className="media-players">
        {mediaPlayerEntities.map((player) => (
          <MiniPlayerCard
            key={player.entity_id}
            entity={player.entity}
            title={player.name}
            handlePlayPause={handlePlayPause}
            handlePrevious={handlePrevious}
            handleNext={handleNext}
            handleVolumeUp={handleVolumeUp}
            handleVolumeDown={handleVolumeDown}
            handleVolumeSet={handleVolumeSet}
            getMediaTitle={getMediaTitle}
            getVolumeLevel={getVolumeLevel}
          />
        ))}
       
      </div>
    </BaseCard>
  );
}

export default MediaPlayerCard; 