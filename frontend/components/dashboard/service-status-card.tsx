'use client'

import { motion } from 'framer-motion'
import { Activity, Clock, AlertTriangle, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn, formatPercentage } from '@/lib/utils'
import type { Service } from '@/types'

interface ServiceStatusCardProps {
  service: Service
  onClick?: () => void
}

export function ServiceStatusCard({ service, onClick }: ServiceStatusCardProps) {
  const statusConfig = {
    healthy: {
      badge: 'success',
      dot: 'healthy',
      label: 'Healthy',
    },
    degraded: {
      badge: 'warning',
      dot: 'warning',
      label: 'Degraded',
    },
    critical: {
      badge: 'error',
      dot: 'critical',
      label: 'Critical',
    },
    unknown: {
      badge: 'secondary',
      dot: 'unknown',
      label: 'Unknown',
    },
  } as const

  const config = statusConfig[service.status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-300 hover:shadow-lg',
          service.status === 'critical' && 'border-red-500/50 shadow-red-500/10',
          service.status === 'degraded' && 'border-amber-500/50 shadow-amber-500/10'
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('status-dot', config.dot)} />
              <CardTitle className="text-lg">{service.name}</CardTitle>
            </div>
            <Badge variant={config.badge as any}>{config.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span>Uptime</span>
              </div>
              <p className="text-sm font-semibold">{formatPercentage(service.uptime)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                <span>Latency</span>
              </div>
              <p className="text-sm font-semibold">{service.latency}ms</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Errors</span>
              </div>
              <p className="text-sm font-semibold">{formatPercentage(service.errorRate)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Health Score</span>
              <span className="font-medium">
                {Math.round(100 - service.errorRate * 10)}%
              </span>
            </div>
            <Progress
              value={100 - service.errorRate * 10}
              variant={
                service.status === 'healthy'
                  ? 'success'
                  : service.status === 'degraded'
                  ? 'warning'
                  : 'danger'
              }
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{service.region}</span>
            </div>
            <span>{service.environment}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
