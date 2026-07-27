'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, Bell, Check, X, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import { cn, formatDate } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Alert } from '@/types'

interface AlertsPanelProps {
  alerts: Alert[]
  onAcknowledge?: (alertId: string) => void
  onDismiss?: (alertId: string) => void
}

export function AlertsPanel({ alerts, onAcknowledge, onDismiss }: AlertsPanelProps) {
  const router = useRouter()
  const { addToast, dismissAlert } = useAppStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: true,
    lowAlerts: false,
    soundEnabled: true,
  })

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
    },
    high: {
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    },
    low: {
      icon: Info,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
  }

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length

  const handleAcknowledge = (alertId: string) => {
    if (onAcknowledge) {
      onAcknowledge(alertId)
      addToast({ title: 'Alert acknowledged', variant: 'success' })
    }
  }

  const handleDismiss = (alertId: string) => {
    if (onDismiss) {
      onDismiss(alertId)
    } else {
      dismissAlert(alertId)
    }
    addToast({ title: 'Alert dismissed', variant: 'success' })
  }

  const handleSaveSettings = () => {
    setIsSettingsOpen(false)
    addToast({ title: 'Alert settings saved', variant: 'success' })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Active Alerts</CardTitle>
              {unacknowledgedCount > 0 && (
                <Badge variant="error" className="animate-pulse">
                  {unacknowledgedCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Bell className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] pr-4">
            <AnimatePresence mode="popLayout">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="p-3 rounded-full bg-emerald-500/10 mb-3">
                    <Check className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">All Clear</p>
                  <p className="text-xs text-muted-foreground">No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, index) => {
                    const config = severityConfig[alert.severity]
                    const Icon = config.icon

                    return (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'p-4 rounded-lg border transition-all duration-200',
                          config.bg,
                          config.border,
                          !alert.acknowledged && 'ring-1 ring-offset-1 ring-offset-background',
                          !alert.acknowledged && alert.severity === 'critical' && 'ring-red-500/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('p-1.5 rounded-md', config.bg)}>
                            <Icon className={cn('h-4 w-4', config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-medium truncate">
                                {alert.title}
                              </h4>
                              <Badge
                                variant={
                                  alert.severity === 'critical'
                                    ? 'error'
                                    : alert.severity === 'high'
                                    ? 'warning'
                                    : 'secondary'
                                }
                                className="shrink-0"
                              >
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{alert.service}</span>
                                <span>•</span>
                                <span>{formatDate(alert.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {!alert.acknowledged && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleAcknowledge(alert.id)}
                                    className="h-7 w-7"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleDismiss(alert.id)}
                                  className="h-7 w-7"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Alert Settings
            </DialogTitle>
            <DialogDescription>
              Configure which alerts you want to receive
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="critical" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Critical Alerts
              </Label>
              <Switch
                id="critical"
                checked={settings.criticalAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, criticalAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="high" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                High Priority Alerts
              </Label>
              <Switch
                id="high"
                checked={settings.highAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, highAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="medium" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Medium Priority Alerts
              </Label>
              <Switch
                id="medium"
                checked={settings.mediumAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, mediumAlerts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="low" className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Low Priority Alerts
              </Label>
              <Switch
                id="low"
                checked={settings.lowAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, lowAlerts: checked })}
              />
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound Notifications</Label>
                <Switch
                  id="sound"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
