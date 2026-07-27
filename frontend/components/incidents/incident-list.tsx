'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  Circle,
  ChevronRight,
  Timer,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatDate } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Incident } from '@/types'

interface IncidentListProps {
  incidents: Incident[]
  onSelectIncident?: (incident: Incident) => void
  onAcknowledge?: (incident: Incident) => void
  onResolve?: (incident: Incident) => void
}

export function IncidentList({
  incidents,
  onSelectIncident,
  onAcknowledge,
  onResolve,
}: IncidentListProps) {
  const router = useRouter()
  const { addIncident, addToast } = useAppStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    service: '',
  })

  const severityConfig = {
    critical: {
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      badge: 'error' as const,
    },
    high: {
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      badge: 'warning' as const,
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      badge: 'warning' as const,
    },
    low: {
      icon: Circle,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      badge: 'info' as const,
    },
  }

  const statusConfig = {
    open: { label: 'Open', color: 'text-red-500', bg: 'bg-red-500/10' },
    acknowledged: { label: 'Acknowledged', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    resolved: { label: 'Resolved', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  }

  const openIncidents = incidents.filter((i) => i.status !== 'resolved')
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved')

  const getDuration = (incident: Incident) => {
    const start = new Date(incident.createdAt).getTime()
    const end = incident.resolvedAt
      ? new Date(incident.resolvedAt).getTime()
      : Date.now()
    const minutes = Math.floor((end - start) / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  const handleCreateIncident = () => {
    if (!newIncident.title.trim()) {
      addToast({ title: 'Title is required', variant: 'error' })
      return
    }
    if (!newIncident.service) {
      addToast({ title: 'Service is required', variant: 'error' })
      return
    }

    const incident: Incident = {
      id: `inc-${Date.now()}`,
      title: newIncident.title,
      description: newIncident.description,
      severity: newIncident.severity,
      status: 'open',
      service: newIncident.service,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `evt-${Date.now()}`,
          type: 'created',
          message: 'Incident created',
          timestamp: new Date().toISOString(),
          user: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
        },
      ],
    }

    addIncident(incident)
    setNewIncident({ title: '', description: '', severity: 'medium', service: '' })
    setIsCreateDialogOpen(false)
    addToast({ title: 'Incident created', description: incident.title, variant: 'success' })
  }

  const handleAcknowledge = (incident: Incident) => {
    if (onAcknowledge) {
      onAcknowledge(incident)
      addToast({ title: 'Incident acknowledged', variant: 'success' })
    }
  }

  const handleResolve = (incident: Incident) => {
    if (onResolve) {
      onResolve(incident)
      addToast({ title: 'Incident resolved', variant: 'success' })
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Incidents</CardTitle>
              {openIncidents.length > 0 && (
                <Badge variant="error">{openIncidents.length} active</Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Incident
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-6">
              {openIncidents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="status-dot critical" />
                    Active Incidents
                  </h4>
                  {openIncidents.map((incident, index) => {
                    const config = severityConfig[incident.severity]
                    const SeverityIcon = config.icon
                    const status = statusConfig[incident.status]

                    return (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md',
                          config.bg,
                          incident.severity === 'critical' && 'ring-1 ring-red-500/30'
                        )}
                        onClick={() => onSelectIncident?.(incident)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={cn('p-2 rounded-lg', config.bg)}>
                              <SeverityIcon className={cn('h-5 w-5', config.color)} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-medium">{incident.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {incident.description}
                              </p>
                              <div className="flex items-center gap-3 pt-1">
                                <Badge variant={config.badge}>{incident.severity}</Badge>
                                <Badge
                                  variant="outline"
                                  className={cn(status.color, status.bg)}
                                >
                                  {status.label}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {getDuration(incident)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(incident.createdAt)}
                            </span>
                            <span>{incident.service}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {incident.assignee ? (
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={incident.assignee.avatar} />
                                  <AvatarFallback className="text-[10px]">
                                    {incident.assignee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{incident.assignee.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unassigned</span>
                            )}
                            {incident.status === 'open' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAcknowledge(incident)
                                }}
                              >
                                Acknowledge
                              </Button>
                            )}
                            {incident.status === 'acknowledged' && (
                              <Button
                                size="sm"
                                className="h-7 bg-emerald-600 hover:bg-emerald-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleResolve(incident)
                                }}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {resolvedIncidents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Recently Resolved
                  </h4>
                  {resolvedIncidents.slice(0, 3).map((incident, index) => (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-lg border bg-card/30 cursor-pointer hover:bg-card/50 transition-colors"
                      onClick={() => onSelectIncident?.(incident)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-medium">{incident.title}</span>
                          <Badge variant="success" className="text-xs">
                            Resolved
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(incident.resolvedAt!)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {incidents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-emerald-500/10 mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h4 className="font-medium">No Active Incidents</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    All systems are operating normally
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Incident</DialogTitle>
            <DialogDescription>
              Report a new incident for tracking and resolution
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the incident"
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of what happened..."
                value={newIncident.description}
                onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={newIncident.severity}
                  onValueChange={(value: any) => setNewIncident({ ...newIncident, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="service">Service</Label>
                <Select
                  value={newIncident.service}
                  onValueChange={(value) => setNewIncident({ ...newIncident, service: value })}
                >
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateIncident}>Create Incident</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
