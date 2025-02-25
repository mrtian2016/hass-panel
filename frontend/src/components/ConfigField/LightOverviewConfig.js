import { useLanguage } from '../../i18n/LanguageContext';
import { AutoComplete, Input, Button } from 'antd';
import { Icon } from '@iconify/react';
import { getMdiIcons } from '../../utils/helper';
import { configApi } from '../../utils/api';

function LightOverviewConfig({field, value,handleLightOverviewChange,getFilteredEntities,handleDeleteRoom,handleAddRoom}) {
    const { t } = useLanguage();
    return (
        <div className="config-field">
          <label>{field.label}</label>
          <div className="light-overview-config">
            {Array.isArray(value) && value.map((room, index) => (
              <div key={index} className="light-room-item">
                <div className="room-field">
                  <label>{t('configField.roomName')}</label>
                  <Input
                    value={room.name}
                    onChange={(e) => handleLightOverviewChange(index, 'name', e.target.value)}
                    placeholder={t('configField.placeholderRoomName')}
                  />
                </div>
                <div className="room-field">
                  <label>{t('configField.selectIcon')}</label>
                  <AutoComplete
                    allowClear
                    value={room.icon}
                    onChange={(value) => handleLightOverviewChange(index, 'icon', value)}
                    showSearch
                    placeholder={t('configField.selectIcon')} 
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                  >
                    {getMdiIcons().map(icon => (
                      <AutoComplete.Option key={icon.name} value={icon.name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon icon={icon.name} width="20" />
                          <span>{icon.label}</span>
                        </div>
                      </AutoComplete.Option>
                    ))}
                  </AutoComplete>
                </div>
                
                
                <div className="room-field">
                  <label>{t('configField.selectEntity')}</label>
                  <AutoComplete
                    allowClear
                    value={room.entity_id}
                    onChange={(value) => handleLightOverviewChange(index, 'entity_id', value)}
                    showSearch
                    placeholder={t('configField.selectEntityPlaceholder')}
                    optionFilterProp="children"
                    style={{ width: '100%' }}
                  >
                    {getFilteredEntities('light.*|switch.*').map(entity => (
                      <AutoComplete.Option key={entity.id} value={entity.id}>
                        {entity.name} ({entity.id})
                      </AutoComplete.Option>
                    ))}
                  </AutoComplete>
                </div>

                <div className="room-field">
                  <label>{t('configField.buttonPositionLeft')}</label>
                  <Input
                    value={room.position?.left}
                    onChange={(e) => handleLightOverviewChange(index, 'position', { ...room.position, left: e.target.value })}
                    placeholder={t('configField.placeholderPositionLeft')}
                  />
                </div>

                <div className="room-field">
                  <label>{t('configField.buttonPositionTop')}</label>
                  <Input
                    value={room.position?.top}
                    onChange={(e) => handleLightOverviewChange(index, 'position', { ...room.position, top: e.target.value })}
                    placeholder={t('configField.placeholderPositionTop')}
                  />
                </div>

                <div className="room-field">
                  <label>{t('configField.lightEffectImage')}</label>
                  <div className="upload-field">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const result = await configApi.uploadImage(file);
                            handleLightOverviewChange(index, 'image', result.file_path);
                        
                          } catch (error) {
                            console.error('上传失败:', error);
                          }
                        }
                      }}
                      style={{ display: 'none' }}
                      id={`image-upload-${index}`}
                    />
                    <Input 
                      value={room.image || ''}
                      placeholder={t('fields.placeholderImage')}
                      readOnly
                      addonAfter={
                        <label htmlFor={`image-upload-${index}`} style={{ cursor: 'pointer' }}>
                          {t('fields.uploadImage')}
                        </label>
                      }
                    />
                  </div>
                </div>

                <Button type="primary" style={{ width: '100px' }} danger onClick={() => handleDeleteRoom(index)}>{t('configField.deleteButton')}</Button>
              </div>
            ))}
          </div>
            <Button type="primary" style={{ width: '100px', marginTop: '10px' }} onClick={handleAddRoom}>{t('configField.addButton')}</Button>
         
        </div>
      );
}

export default LightOverviewConfig;