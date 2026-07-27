'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const variants = {
    default: {
      icon: 'bg-primary/10 text-primary',
      gradient: 'from-primary/5 to-transparent',
    },
    success: {
      icon: 'bg-emerald-500/10 text-emerald-500',
      gradient: 'from-emerald-500/5 to-transparent',
    },
    warning: {
      icon: 'bg-amber-500/10 text-amber-500',
      gradient: 'from-amber-500/5 to-transparent',
    },
    danger: {
      icon: 'bg-red-500/10 text-red-500',
      gradient: 'from-red-500/5 to-transparent',
    },
    info: {
      icon: 'bg-blue-500/10 text-blue-500',
      gradient: 'from-blue-500/5 to-transparent',
    },
  }

  const colors = variants[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-50',
            colors.gradient
          )}
        />
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                {trend && (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {trend.isPositive ? '+' : ''}
                    {trend.value}%
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', colors.icon)}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
