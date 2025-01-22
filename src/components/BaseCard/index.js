import React from 'react';
import Icon from '@mdi/react';
import './style.css';

function BaseCard({ 
  title, 
  icon, 
  iconColor, 
  children, 
  className = '', 
  headerRight = null,
  style = {}
}) {
  return (
    <div className={`base-card ${className}`} style={style}>
      <div className="card-header">
        <h3>
          {icon && (
            React.isValidElement(icon) ? 
              React.cloneElement(icon, { 
                style: { 
                  marginRight: '8px',
                  verticalAlign: 'bottom',
                  color: iconColor
                }
              }) :
              <Icon 
                path={icon} 
                size={1} 
                color={iconColor}
                style={{ marginRight: '8px', verticalAlign: 'bottom' }} 
              />
          )}
          {title}
        </h3>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

export default BaseCard; 