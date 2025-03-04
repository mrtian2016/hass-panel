import React from 'react';
import Icon from '@mdi/react';
import './style.css';
function BaseCard({ 
  title, 
  titleVisible,
  icon, 
  children, 
  className = '', 
  headerRight = null,
  style = {}
}) {
  return (
    <div className={`base-card ${className}`} style={style}>
      {titleVisible !== false && (
        <div className="card-header">
          <h3>
          {icon && (
            React.isValidElement(icon) ? 
              React.cloneElement(icon, { 
                style: { 
                  marginRight: '8px',
                  verticalAlign: 'bottom',
                }
              }) :
              <Icon 
                path={icon} 
                size={1} 
                style={{ marginRight: '8px', verticalAlign: 'bottom' }} 
              />
          )}
          {title}
        </h3>
        {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}

export default BaseCard; 