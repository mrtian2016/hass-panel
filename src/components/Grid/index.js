import React from 'react';
import './style.css';

export const Row = ({ children, gutter = 16, className = '', ...props }) => {
  return (
    <div 
      className={`row ${className}`} 
      style={{ margin: `0 -${gutter/2}px` }}
      {...props}
    >
      {React.Children.map(children, child => {
        return React.cloneElement(child, {
          style: {
            ...child.props.style,
            padding: `0 ${gutter/2}px`,
          }
        });
      })}
    </div>
  );
};

export const Col = ({ 
  children, 
  span = 24,
  md,
  lg,
  className = '', 
  ...props 
}) => {
  const classes = [
    'col',
    `col-${span}`,
    md && `col-md-${md}`,
    lg && `col-lg-${lg}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}; 