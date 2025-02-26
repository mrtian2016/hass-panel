import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

export const ElectricityInfoItem = ({ icon, label, value, unit }) => (
  <div className="electricity-info-item">
    <div className="info-label">
      <Icon icon={icon} width={20} height={20} />
      <span>{label}</span>
    </div>
    <div className="electricity-value">
      <span className="value">{value}</span>
      <span className="unit">{unit}</span>
    </div>
  </div>
);

ElectricityInfoItem.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string.isRequired
}; 