import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiPlay,
  mdiPause,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiVolumeHigh,
  mdiVolumeLow,
  mdiPlayCircle,
} from '@mdi/js';
import { useService } from '@hakit/core';
import { useTheme } from '../../theme/ThemeContext';
import BaseCard from '../BaseCard';
import './style.css';
import { useEntity } from '@hakit/core';

function MediaPlayerCard({ config }) {
  const { theme } = useTheme();


  // 动态加载播放器实体
  const mediaPlayerEntities = config.map(player => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const entity = useEntity(player.entity_id);
    return {
      ...player,
      entity,
    };
  });

  const handlePlayPause = (player) => {
    player.service.mediaPlayPause();
  };

  const handlePrevious = (player) => {
    player.service.mediaPreviousTrack();
  };

  const handleNext = (player) => {
    player.service.mediaNextTrack();
  };

  const handleVolumeUp = (player) => {
    player.service.volumeUp();
  };

  const handleVolumeDown = (player) => {
    player.service.volumeDown();
  };

  const handleVolumeSet = (player, volume) => {
    player.service.volumeSet({ serviceData: { "volume_level": volume } });
  };

  return (
    <BaseCard
      title="播放器控制"
      icon={mdiPlayCircle}
      iconColor={theme === 'dark' ? 'var(--color-text-primary)' : '#81C784'}
    >
      <div className="media-players">
        {mediaPlayerEntities.map((player, index) => {
          console.log(player);
          const coverUrl = player.entity?.attributes?.entity_picture 
            ? `${window.env?.REACT_APP_HASS_URL}${player.entity.attributes.entity_picture}`
            : null;

          return (
            <div 
              key={index} 
              className="media-player"
              data-has-cover={!!coverUrl}
              style={coverUrl ? { '--cover-image': `url(${coverUrl})` } : undefined}
            >
              <div className="player-name">{player.name}</div>
              <div className="player-content">
                <div className="player-info-row">
                  <div className="player-cover">
                    {coverUrl ? (
                      <img src={coverUrl} alt="封面" />
                    ) : (
                      <div className="cover-placeholder" />
                    )}
                  </div>
                  <div className="player-info">
                    <span className="player-state">{player.entity?.attributes?.media_title || '未在播放'}</span>
                    {player.entity?.attributes?.media_artist && (
                      <span className="player-artist">{player.entity.attributes.media_artist}</span>
                    )}
                  </div>
                </div>
                <div className="player-controls-row">
                  <div className="player-volume">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={player.entity?.attributes?.volume_level || 0}
                      onChange={(e) => handleVolumeSet(player.entity, parseFloat(e.target.value))}
                      disabled={player.entity?.state === 'off'}
                      className="volume-slider"
                    />
                    <div className="volume-buttons">
                      <button 
                        className="control-button"
                        onClick={() => handleVolumeDown(player.entity)}
                        disabled={player.entity?.state === 'off'}
                      >
                        <Icon path={mdiVolumeLow} size={0.8} />
                      </button>
                      <button 
                        className="control-button"
                        onClick={() => handleVolumeUp(player.entity)}
                        disabled={player.entity?.state === 'off'}
                      >
                        <Icon path={mdiVolumeHigh} size={0.8} />
                      </button>
                    </div>
                  </div>
                  <div className="player-controls">
                    <button 
                      className="control-button"
                      onClick={() => handlePrevious(player.entity)}
                      disabled={player.entity?.state === 'off'}
                    >
                      <Icon path={mdiSkipPrevious} size={1} />
                    </button>
                    <button 
                      className="control-button play-button"
                      onClick={() => handlePlayPause(player.entity)}
                      disabled={player.entity?.state === 'off'}
                    >
                      <Icon path={player.entity?.state === 'playing' ? mdiPause : mdiPlay} size={1} />
                    </button>
                    <button 
                      className="control-button"
                      onClick={() => handleNext(player.entity)}
                      disabled={player.entity?.state === 'off'}
                    >
                      <Icon path={mdiSkipNext} size={1} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </BaseCard>
  );
}

export default MediaPlayerCard; 