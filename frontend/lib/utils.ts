import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}m`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    healthy: 'text-emerald-500',
    running: 'text-emerald-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    pending: 'text-amber-500',
    degraded: 'text-amber-500',
    critical: 'text-red-500',
    error: 'text-red-500',
    failed: 'text-red-500',
    unknown: 'text-slate-400',
  }
  return colors[status.toLowerCase()] || colors.unknown
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    healthy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    running: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    degraded: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    unknown: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  }
  return colors[status.toLowerCase()] || colors.unknown
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
