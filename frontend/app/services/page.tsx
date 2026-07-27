'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Search,
  RefreshCw,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Globe,
  Plus,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { ServiceStatusCard } from '@/components/dashboard/service-status-card'
import { MetricsChart } from '@/components/dashboard/metrics-chart'
import { useAppStore } from '@/store/app-store'
import { mockServices, generateMetricsData } from '@/lib/mock-data'
import { cn, formatPercentage } from '@/lib/utils'
import type { Service } from '@/types'

export default function ServicesPage() {
  const { services, setServices, selectService, selectedService, addService, removeService, addToast } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'healthy' | 'degraded' | 'critical'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    environment: 'production',
    region: 'us-east-1',
  })

  useEffect(() => {
    setServices(mockServices)
  }, [setServices])

  const filteredServices = services.filter((service) => {
    const matchesFilter = filter === 'all' || service.status === filter
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statusCounts = {
    all: services.length,
    healthy: services.filter((s) => s.status === 'healthy').length,
    degraded: services.filter((s) => s.status === 'degraded').length,
    critical: services.filter((s) => s.status === 'critical').length,
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      addToast({ title: 'Services refreshed', variant: 'success' })
    }, 1000)
  }

  const handleAddService = () => {
    if (!newService.name.trim()) {
      addToast({ title: 'Service name is required', variant: 'error' })
      return
    }

    const service: Service = {
      id: `svc-${Date.now()}`,
      name: newService.name,
      status: 'healthy',
      uptime: 99.9 + Math.random() * 0.09,
      latency: Math.floor(Math.random() * 100) + 20,
      errorRate: Math.random() * 0.5,
      lastCheck: new Date().toISOString(),
      environment: newService.environment,
      region: newService.region,
    }

    addService(service)
    setNewService({ name: '', environment: 'production', region: 'us-east-1' })
    setIsAddDialogOpen(false)
    addToast({ title: 'Service added', description: `${service.name} has been added successfully`, variant: 'success' })
  }

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    removeService(serviceId)
    addToast({ title: 'Service removed', description: `${serviceName} has been removed`, variant: 'success' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your microservices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Register a new microservice to monitor
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., api-gateway"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={newService.environment}
                    onValueChange={(value) => setNewService({ ...newService, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={newService.region}
                    onValueChange={(value) => setNewService({ ...newService, region: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                      <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                      <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddService}>Add Service</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="healthy" className="text-emerald-500">
              Healthy ({statusCounts.healthy})
            </TabsTrigger>
            <TabsTrigger value="degraded" className="text-amber-500">
              Degraded ({statusCounts.degraded})
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-red-500">
              Critical ({statusCounts.critical})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ServiceStatusCard
                  service={service}
                  onClick={() => selectService(service)}
                />
              </motion.div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Server className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No services found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedService ? (
            <ServiceDetailPanel
              service={selectedService}
              onDelete={() => handleDeleteService(selectedService.id, selectedService.name)}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Select a Service</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Click on a service card to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ServiceDetailPanel({ service, onDelete }: { service: Service; onDelete: () => void }) {
  const { addToast } = useAppStore()
  const cpuData = generateMetricsData(12)
  const memoryData = generateMetricsData(12)

  const handleViewLogs = () => {
    addToast({ title: 'Opening logs', description: `Viewing logs for ${service.name}` })
  }

  const handleRestart = () => {
    addToast({ title: 'Restarting service', description: `${service.name} is restarting...`, variant: 'warning' })
    setTimeout(() => {
      addToast({ title: 'Service restarted', description: `${service.name} has been restarted successfully`, variant: 'success' })
    }, 2000)
  }

  const handleScale = () => {
    addToast({ title: 'Scaling service', description: `Scaling ${service.name}...` })
  }

  const handleConfigure = () => {
    addToast({ title: 'Configuration', description: `Opening configuration for ${service.name}` })
  }

  return (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{service.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  service.status === 'healthy'
                    ? 'success'
                    : service.status === 'degraded'
                    ? 'warning'
                    : 'error'
                }
              >
                {service.status}
              </Badge>
              <Button variant="ghost" size="icon-sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Region</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {service.region}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Environment</p>
              <p className="text-sm font-medium">{service.environment}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                CPU Usage
              </span>
              <span className="font-medium">67%</span>
            </div>
            <Progress value={67} variant="default" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-500" />
                Memory Usage
              </span>
              <span className="font-medium">54%</span>
            </div>
            <Progress value={54} variant="default" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Network className="h-4 w-4 text-emerald-500" />
                Network I/O
              </span>
              <span className="font-medium">128 MB/s</span>
            </div>
            <Progress value={45} variant="success" />
          </div>
        </CardContent>
      </Card>

      <MetricsChart
        title="CPU History"
        data={cpuData}
        color="#3b82f6"
        unit="%"
        height={150}
      />

      <MetricsChart
        title="Memory History"
        data={memoryData}
        color="#8b5cf6"
        unit="%"
        height={150}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={handleViewLogs}>View Logs</Button>
          <Button variant="outline" size="sm" onClick={handleRestart}>Restart</Button>
          <Button variant="outline" size="sm" onClick={handleScale}>Scale</Button>
          <Button variant="outline" size="sm" onClick={handleConfigure}>Configure</Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
