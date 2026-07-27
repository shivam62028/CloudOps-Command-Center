'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Plus,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAppStore } from '@/store/app-store'
import { mockIncidents } from '@/lib/mock-data'
import { cn, formatDate } from '@/lib/utils'
import type { Incident, IncidentEvent } from '@/types'

export default function IncidentsPage() {
  const { incidents, setIncidents, updateIncidentStatus, addIncident, addToast, services } = useAppStore()
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'acknowledged' | 'resolved'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    service: '',
  })

  useEffect(() => {
    setIncidents(mockIncidents)
  }, [setIncidents])

  useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      const openIncident = incidents.find((i) => i.status === 'open')
      setSelectedIncident(openIncident || incidents[0])
    }
  }, [incidents, selectedIncident])

  const filteredIncidents = incidents.filter((incident) => {
    if (statusFilter === 'all') return true
    return incident.status === statusFilter
  })

  const stats = {
    open: incidents.filter((i) => i.status === 'open').length,
    acknowledged: incidents.filter((i) => i.status === 'acknowledged').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
    mttr: '45m',
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
    setSelectedIncident(incident)
    addToast({ title: 'Incident created', description: incident.title, variant: 'success' })
  }

  const handleAcknowledge = (incidentId: string) => {
    updateIncidentStatus(incidentId, 'acknowledged')
    addToast({ title: 'Incident acknowledged', variant: 'success' })
  }

  const handleResolve = (incidentId: string) => {
    updateIncidentStatus(incidentId, 'resolved')
    addToast({ title: 'Incident resolved', variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground mt-1">
            Track and resolve service incidents
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Incident
            </Button>
          </DialogTrigger>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-red-500">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold text-amber-500">{stats.acknowledged}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved (24h)</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg MTTR</p>
                <p className="text-2xl font-bold text-blue-500">{stats.mttr}</p>
              </div>
              <Timer className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Incidents</CardTitle>
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
                    <TabsTrigger value="open" className="text-xs px-2">Open</TabsTrigger>
                    <TabsTrigger value="acknowledged" className="text-xs px-2">Ack</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-2 pr-4">
                  {filteredIncidents.map((incident) => (
                    <motion.div
                      key={incident.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                        selectedIncident?.id === incident.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50',
                        incident.status === 'open' && incident.severity === 'critical' && 'border-red-500/50'
                      )}
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{incident.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{incident.service}</p>
                        </div>
                        <Badge
                          variant={
                            incident.severity === 'critical'
                              ? 'error'
                              : incident.severity === 'high'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="shrink-0"
                        >
                          {incident.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(incident.createdAt)}</span>
                        <Badge
                          variant={
                            incident.status === 'open'
                              ? 'error'
                              : incident.status === 'acknowledged'
                              ? 'warning'
                              : 'success'
                          }
                          className="text-[10px]"
                        >
                          {incident.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedIncident ? (
            <IncidentDetail
              incident={selectedIncident}
              onAcknowledge={() => handleAcknowledge(selectedIncident.id)}
              onResolve={() => handleResolve(selectedIncident.id)}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select an incident to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function IncidentDetail({
  incident,
  onAcknowledge,
  onResolve,
}: {
  incident: Incident
  onAcknowledge: () => void
  onResolve: () => void
}) {
  const { addToast } = useAppStore()
  const [comment, setComment] = useState('')

  const getDuration = () => {
    const start = new Date(incident.createdAt).getTime()
    const end = incident.resolvedAt
      ? new Date(incident.resolvedAt).getTime()
      : Date.now()
    const minutes = Math.floor((end - start) / 60000)
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  const handleAddComment = () => {
    if (!comment.trim()) {
      addToast({ title: 'Comment cannot be empty', variant: 'error' })
      return
    }
    addToast({ title: 'Comment added', description: 'Your comment has been added to the timeline', variant: 'success' })
    setComment('')
  }

  return (
    <motion.div
      key={incident.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={incident.severity === 'critical' ? 'error' : 'warning'}>
                  {incident.severity.toUpperCase()}
                </Badge>
                <Badge
                  variant={
                    incident.status === 'open'
                      ? 'error'
                      : incident.status === 'acknowledged'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {incident.status}
                </Badge>
              </div>
              <CardTitle className="text-xl">{incident.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {incident.status === 'open' && (
                <Button variant="outline" onClick={onAcknowledge}>
                  Acknowledge
                </Button>
              )}
              {incident.status === 'acknowledged' && (
                <Button variant="default" onClick={onResolve} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{incident.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Service</p>
              <p className="text-sm font-medium">{incident.service}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {getDuration()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formatDate(incident.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Assignee</p>
              {incident.assignee ? (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {incident.assignee.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{incident.assignee.name}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {incident.timeline.map((event, index) => (
                <TimelineEvent key={event.id} event={event} isLast={index === incident.timeline.length - 1} />
              ))}
              {incident.timeline.length === 0 && (
                <p className="text-sm text-muted-foreground pl-10">No timeline events yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                placeholder="Add a comment or update..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-20 rounded-lg border bg-background p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={handleAddComment}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TimelineEvent({ event, isLast }: { event: IncidentEvent; isLast: boolean }) {
  const typeConfig = {
    created: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500' },
    acknowledged: { icon: User, color: 'text-amber-500', bg: 'bg-amber-500' },
    updated: { icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500' },
    resolved: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    comment: { icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-500' },
    escalated: { icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500' },
  }

  const config = typeConfig[event.type]

  return (
    <div className="relative pl-10">
      <div
        className={cn(
          'absolute left-2.5 w-3 h-3 rounded-full border-2 border-background',
          config.bg
        )}
      />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium capitalize">{event.type}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(event.timestamp)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{event.message}</p>
        {event.user && (
          <div className="flex items-center gap-1.5 mt-1">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px]">
                {event.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{event.user.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
