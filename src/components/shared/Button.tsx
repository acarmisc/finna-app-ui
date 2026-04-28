import React from 'react'
import { Icon } from './Icon'

interface ButtonProps {
  variant?: 'default' | 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconRight?: string
  bracket?: boolean
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  className?: string
  title?: string
}

export function Button({
  variant = 'default',
  size = 'md',
  icon,
  iconRight,
  bracket = false,
  children,
  onClick,
  disabled = false,
  type = 'button',
  block = false,
  className,
  title,
}: ButtonProps) {
  const cls = [
    'btn',
    variant !== 'default' ? `btn-${variant}` : '',
    size !== 'md' ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    className || '',
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon && <Icon name={icon} size={12} />}
      {bracket && <span className="brackets-l">[</span>}
      {children && <span>{children}</span>}
      {bracket && <span className="brackets-r">]</span>}
      {iconRight && <Icon name={iconRight} size={12} />}
    </button>
  )
}

export default Button