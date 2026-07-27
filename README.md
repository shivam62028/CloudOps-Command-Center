# CloudOps Command Center

A full-stack DevOps/SRE Operations Platform showcasing infrastructure management, real-time monitoring, incident handling, and automated remediation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Kubernetes](https://img.shields.io/badge/kubernetes-ready-326CE5.svg)

## Features

### 🖥️ Operations Dashboard
- Real-time infrastructure monitoring
- Service health status with live updates
- Deployment pipeline visualization
- Cost tracking and optimization insights

### 🚨 Incident Management
- Automated alert routing and escalation
- Incident timeline with audit trail
- Runbook integration and execution
- Post-mortem report generation

### 🔧 Automated Remediation
- Self-healing infrastructure scripts
- Pod restart and scaling automation
- Cache clearing and service recovery
- Custom remediation workflows

### 📊 Observability Stack
- Prometheus metrics integration
- Grafana dashboard templates
- Centralized logging with search
- SLO/SLI tracking and reporting

### 🚀 CI/CD Pipeline
- GitHub Actions workflows
- GitOps with ArgoCD
- Multi-environment deployments
- Automated testing and security scanning

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Recharts for data visualization
- Framer Motion for animations

### Backend
- Node.js with Express/Fastify
- PostgreSQL database
- Redis for caching
- BullMQ for job queues
- WebSocket for real-time updates

### Infrastructure
- Docker & Docker Compose
- Kubernetes manifests
- Helm charts
- Terraform modules

### Monitoring
- Prometheus
- Grafana
- Loki for logs
- Custom alerting rules

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- kubectl (optional)
- Terraform (optional)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/cloudops-command-center.git
cd cloudops-command-center

# Start the frontend
cd frontend
npm install
npm run dev

# Start the backend (in another terminal)
cd backend
npm install
npm run dev

# Or use Docker Compose
docker-compose up -d
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/docs

## Project Structure

```
cloudops-command-center/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── incidents/       # Incident management
│   │   └── charts/          # Data visualizations
│   └── lib/                  # Utilities and hooks
├── backend/                  # Node.js backend services
│   ├── src/
│   │   ├── api/             # REST API routes
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   └── workers/         # Background jobs
│   └── tests/               # API tests
├── infrastructure/
│   ├── terraform/           # IaC modules
│   ├── kubernetes/          # K8s manifests
│   └── helm/                # Helm charts
├── scripts/
│   ├── remediation/         # Auto-healing scripts
│   └── monitoring/          # Monitoring setup
└── docs/                    # Documentation
```

## Screenshots

### Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)

### Incident Management
![Incidents](docs/screenshots/incidents.png)

### Deployment Pipeline
![Pipeline](docs/screenshots/pipeline.png)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Built with ❤️ for the DevOps/SRE community
