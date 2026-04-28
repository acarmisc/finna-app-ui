import React from 'react'

interface StatusBadgeProps {
  status: string
  className?: string
}

const STATUS_MAP: Record<string, { cls: string; text: string; pulse?: boolean }> = {
  started:   { cls: 'ghost-warning', text: 'started' },
  running:   { cls: 'solid-accent',  text: 'running', pulse: true },
  completed: { cls: 'ghost-accent',  text: 'completed' },
  failed:    { cls: 'ghost-danger',  text: 'failed' },
  cancelled: { cls: 'ghost-muted',   text: 'cancelled' },
  ok:        { cls: 'ghost-accent',  text: 'ok' },
  err:       { cls: 'ghost-danger',  text: 'error' },
  warn:      { cls: 'ghost-warning', text: 'warn' },
  firing:    { cls: 'solid-danger',  text: 'firing', pulse: true },
  ack:       { cls: 'ghost-warning', text: "ack'd" },
  resolved:  { cls: 'ghost-accent',  text: 'resolved' },
  pending:   { cls: 'ghost-muted',   text: 'pending' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const m = STATUS_MAP[status] || { cls: 'ghost-muted', text: status }
  return (
    <span className={`badge ${m.cls}${className ? ` ${className}` : ''}`}>
      {m.pulse && <span className="dot pulse" />}
      {m.text}
    </span>
  )
}

export default StatusBadge