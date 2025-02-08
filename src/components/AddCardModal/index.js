import React from 'react';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import './style.css';

function AddCardModal({ onClose, onSelect, cardTypes }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>添加卡片</h3>
          <button className="close-button" onClick={onClose}>
            <Icon path={mdiClose} size={1} />
          </button>
        </div>
        <div className="card-types">
          {Object.entries(cardTypes).map(([type, config]) => (
            <button
              key={type}
              className="card-type-button"
              onClick={() => onSelect(type)}
            >
              <Icon path={config.icon} size={1} />
              <span>{config.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddCardModal; 