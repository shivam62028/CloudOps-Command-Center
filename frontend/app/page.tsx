'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Server,
  AlertTriangle,
  Rocket,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  DollarSign,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { ServiceStatusCard } from '@/components/dashboard/service-status-card'
import { MetricsChart, MultiMetricsChart } from '@/components/dashboard/metrics-chart'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { DeploymentPipeline } from '@/components/deployments/deployment-pipeline'
import { IncidentList } from '@/components/incidents/incident-list'
import { RemediationPanel } from '@/components/remediation/remediation-panel'
import { useAppStore } from '@/store/app-store'
import {
  mockServices,
  mockIncidents,
  mockDeployments,
  mockAlerts,
  mockRemediations,
  generateMetricsData,
  generateRequestsData,
} from '@/lib/mock-data'

export default function DashboardPage() {
  const {
    setServices,
    setIncidents,
    setDeployments,
    setAlerts,
    setRemediations,
    services,
    incidents,
    deployments,
    alerts,
    remediations,
    acknowledgeAlert,
    updateIncidentStatus,
  } = useAppStore()

  useEffect(() => {
    setServices(mockServices)
    setIncidents(mockIncidents)
    setDeployments(mockDeployments)
    setAlerts(mockAlerts)
    setRemediations(mockRemediations)
  }, [setServices, setIncidents, setDeployments, setAlerts, setRemediations])

  const healthyServices = services.filter((s) => s.status === 'healthy').length
  const activeIncidents = incidents.filter((i) => i.status !== 'resolved').length
  const runningDeployments = deployments.filter((d) => d.status === 'running').length

  const cpuData = generateMetricsData(24)
  const requestsData = generateRequestsData(24)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of your infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Services Health"
          value={`${healthyServices}/${services.length}`}
          subtitle="Services operational"
          icon={Server}
          variant={healthyServices === services.length ? 'success' : 'warning'}
          trend={{ value: 2.5, isPositive: true }}
        />
        <StatCard
          title="Active Incidents"
          value={activeIncidents}
          subtitle={activeIncidents === 0 ? 'All clear' : 'Requires attention'}
          icon={AlertTriangle}
          variant={activeIncidents === 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Deployments Today"
          value={deployments.length}
          subtitle={`${runningDeployments} in progress`}
          icon={Rocket}
          variant="info"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Monthly Cost"
          value="$12,458"
          subtitle="vs $11,890 last month"
          icon={DollarSign}
          variant="default"
          trend={{ value: 4.8, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricsChart
              title="CPU Usage"
              data={cpuData}
              color="#3b82f6"
              unit="%"
            />
            <MetricsChart
              title="Memory Usage"
              data={generateMetricsData(24)}
              color="#8b5cf6"
              unit="%"
            />
          </div>

          <MultiMetricsChart
            title="Request Traffic"
            data={requestsData}
            lines={[
              { key: 'requests', color: '#3b82f6', label: 'Requests' },
              { key: 'errors', color: '#ef4444', label: 'Errors' },
            ]}
            height={280}
          />

          <div>
            <h2 className="text-lg font-semibold mb-4">Service Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {services.map((service) => (
                <ServiceStatusCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AlertsPanel
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
          />
          <RemediationPanel remediations={remediations} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncidentList
          incidents={incidents}
          onAcknowledge={(incident) => updateIncidentStatus(incident.id, 'acknowledged')}
          onResolve={(incident) => updateIncidentStatus(incident.id, 'resolved')}
        />
        <DeploymentPipeline deployments={deployments} />
      </div>
    </div>
  )
}
