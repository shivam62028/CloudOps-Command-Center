import { create } from 'zustand'
import type { Service, Incident, Deployment, Alert, Remediation } from '@/types'

interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
}

interface AppState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  services: Service[]
  incidents: Incident[]
  deployments: Deployment[]
  alerts: Alert[]
  remediations: Remediation[]
  selectedService: Service | null
  selectedIncident: Incident | null
  isLoading: boolean
  toasts: ToastMessage[]

  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  setServices: (services: Service[]) => void
  setIncidents: (incidents: Incident[]) => void
  setDeployments: (deployments: Deployment[]) => void
  setAlerts: (alerts: Alert[]) => void
  setRemediations: (remediations: Remediation[]) => void
  selectService: (service: Service | null) => void
  selectIncident: (incident: Incident | null) => void
  setLoading: (loading: boolean) => void
  acknowledgeAlert: (alertId: string) => void
  dismissAlert: (alertId: string) => void
  updateIncidentStatus: (incidentId: string, status: Incident['status']) => void

  addService: (service: Service) => void
  removeService: (serviceId: string) => void
  updateService: (serviceId: string, updates: Partial<Service>) => void

  addIncident: (incident: Incident) => void
  removeIncident: (incidentId: string) => void

  addDeployment: (deployment: Deployment) => void
  updateDeploymentStatus: (deploymentId: string, status: Deployment['status']) => void

  addRemediation: (remediation: Remediation) => void
  updateRemediationStatus: (remediationId: string, status: Remediation['status'], result?: { success: boolean; message: string }) => void

  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (toastId: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'dark',
  sidebarOpen: true,
  services: [],
  incidents: [],
  deployments: [],
  alerts: [],
  remediations: [],
  selectedService: null,
  selectedIncident: null,
  isLoading: false,
  toasts: [],

  setTheme: (theme) => {
    set({ theme })
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setServices: (services) => set({ services }),
  setIncidents: (incidents) => set({ incidents }),
  setDeployments: (deployments) => set({ deployments }),
  setAlerts: (alerts) => set({ alerts }),
  setRemediations: (remediations) => set({ remediations }),

  selectService: (service) => set({ selectedService: service }),
  selectIncident: (incident) => set({ selectedIncident: incident }),

  setLoading: (isLoading) => set({ isLoading }),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    })),

  dismissAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== alertId),
    })),

  updateIncidentStatus: (incidentId, status) =>
    set((state) => ({
      incidents: state.incidents.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              status,
              ...(status === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}),
              ...(status === 'acknowledged' ? { acknowledgedAt: new Date().toISOString() } : {}),
            }
          : incident
      ),
    })),

  addService: (service) =>
    set((state) => ({
      services: [...state.services, service],
    })),

  removeService: (serviceId) =>
    set((state) => ({
      services: state.services.filter((s) => s.id !== serviceId),
      selectedService: state.selectedService?.id === serviceId ? null : state.selectedService,
    })),

  updateService: (serviceId, updates) =>
    set((state) => ({
      services: state.services.map((service) =>
        service.id === serviceId ? { ...service, ...updates } : service
      ),
    })),

  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents],
    })),

  removeIncident: (incidentId) =>
    set((state) => ({
      incidents: state.incidents.filter((i) => i.id !== incidentId),
      selectedIncident: state.selectedIncident?.id === incidentId ? null : state.selectedIncident,
    })),

  addDeployment: (deployment) =>
    set((state) => ({
      deployments: [deployment, ...state.deployments],
    })),

  updateDeploymentStatus: (deploymentId, status) =>
    set((state) => ({
      deployments: state.deployments.map((d) =>
        d.id === deploymentId
          ? {
              ...d,
              status,
              ...(status === 'success' || status === 'failed' ? { completedAt: new Date().toISOString() } : {}),
            }
          : d
      ),
    })),

  addRemediation: (remediation) =>
    set((state) => ({
      remediations: [remediation, ...state.remediations],
    })),

  updateRemediationStatus: (remediationId, status, result) =>
    set((state) => ({
      remediations: state.remediations.map((r) =>
        r.id === remediationId
          ? {
              ...r,
              status,
              ...(status === 'completed' || status === 'failed' ? { completedAt: new Date().toISOString() } : {}),
              ...(result ? { result } : {}),
            }
          : r
      ),
    })),

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
    setTimeout(() => {
      get().removeToast(id)
    }, 4000)
  },

  removeToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== toastId),
    })),
}))
