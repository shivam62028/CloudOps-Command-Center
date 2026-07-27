'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Rocket,
  GitBranch,
  GitCommit,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Plus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'

const initialDeployments = [
  {
    id: '1',
    service: 'api-gateway',
    version: 'v2.4.1',
    environment: 'production',
    status: 'success' as const,
    branch: 'main',
    commit: 'a3f8c2d',
    author: 'John Doe',
    timestamp: '2 hours ago',
    duration: '4m 32s',
  },
  {
    id: '2',
    service: 'user-service',
    version: 'v1.8.0',
    environment: 'staging',
    status: 'in_progress' as const,
    branch: 'feature/auth-v2',
    commit: 'b7e9f1a',
    author: 'Jane Smith',
    timestamp: '15 minutes ago',
    duration: '2m 10s',
    progress: 65,
  },
  {
    id: '3',
    service: 'payment-service',
    version: 'v3.2.0',
    environment: 'production',
    status: 'failed' as const,
    branch: 'hotfix/payment-bug',
    commit: 'c4d2e8f',
    author: 'Bob Wilson',
    timestamp: '1 hour ago',
    duration: '1m 45s',
    error: 'Health check failed after deployment',
  },
  {
    id: '4',
    service: 'notification-service',
    version: 'v1.2.3',
    environment: 'development',
    status: 'pending' as const,
    branch: 'develop',
    commit: 'd9a1b3c',
    author: 'Alice Brown',
    timestamp: '5 minutes ago',
    duration: '-',
  },
]

const pipelineStages = [
  { name: 'Build', status: 'success', duration: '1m 20s' },
  { name: 'Test', status: 'success', duration: '2m 45s' },
  { name: 'Security Scan', status: 'success', duration: '0m 58s' },
  { name: 'Deploy', status: 'in_progress', duration: '1m 10s' },
  { name: 'Health Check', status: 'pending', duration: '-' },
]

export default function DeploymentsPage() {
  const { addToast } = useAppStore()
  const [deployments, setDeployments] = useState(initialDeployments)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false)
  const [newDeployment, setNewDeployment] = useState({
    service: '',
    environment: 'staging',
    branch: 'main',
  })

  const stats = {
    total: deployments.length,
    successful: deployments.filter(d => d.status === 'success').length,
    failed: deployments.filter(d => d.status === 'failed').length,
    inProgress: deployments.filter(d => d.status === 'in_progress').length,
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      addToast({ title: 'Deployments refreshed', variant: 'success' })
    }, 1000)
  }

  const handleNewDeployment = () => {
    if (!newDeployment.service) {
      addToast({ title: 'Please select a service', variant: 'error' })
      return
    }

    const deployment = {
      id: `dep-${Date.now()}`,
      service: newDeployment.service,
      version: `v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      environment: newDeployment.environment,
      status: 'in_progress' as const,
      branch: newDeployment.branch,
      commit: Math.random().toString(36).substring(2, 9),
      author: 'John Doe',
      timestamp: 'Just now',
      duration: '0m 0s',
      progress: 0,
    }

    setDeployments([deployment, ...deployments])
    setIsDeployDialogOpen(false)
    setNewDeployment({ service: '', environment: 'staging', branch: 'main' })
    addToast({
      title: 'Deployment started',
      description: `Deploying ${deployment.service} to ${deployment.environment}`,
      variant: 'success'
    })

    // Simulate deployment progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      if (progress >= 100) {
        clearInterval(interval)
        setDeployments(prev => prev.map(d =>
          d.id === deployment.id
            ? { ...d, status: 'success' as const, progress: 100, duration: '3m 45s' }
            : d
        ))
        addToast({
          title: 'Deployment completed',
          description: `${deployment.service} deployed successfully`,
          variant: 'success'
        })
      } else {
        setDeployments(prev => prev.map(d =>
          d.id === deployment.id ? { ...d, progress } : d
        ))
      }
    }, 500)
  }

  const handleRetry = (deployment: typeof deployments[0]) => {
    setDeployments(prev => prev.map(d =>
      d.id === deployment.id
        ? { ...d, status: 'in_progress' as const, progress: 0, error: undefined }
        : d
    ))
    addToast({
      title: 'Retrying deployment',
      description: `Retrying ${deployment.service}...`,
      variant: 'warning'
    })

    // Simulate retry
    setTimeout(() => {
      setDeployments(prev => prev.map(d =>
        d.id === deployment.id
          ? { ...d, status: 'success' as const, progress: 100 }
          : d
      ))
      addToast({
        title: 'Deployment succeeded',
        description: `${deployment.service} deployed successfully`,
        variant: 'success'
      })
    }, 3000)
  }

  const handlePause = (deployment: typeof deployments[0]) => {
    setDeployments(prev => prev.map(d =>
      d.id === deployment.id
        ? { ...d, status: 'pending' as const }
        : d
    ))
    addToast({
      title: 'Deployment paused',
      description: `${deployment.service} deployment paused`,
      variant: 'warning'
    })
  }

  const handleResume = (deployment: typeof deployments[0]) => {
    setDeployments(prev => prev.map(d =>
      d.id === deployment.id
        ? { ...d, status: 'in_progress' as const, progress: (d.progress || 50) }
        : d
    ))
    addToast({
      title: 'Deployment resumed',
      description: `${deployment.service} deployment resumed`,
      variant: 'success'
    })

    // Simulate completion
    setTimeout(() => {
      setDeployments(prev => prev.map(d =>
        d.id === deployment.id
          ? { ...d, status: 'success' as const, progress: 100 }
          : d
      ))
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your deployment pipelines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Rocket className="h-4 w-4 mr-2" />
                New Deployment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Deployment</DialogTitle>
                <DialogDescription>
                  Deploy a service to the selected environment
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Service</Label>
                  <Select
                    value={newDeployment.service}
                    onValueChange={(value) => setNewDeployment({ ...newDeployment, service: value })}
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
                <div className="grid gap-2">
                  <Label>Environment</Label>
                  <Select
                    value={newDeployment.environment}
                    onValueChange={(value) => setNewDeployment({ ...newDeployment, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Branch</Label>
                  <Input
                    value={newDeployment.branch}
                    onChange={(e) => setNewDeployment({ ...newDeployment, branch: e.target.value })}
                    placeholder="main"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleNewDeployment}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy
                </Button>
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
                <p className="text-sm text-muted-foreground">Total Today</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Rocket className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-emerald-500">{stats.successful}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-amber-500">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {pipelineStages.map((stage, index) => (
              <div key={stage.name} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      stage.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : stage.status === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-500 animate-pulse'
                        : stage.status === 'failed'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {stage.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : stage.status === 'in_progress' ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : stage.status === 'failed' ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-xs font-medium mt-2">{stage.name}</p>
                  <p className="text-xs text-muted-foreground">{stage.duration}</p>
                </div>
                {index < pipelineStages.length - 1 && (
                  <div
                    className={`h-0.5 w-12 mx-2 ${
                      stage.status === 'success' ? 'bg-emerald-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((deployment, index) => (
              <motion.div
                key={deployment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      deployment.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : deployment.status === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-500'
                        : deployment.status === 'failed'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}
                  >
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{deployment.service}</p>
                      <Badge variant="outline">{deployment.version}</Badge>
                      <Badge
                        variant={
                          deployment.environment === 'production'
                            ? 'error'
                            : deployment.environment === 'staging'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {deployment.environment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3.5 w-3.5" />
                        {deployment.branch}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitCommit className="h-3.5 w-3.5" />
                        {deployment.commit}
                      </span>
                      <span>{deployment.author}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {deployment.status === 'in_progress' && deployment.progress !== undefined && (
                    <div className="w-32">
                      <Progress value={deployment.progress} />
                    </div>
                  )}
                  <div className="text-right">
                    <Badge
                      variant={
                        deployment.status === 'success'
                          ? 'success'
                          : deployment.status === 'in_progress'
                          ? 'default'
                          : deployment.status === 'failed'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {deployment.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deployment.timestamp}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {deployment.status === 'failed' && (
                      <Button variant="ghost" size="icon-sm" onClick={() => handleRetry(deployment)}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    {deployment.status === 'in_progress' && (
                      <Button variant="ghost" size="icon-sm" onClick={() => handlePause(deployment)}>
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {deployment.status === 'pending' && (
                      <Button variant="ghost" size="icon-sm" onClick={() => handleResume(deployment)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
