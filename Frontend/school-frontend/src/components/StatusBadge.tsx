import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toLowerCase();
  let className = 'badge badge-info';

  if (['active', 'paid', 'present'].includes(normalized)) {
    className = 'badge badge-active';
  } else if (['pending', 'partial', 'late'].includes(normalized)) {
    className = 'badge badge-pending';
  } else if (['inactive', 'suspended', 'absent'].includes(normalized)) {
    className = 'badge badge-inactive';
  } else if (['excused'].includes(normalized)) {
    className = 'badge badge-excused';
  }

  return <span className={className}>{status}</span>;
};
