'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GitBranch,
  GitCommit,
  Package,
  TestTube,
  Rocket,
  Check,
  X,
  Loader2,
  Clock,
  ChevronRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatDate } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Deployment } from '@/types'

interface DeploymentPipelineProps {
  deployments: Deployment[]
  onViewDetails?: (deployment: Deployment) => void
  onRollback?: (deployment: Deployment) => void
}

export function DeploymentPipeline({
  deployments,
  onViewDetails,
  onRollback,
}: DeploymentPipelineProps) {
  const { addToast } = useAppStore()
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false)
  const [newDeployment, setNewDeployment] = useState({
    service: '',
    environment: 'staging',
    branch: 'main',
  })

  const stageIcons = {
    Build: Package,
    Test: TestTube,
    Deploy: Rocket,
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-slate-400',
      bg: 'bg-slate-400/10',
    },
    running: {
      icon: Loader2,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    success: {
      icon: Check,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    failed: {
      icon: X,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    cancelled: {
      icon: X,
      color: 'text-slate-400',
      bg: 'bg-slate-400/10',
    },
  }

  const handleDeploy = () => {
    if (!newDeployment.service) {
      addToast({ title: 'Please select a service', variant: 'error' })
      return
    }

    addToast({
      title: 'Deployment started',
      description: `Deploying ${newDeployment.service} to ${newDeployment.environment}`,
      variant: 'success'
    })
    setIsDeployDialogOpen(false)
    setNewDeployment({ service: '', environment: 'staging', branch: 'main' })
  }

  const handleRollback = (deployment: Deployment) => {
    if (onRollback) {
      onRollback(deployment)
    }
    addToast({
      title: 'Rollback initiated',
      description: `Rolling back ${deployment.service}...`,
      variant: 'warning'
    })
  }

  const handleViewDetails = (deployment: Deployment) => {
    if (onViewDetails) {
      onViewDetails(deployment)
    }
    addToast({
      title: 'Viewing deployment',
      description: deployment.name
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Deployment Pipeline</CardTitle>
              <Badge variant="secondary">
                {deployments.filter((d) => d.status === 'running').length} running
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsDeployDialogOpen(true)}>
              <GitBranch className="h-4 w-4 mr-1" />
              Deploy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {deployments.map((deployment, index) => {
                const config = statusConfig[deployment.status]
                const StatusIcon = config.icon

                return (
                  <motion.div
                    key={deployment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'p-4 rounded-xl border bg-card/50 hover:bg-card transition-all duration-200',
                      deployment.status === 'running' && 'ring-1 ring-blue-500/30'
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg', config.bg)}>
                          <StatusIcon
                            className={cn(
                              'h-5 w-5',
                              config.color,
                              deployment.status === 'running' && 'animate-spin'
                            )}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{deployment.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{deployment.service}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {deployment.environment}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {deployment.status === 'success' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRollback(deployment)}
                          >
                            Rollback
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleViewDetails(deployment)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-4">
                      {deployment.stages.map((stage, stageIndex) => {
                        const StageIcon = stageIcons[stage.name as keyof typeof stageIcons] || Package
                        const stageConfig = statusConfig[stage.status]
                        const StageStatusIcon = stageConfig.icon

                        return (
                          <div key={stage.id} className="flex items-center flex-1">
                            <div
                              className={cn(
                                'flex-1 flex items-center gap-2 p-2 rounded-lg',
                                stageConfig.bg
                              )}
                            >
                              <StageIcon className={cn('h-4 w-4', stageConfig.color)} />
                              <span className="text-sm font-medium">{stage.name}</span>
                              <StageStatusIcon
                                className={cn(
                                  'h-3.5 w-3.5 ml-auto',
                                  stageConfig.color,
                                  stage.status === 'running' && 'animate-spin'
                                )}
                              />
                            </div>
                            {stageIndex < deployment.stages.length - 1 && (
                              <div className="w-4 h-px bg-border mx-1" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <GitCommit className="h-3.5 w-3.5" />
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {deployment.commit.sha}
                          </code>
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {deployment.commit.message}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={deployment.triggeredBy.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {deployment.triggeredBy.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{formatDate(deployment.startedAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
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
            <Button onClick={handleDeploy}>
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
