import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import { useTheme } from '../../theme/ThemeContext';
import './style.css';

function Modal({ visible, onClose, title, children, width }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  if (!visible) return null;

  return createPortal(
    <div className="custom-modal-overlay" onClick={onClose}>
      <div className={`custom-modal-content ${theme}`} onClick={e => e.stopPropagation()} style={width ? { width } : undefined}>
        {title && <div className="custom-modal-title">{title}</div>}
        <button className="custom-modal-close" onClick={onClose}>
          <Icon path={mdiClose} size={1} color="#ffffff" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal; 