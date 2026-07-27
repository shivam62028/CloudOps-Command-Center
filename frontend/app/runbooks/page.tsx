'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Tag,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const runbooks = [
  {
    id: '1',
    title: 'High CPU Usage Response',
    description: 'Steps to diagnose and resolve high CPU usage on production services',
    category: 'Performance',
    severity: 'high',
    lastUpdated: '2 days ago',
    author: 'John Doe',
    executionCount: 45,
    avgDuration: '15 mins',
    steps: 8,
    tags: ['cpu', 'performance', 'scaling'],
  },
  {
    id: '2',
    title: 'Database Connection Pool Exhaustion',
    description: 'Troubleshooting guide for database connection pool issues',
    category: 'Database',
    severity: 'critical',
    lastUpdated: '1 week ago',
    author: 'Jane Smith',
    executionCount: 23,
    avgDuration: '20 mins',
    steps: 12,
    tags: ['database', 'postgresql', 'connections'],
  },
  {
    id: '3',
    title: 'Service Deployment Rollback',
    description: 'Procedure for rolling back a failed deployment',
    category: 'Deployment',
    severity: 'high',
    lastUpdated: '3 days ago',
    author: 'Bob Wilson',
    executionCount: 67,
    avgDuration: '10 mins',
    steps: 6,
    tags: ['deployment', 'rollback', 'kubernetes'],
  },
  {
    id: '4',
    title: 'Memory Leak Investigation',
    description: 'Guide for identifying and resolving memory leaks',
    category: 'Performance',
    severity: 'medium',
    lastUpdated: '5 days ago',
    author: 'Alice Brown',
    executionCount: 18,
    avgDuration: '30 mins',
    steps: 15,
    tags: ['memory', 'debugging', 'profiling'],
  },
  {
    id: '5',
    title: 'SSL Certificate Renewal',
    description: 'Steps to renew and deploy SSL certificates',
    category: 'Security',
    severity: 'medium',
    lastUpdated: '2 weeks ago',
    author: 'Charlie Davis',
    executionCount: 12,
    avgDuration: '25 mins',
    steps: 10,
    tags: ['ssl', 'certificates', 'security'],
  },
  {
    id: '6',
    title: 'Redis Cache Failure Recovery',
    description: 'Recovery procedures for Redis cache failures',
    category: 'Infrastructure',
    severity: 'high',
    lastUpdated: '4 days ago',
    author: 'Diana Evans',
    executionCount: 31,
    avgDuration: '12 mins',
    steps: 7,
    tags: ['redis', 'cache', 'recovery'],
  },
]

const categories = ['All', 'Performance', 'Database', 'Deployment', 'Security', 'Infrastructure']

export default function RunbooksPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRunbooks = runbooks.filter((runbook) => {
    const matchesCategory = selectedCategory === 'All' || runbook.category === selectedCategory
    const matchesSearch = runbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runbook.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Runbooks</h1>
          <p className="text-muted-foreground mt-1">
            Operational procedures and troubleshooting guides
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Runbook
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Runbooks</p>
                <p className="text-2xl font-bold">{runbooks.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Executions Today</p>
                <p className="text-2xl font-bold">14</p>
              </div>
              <Play className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">18m</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-500">96%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search runbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRunbooks.map((runbook, index) => (
          <motion.div
            key={runbook.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{runbook.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {runbook.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge
                    variant={
                      runbook.severity === 'critical'
                        ? 'error'
                        : runbook.severity === 'high'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {runbook.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {runbook.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {runbook.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                  <div>
                    <p className="text-lg font-semibold">{runbook.steps}</p>
                    <p className="text-xs text-muted-foreground">Steps</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{runbook.executionCount}</p>
                    <p className="text-xs text-muted-foreground">Runs</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{runbook.avgDuration}</p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {runbook.author}
                  </div>
                  <Button size="sm">
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredRunbooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No runbooks found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  )
}
