import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Map, APILoader, ScaleControl, ToolBarControl, ControlBarControl, Geolocation, Marker } from '@uiw/react-amap';

const MapCardModal = ({
    visible,
    onClose,
    latitude = 39.915599, // 默认纬度
    longitude = 116.403694, // 默认经度
    title = '位置信息',
    zoom = 14,
}) => {
    const [position, setPosition] = useState({
        longitude,
        latitude,
    });

    useEffect(() => {
        setPosition({
            longitude,
            latitude,
        });
    }, [longitude, latitude]);

    return (
        <Modal
            title={title}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            style={{ height: '500px', padding: 0 }}
        >
            <APILoader akey="">
                <div>

                    <Map style={{ height: 300 }}>
                        {({ AMap, map, container }) => {

                            return (
                                <>
                                    <ScaleControl offset={[16, 30]} position="LB" />
                                    <ToolBarControl offset={[16, 10]} position="RB" />
                                    <ControlBarControl offset={[16, 180]} position="RB" />
                                    <Geolocation
                                        maximumAge={100000}
                                        borderRadius="5px"
                                        position="RB"
                                        offset={[16, 80]}
                                        zoomToAccuracy={true}
                                        showCircle={true}
                                    />
                                    <Marker
                                        visible={true}
                                        icon={new AMap.Icon({
                                            imageSize: new AMap.Size(45,45),
                                            image: ''
                                        })}
                                        offset={new AMap.Pixel(-22, -22)}
                                        position={new AMap.LngLat(position.longitude, position.latitude)}
                                    />
                                </>
                            );
                        }}
                    </Map>

                </div>
            </APILoader>
        </Modal>
    );
};

export default MapCardModal;
