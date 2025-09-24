import React from 'react';
import { useTheme, getThemeColors } from './ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const baseClasses = 'rounded-lg p-6';
  const hoverClasses = hoverable ? 'hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-300' : '';
  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  return (
    <div
      className={classes}
      onClick={onClick}
      style={{
        backgroundColor: colors.bg.tertiary,
        boxShadow: colors.shadow,
        border: `1px solid ${colors.border.primary}`
      }}
    >
      {title && (
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: colors.text.primary }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};