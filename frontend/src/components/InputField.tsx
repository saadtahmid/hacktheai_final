import React from 'react';
import { useTheme, getThemeColors } from './ThemeProvider';

interface InputFieldProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'date' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 3,
  className = '',
}) => {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const inputStyle = {
    backgroundColor: colors.bg.secondary,
    color: colors.text.primary,
    borderColor: error ? '#ef4444' : colors.border.primary,
  };

  return (
    <div className="space-y-1">
      <label
        className="block text-sm font-medium"
        style={{ color: colors.text.primary }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={baseInputClasses}
          style={inputStyle}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={baseInputClasses}
          style={inputStyle}
        />
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};