'use client'

import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  Network,
  Calendar,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const costOverview = [
  { name: 'Total Spend', value: '$47,832', change: '+5.2%', trend: 'up', icon: DollarSign },
  { name: 'Compute', value: '$23,456', change: '-2.1%', trend: 'down', icon: Cpu },
  { name: 'Storage', value: '$12,890', change: '+8.3%', trend: 'up', icon: HardDrive },
  { name: 'Network', value: '$11,486', change: '+3.7%', trend: 'up', icon: Network },
]

const servicesCosts = [
  {
    id: '1',
    name: 'api-gateway',
    cost: 8450,
    budget: 10000,
    change: -5.2,
    resources: { compute: 5200, storage: 1800, network: 1450 },
  },
  {
    id: '2',
    name: 'user-service',
    cost: 6230,
    budget: 6000,
    change: 12.5,
    resources: { compute: 3800, storage: 1200, network: 1230 },
  },
  {
    id: '3',
    name: 'payment-service',
    cost: 7890,
    budget: 8500,
    change: -2.1,
    resources: { compute: 4500, storage: 2100, network: 1290 },
  },
  {
    id: '4',
    name: 'notification-service',
    cost: 3420,
    budget: 4000,
    change: 1.8,
    resources: { compute: 1800, storage: 800, network: 820 },
  },
  {
    id: '5',
    name: 'search-service',
    cost: 5680,
    budget: 5500,
    change: 8.4,
    resources: { compute: 3200, storage: 1500, network: 980 },
  },
]

const recommendations = [
  {
    id: '1',
    title: 'Right-size api-gateway instances',
    description: 'CPU utilization is below 30%. Consider downsizing from m5.xlarge to m5.large.',
    savings: 2400,
    effort: 'low',
    impact: 'medium',
  },
  {
    id: '2',
    title: 'Use Reserved Instances for user-service',
    description: 'Stable workload pattern detected. Reserved instances could save 35%.',
    savings: 2180,
    effort: 'medium',
    impact: 'high',
  },
  {
    id: '3',
    title: 'Clean up unused EBS volumes',
    description: '12 unattached EBS volumes detected totaling 2.4TB.',
    savings: 580,
    effort: 'low',
    impact: 'low',
  },
  {
    id: '4',
    title: 'Optimize data transfer costs',
    description: 'Consider using VPC endpoints for S3 to reduce NAT gateway costs.',
    savings: 890,
    effort: 'medium',
    impact: 'medium',
  },
]

export default function CostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cost Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and optimize your cloud spending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="month">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {costOverview.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {item.trend === 'up' ? (
                        <TrendingUp className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span
                        className={`text-xs ${
                          item.trend === 'up' ? 'text-red-500' : 'text-emerald-500'
                        }`}
                      >
                        {item.change} vs last month
                      </span>
                    </div>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cost by Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicesCosts.map((service, index) => {
                  const budgetUsage = (service.cost / service.budget) * 100
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Server className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${service.cost.toLocaleString()} / ${service.budget.toLocaleString()} budget
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {service.change > 0 ? (
                              <TrendingUp className="h-4 w-4 text-red-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-emerald-500" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                service.change > 0 ? 'text-red-500' : 'text-emerald-500'
                              }`}
                            >
                              {service.change > 0 ? '+' : ''}{service.change}%
                            </span>
                          </div>
                          <Badge
                            variant={budgetUsage > 100 ? 'error' : budgetUsage > 80 ? 'warning' : 'success'}
                          >
                            {budgetUsage.toFixed(0)}% of budget
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={Math.min(budgetUsage, 100)}
                        variant={budgetUsage > 100 ? 'error' : budgetUsage > 80 ? 'warning' : 'default'}
                      />
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3.5 w-3.5" />
                          ${service.resources.compute.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3.5 w-3.5" />
                          ${service.resources.storage.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Network className="h-3.5 w-3.5" />
                          ${service.resources.network.toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-emerald-500">$6,050</p>
                <p className="text-sm text-muted-foreground">Potential monthly savings</p>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {rec.description}
                        </p>
                      </div>
                      <Badge variant="success" className="ml-2 shrink-0">
                        -${rec.savings}/mo
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Effort: {rec.effort}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Impact: {rec.impact}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
