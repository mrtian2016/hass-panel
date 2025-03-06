import ServerInfoCommon from '../ServerInfoCommon';
import { Icon } from '@mdi/react';
import './style.css';

const ServerInfoRow = ({ cpuUsage, memoryUsage, uploadSpeed, downloadSpeed, title, serverInfoItems }) => {
   
    return <div><div className="server-data">
        <ServerInfoCommon cpuUsage={cpuUsage} memoryUsage={memoryUsage} uploadSpeed={uploadSpeed} downloadSpeed={downloadSpeed} />
        <div className="server-info-section">

            <div className="server-info-row">
                <div className='server-title'>{title}</div>
            </div>

            {serverInfoItems.map((item, index) => (
                Boolean(item.value) && <div className="server-info-row" key={index}>
                    <div className="server-info-item">
                        <div className="server-info-label-group">
                            <Icon path={item.icon} size={12} />
                            <span className="server-info-label">{item.label}</span>
                        </div>
                        <span className={`server-info-value ${item.className || ''}`}>
                            {item.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    </div></div>;
};

export default ServerInfoRow;
