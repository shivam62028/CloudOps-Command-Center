'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wrench,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Zap,
  Server,
  Database,
  HardDrive,
  Plus,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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

const initialActions = [
  {
    id: '1',
    name: 'Restart Pods',
    description: 'Restart unhealthy pods in the affected service',
    icon: RefreshCw,
    status: 'available' as const,
    lastRun: '2 hours ago',
    successRate: 94,
  },
  {
    id: '2',
    name: 'Scale Service',
    description: 'Automatically scale up service replicas',
    icon: Server,
    status: 'available' as const,
    lastRun: '5 minutes ago',
    successRate: 98,
  },
  {
    id: '3',
    name: 'Clear Cache',
    description: 'Flush Redis/Memcached cache for the service',
    icon: Zap,
    status: 'available' as const,
    lastRun: '1 day ago',
    successRate: 100,
  },
  {
    id: '4',
    name: 'Rollback Deployment',
    description: 'Revert to the previous stable version',
    icon: HardDrive,
    status: 'available' as const,
    lastRun: '3 days ago',
    successRate: 89,
  },
  {
    id: '5',
    name: 'Reset DB Connections',
    description: 'Reset database connection pool',
    icon: Database,
    status: 'available' as const,
    lastRun: '12 hours ago',
    successRate: 96,
  },
]

const initialExecutions = [
  {
    id: '1',
    action: 'Scale Service',
    service: 'api-gateway',
    trigger: 'auto',
    status: 'success' as const,
    timestamp: '10 minutes ago',
    duration: '45s',
  },
  {
    id: '2',
    action: 'Restart Pods',
    service: 'user-service',
    trigger: 'manual',
    status: 'success' as const,
    timestamp: '2 hours ago',
    duration: '1m 20s',
  },
  {
    id: '3',
    action: 'Clear Cache',
    service: 'payment-service',
    trigger: 'auto',
    status: 'failed' as const,
    timestamp: '4 hours ago',
    duration: '15s',
    error: 'Connection timeout',
  },
  {
    id: '4',
    action: 'Rollback Deployment',
    service: 'notification-service',
    trigger: 'manual',
    status: 'success' as const,
    timestamp: '1 day ago',
    duration: '2m 10s',
  },
]

export default function RemediationPage() {
  const { addToast } = useAppStore()
  const [actions, setActions] = useState(initialActions)
  const [executions, setExecutions] = useState(initialExecutions)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<typeof initialActions[0] | null>(null)
  const [targetService, setTargetService] = useState('')
  const [newAction, setNewAction] = useState({
    name: '',
    description: '',
    type: 'restart',
  })

  const stats = {
    total: actions.length,
    autoTriggered: executions.filter(e => e.trigger === 'auto').length,
    successRate: Math.round(executions.filter(e => e.status === 'success').length / executions.length * 100),
    avgResolution: '1m 45s',
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      addToast({ title: 'Remediation data refreshed', variant: 'success' })
    }, 1000)
  }

  const handleRunAction = (action: typeof initialActions[0]) => {
    setSelectedAction(action)
    setIsRunDialogOpen(true)
  }

  const executeAction = () => {
    if (!targetService) {
      addToast({ title: 'Please select a service', variant: 'error' })
      return
    }

    // Update action to running
    setActions(prev => prev.map(a =>
      a.id === selectedAction?.id
        ? { ...a, status: 'running' as const, progress: 0 }
        : a
    ))

    setIsRunDialogOpen(false)
    addToast({
      title: `Running ${selectedAction?.name}`,
      description: `Executing on ${targetService}...`,
      variant: 'warning'
    })

    // Add to executions
    const newExecution = {
      id: `exec-${Date.now()}`,
      action: selectedAction?.name || '',
      service: targetService,
      trigger: 'manual',
      status: 'running' as const,
      timestamp: 'Just now',
      duration: '0s',
    }
    setExecutions(prev => [newExecution, ...prev])

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      setActions(prev => prev.map(a =>
        a.id === selectedAction?.id
          ? { ...a, progress }
          : a
      ))

      if (progress >= 100) {
        clearInterval(interval)
        const success = Math.random() > 0.2

        setActions(prev => prev.map(a =>
          a.id === selectedAction?.id
            ? { ...a, status: 'available' as const, lastRun: 'Just now', progress: undefined }
            : a
        ))

        setExecutions(prev => prev.map(e =>
          e.id === newExecution.id
            ? {
                ...e,
                status: success ? 'success' as const : 'failed' as const,
                duration: '45s',
                ...(success ? {} : { error: 'Operation timed out' })
              }
            : e
        ))

        addToast({
          title: success ? 'Remediation completed' : 'Remediation failed',
          description: success
            ? `${selectedAction?.name} completed successfully`
            : `${selectedAction?.name} failed - check logs`,
          variant: success ? 'success' : 'error'
        })
      }
    }, 500)

    setTargetService('')
    setSelectedAction(null)
  }

  const handleCreateAction = () => {
    if (!newAction.name.trim()) {
      addToast({ title: 'Action name is required', variant: 'error' })
      return
    }

    const action = {
      id: `action-${Date.now()}`,
      name: newAction.name,
      description: newAction.description || 'Custom remediation action',
      icon: Wrench,
      status: 'available' as const,
      lastRun: 'Never',
      successRate: 0,
    }

    setActions(prev => [...prev, action])
    setIsCreateDialogOpen(false)
    setNewAction({ name: '', description: '', type: 'restart' })
    addToast({ title: 'Action created', description: action.name, variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Remediation</h1>
          <p className="text-muted-foreground mt-1">
            Automated and manual remediation actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Action
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Remediation Action</DialogTitle>
                <DialogDescription>
                  Define a new automated remediation action
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Action Name</Label>
                  <Input
                    placeholder="e.g., Flush DNS Cache"
                    value={newAction.name}
                    onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="What does this action do?"
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select
                    value={newAction.type}
                    onValueChange={(value) => setNewAction({ ...newAction, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restart">Restart</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                      <SelectItem value="rollback">Rollback</SelectItem>
                      <SelectItem value="clear-cache">Clear Cache</SelectItem>
                      <SelectItem value="custom">Custom Script</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAction}>Create Action</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auto-Triggered</p>
                <p className="text-2xl font-bold">{stats.autoTriggered}</p>
              </div>
              <Zap className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.successRate}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{stats.avgResolution}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action, index) => {
              const Icon = action.icon
              const isRunning = action.status === 'running'
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{action.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-medium">{action.successRate}%</span>
                    </div>
                    <Progress value={action.successRate} variant="success" />
                    {isRunning && (action as any).progress !== undefined && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{(action as any).progress}%</span>
                        </div>
                        <Progress value={(action as any).progress} />
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Last run: {action.lastRun}
                      </span>
                      <Button
                        size="sm"
                        variant={isRunning ? 'outline' : 'default'}
                        disabled={isRunning}
                        onClick={() => handleRunAction(action)}
                      >
                        {isRunning ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            Running
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 mr-1" />
                            Run
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run {selectedAction?.name}</DialogTitle>
            <DialogDescription>
              {selectedAction?.description}
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {executions.map((execution, index) => (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      execution.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : execution.status === 'running'
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {execution.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : execution.status === 'running' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{execution.action}</p>
                      <Badge variant="outline">{execution.service}</Badge>
                      <Badge
                        variant={execution.trigger === 'auto' ? 'warning' : 'default'}
                      >
                        {execution.trigger}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {execution.error || `Completed in ${execution.duration}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      execution.status === 'success'
                        ? 'success'
                        : execution.status === 'running'
                        ? 'default'
                        : 'error'
                    }
                  >
                    {execution.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {execution.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
