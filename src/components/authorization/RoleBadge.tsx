import React from 'react';

interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const roleColors: Record<string, string> = {
  owner: 'bg-red-100 text-red-800 border-red-200',
  admin: 'bg-orange-100 text-orange-800 border-orange-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  supervisor: 'bg-purple-100 text-purple-800 border-purple-200',
  member: 'bg-gray-100 text-gray-800 border-gray-200',
  viewer: 'bg-slate-100 text-slate-800 border-slate-200',
};

const roleIcons: Record<string, string> = {
  owner: '👑',
  admin: '🛡️',
  manager: '👔',
  supervisor: '👁️',
  member: '👤',
  viewer: '👁️',
};

export function RoleBadge({ role, size = 'md', showIcon = true }: RoleBadgeProps) {
  const normalizedRole = role.toLowerCase();
  const colorClass = roleColors[normalizedRole] || 'bg-gray-100 text-gray-800 border-gray-200';
  const icon = roleIcons[normalizedRole] || '👤';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${colorClass}
        ${sizeClasses[size]}
      `}
    >
      {showIcon && <span>{icon}</span>}
      {role}
    </span>
  );
}
