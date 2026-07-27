'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wrench,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  RotateCcw,
  Scale,
  Trash2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatDate } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Remediation } from '@/types'

interface RemediationPanelProps {
  remediations: Remediation[]
  onTriggerRemediation?: (type: string, service: string) => void
}

export function RemediationPanel({
  remediations,
  onTriggerRemediation,
}: RemediationPanelProps) {
  const { addToast } = useAppStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [targetService, setTargetService] = useState('')
  const [runningActions, setRunningActions] = useState<string[]>([])

  const typeConfig = {
    restart: {
      icon: RotateCcw,
      label: 'Restart',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    scale: {
      icon: Scale,
      label: 'Scale',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    rollback: {
      icon: RotateCcw,
      label: 'Rollback',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    'clear-cache': {
      icon: Trash2,
      label: 'Clear Cache',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10',
    },
    custom: {
      icon: Terminal,
      label: 'Custom',
      color: 'text-slate-500',
      bg: 'bg-slate-500/10',
    },
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      color: 'text-slate-400',
      bg: 'bg-slate-400/10',
    },
    running: {
      icon: Loader2,
      label: 'Running',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  }

  const quickActions = [
    { type: 'restart', label: 'Restart Pods', icon: RotateCcw },
    { type: 'scale', label: 'Scale Up', icon: Scale },
    { type: 'clear-cache', label: 'Clear Cache', icon: Trash2 },
    { type: 'rollback', label: 'Rollback', icon: RotateCcw },
  ]

  const handleQuickAction = (type: string) => {
    setSelectedAction(type)
    setIsRunDialogOpen(true)
  }

  const executeAction = () => {
    if (!targetService) {
      addToast({ title: 'Please select a service', variant: 'error' })
      return
    }

    const actionLabel = quickActions.find(a => a.type === selectedAction)?.label || selectedAction

    setRunningActions(prev => [...prev, selectedAction!])
    setIsRunDialogOpen(false)

    addToast({
      title: `Running ${actionLabel}`,
      description: `Executing on ${targetService}...`,
      variant: 'warning'
    })

    if (onTriggerRemediation) {
      onTriggerRemediation(selectedAction!, targetService)
    }

    setTimeout(() => {
      setRunningActions(prev => prev.filter(a => a !== selectedAction))
      const success = Math.random() > 0.2
      addToast({
        title: success ? 'Action completed' : 'Action failed',
        description: success
          ? `${actionLabel} completed successfully`
          : `${actionLabel} failed - check logs`,
        variant: success ? 'success' : 'error'
      })
    }, 3000)

    setTargetService('')
    setSelectedAction(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Auto Remediation</CardTitle>
              <Badge variant="info" className="flex items-center gap-1">
                <Bot className="h-3 w-3" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickActions.map((action) => {
              const isRunning = runningActions.includes(action.type)
              return (
                <Button
                  key={action.type}
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex-col gap-1.5"
                  disabled={isRunning}
                  onClick={() => handleQuickAction(action.type)}
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <action.icon className="h-4 w-4" />
                  )}
                  <span className="text-xs">{action.label}</span>
                </Button>
              )
            })}
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Recent Remediations
            </h4>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-3">
                <AnimatePresence>
                  {remediations.map((remediation, index) => {
                    const type = typeConfig[remediation.type]
                    const status = statusConfig[remediation.status]
                    const TypeIcon = type.icon
                    const StatusIcon = status.icon
                    const isExpanded = expandedId === remediation.id

                    return (
                      <motion.div
                        key={remediation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'rounded-lg border overflow-hidden transition-all duration-200',
                          remediation.status === 'running' && 'ring-1 ring-blue-500/30'
                        )}
                      >
                        <div
                          className={cn(
                            'p-3 cursor-pointer hover:bg-muted/50 transition-colors',
                            isExpanded && 'bg-muted/30'
                          )}
                          onClick={() => setExpandedId(isExpanded ? null : remediation.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn('p-2 rounded-lg', type.bg)}>
                                <TypeIcon className={cn('h-4 w-4', type.color)} />
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-sm font-medium">{remediation.name}</h5>
                                <p className="text-xs text-muted-foreground">
                                  {remediation.service}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  remediation.status === 'completed'
                                    ? 'success'
                                    : remediation.status === 'failed'
                                    ? 'error'
                                    : remediation.status === 'running'
                                    ? 'info'
                                    : 'secondary'
                                }
                                className="flex items-center gap-1"
                              >
                                <StatusIcon
                                  className={cn(
                                    'h-3 w-3',
                                    remediation.status === 'running' && 'animate-spin'
                                  )}
                                />
                                {status.label}
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {remediation.triggeredBy === 'auto' ? (
                                <>
                                  <Bot className="h-3 w-3" />
                                  Auto-triggered
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3" />
                                  {remediation.triggeredBy.name}
                                </>
                              )}
                            </span>
                            <span>•</span>
                            <span>{formatDate(remediation.startedAt)}</span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-3 pt-0 border-t bg-muted/20">
                                <div className="mt-3 space-y-2">
                                  <h6 className="text-xs font-medium text-muted-foreground">
                                    Execution Log
                                  </h6>
                                  <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs space-y-1">
                                    {remediation.logs.map((log, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          'text-slate-300',
                                          log.includes('[ERROR]') && 'text-red-400',
                                          log.includes('[SUCCESS]') && 'text-emerald-400',
                                          log.includes('[INFO]') && 'text-blue-400'
                                        )}
                                      >
                                        {log}
                                      </div>
                                    ))}
                                    {remediation.status === 'running' && (
                                      <div className="flex items-center gap-2 text-blue-400">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>Executing...</span>
                                      </div>
                                    )}
                                  </div>
                                  {remediation.result && (
                                    <div
                                      className={cn(
                                        'p-2 rounded text-xs',
                                        remediation.result.success
                                          ? 'bg-emerald-500/10 text-emerald-500'
                                          : 'bg-red-500/10 text-red-500'
                                      )}
                                    >
                                      {remediation.result.message}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {remediations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-3 rounded-full bg-muted mb-3">
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No recent remediations</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Run {quickActions.find(a => a.type === selectedAction)?.label}
            </DialogTitle>
            <DialogDescription>
              Select the target service for this remediation action
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Target Service</Label>
              <Select value={targetService} onValueChange={setTargetService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api-gateway">API Gateway</SelectItem>
                  <SelectItem value="user-service">User Service</SelectItem>
                  <SelectItem value="payment-service">Payment Service</SelectItem>
                  <SelectItem value="notification-service">Notification Service</SelectItem>
                  <SelectItem value="search-service">Search Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRunDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={executeAction}>
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
