'use client'

import { motion } from 'framer-motion'
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const slos = [
  {
    id: '1',
    name: 'API Availability',
    service: 'api-gateway',
    target: 99.9,
    current: 99.95,
    trend: 'up',
    status: 'healthy',
    errorBudget: 85,
    period: '30 days',
    description: 'Percentage of successful API requests',
  },
  {
    id: '2',
    name: 'Response Latency P99',
    service: 'api-gateway',
    target: 200,
    current: 187,
    unit: 'ms',
    trend: 'up',
    status: 'healthy',
    errorBudget: 92,
    period: '30 days',
    description: '99th percentile response time',
  },
  {
    id: '3',
    name: 'Payment Success Rate',
    service: 'payment-service',
    target: 99.5,
    current: 98.7,
    trend: 'down',
    status: 'at_risk',
    errorBudget: 23,
    period: '30 days',
    description: 'Percentage of successful payment transactions',
  },
  {
    id: '4',
    name: 'Database Query Latency',
    service: 'user-service',
    target: 50,
    current: 42,
    unit: 'ms',
    trend: 'up',
    status: 'healthy',
    errorBudget: 78,
    period: '30 days',
    description: 'Average database query response time',
  },
  {
    id: '5',
    name: 'Notification Delivery',
    service: 'notification-service',
    target: 99.0,
    current: 97.5,
    trend: 'down',
    status: 'breached',
    errorBudget: 0,
    period: '30 days',
    description: 'Percentage of notifications delivered within SLA',
  },
  {
    id: '6',
    name: 'Search Availability',
    service: 'search-service',
    target: 99.5,
    current: 99.8,
    trend: 'up',
    status: 'healthy',
    errorBudget: 95,
    period: '30 days',
    description: 'Search service uptime percentage',
  },
]

const sliMetrics = [
  { name: 'Total SLOs', value: '12', icon: Target, color: 'text-blue-500' },
  { name: 'Healthy', value: '9', icon: CheckCircle2, color: 'text-emerald-500' },
  { name: 'At Risk', value: '2', icon: AlertTriangle, color: 'text-amber-500' },
  { name: 'Breached', value: '1', icon: TrendingDown, color: 'text-red-500' },
]

export default function SLOsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SLOs</h1>
          <p className="text-muted-foreground mt-1">
            Service Level Objectives and Error Budgets
          </p>
        </div>
        <Button size="sm">
          <Target className="h-4 w-4 mr-2" />
          Create SLO
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sliMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.name}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {slos.map((slo, index) => (
          <motion.div
            key={slo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {slo.name}
                      {slo.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {slo.service}
                    </p>
                  </div>
                  <Badge
                    variant={
                      slo.status === 'healthy'
                        ? 'success'
                        : slo.status === 'at_risk'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {slo.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{slo.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Target</p>
                    <p className="text-xl font-bold">
                      {slo.target}
                      {slo.unit || '%'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p
                      className={`text-xl font-bold ${
                        slo.status === 'healthy'
                          ? 'text-emerald-500'
                          : slo.status === 'at_risk'
                          ? 'text-amber-500'
                          : 'text-red-500'
                      }`}
                    >
                      {slo.current}
                      {slo.unit || '%'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Error Budget Remaining
                    </span>
                    <span className="font-medium">{slo.errorBudget}%</span>
                  </div>
                  <Progress
                    value={slo.errorBudget}
                    variant={
                      slo.errorBudget > 50
                        ? 'success'
                        : slo.errorBudget > 20
                        ? 'warning'
                        : 'error'
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Rolling {slo.period}
                  </div>
                  <Button variant="outline" size="sm">
                    <Activity className="h-3.5 w-3.5 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
