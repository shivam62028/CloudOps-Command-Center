'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  MessageSquare,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Zap,
  Server,
  DollarSign,
  Activity,
  BookOpen,
  Shield,
  Clock,
  Settings,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isDemo?: boolean
}

const quickPrompts = [
  { icon: AlertCircle, label: 'Diagnose an incident', prompt: 'Help me diagnose a service incident. What should I check first?' },
  { icon: Zap, label: 'Handle high load', prompt: 'One of my services is experiencing high load. How should I scale it?' },
  { icon: Server, label: 'Safe deployment', prompt: 'Guide me through a safe deployment process with rollback strategy' },
  { icon: DollarSign, label: 'Reduce cloud costs', prompt: 'How can I identify and reduce unnecessary cloud spending?' },
  { icon: Activity, label: 'Set up monitoring', prompt: 'What metrics should I monitor for a production API service?' },
  { icon: BookOpen, label: 'Create runbook', prompt: 'Help me create a runbook for handling database connection issues' },
  { icon: Shield, label: 'Security audit', prompt: 'What security checks should I perform on my Kubernetes cluster?' },
  { icon: Clock, label: 'Optimize latency', prompt: 'My API latency is high. How can I identify and fix the bottleneck?' },
]

const capabilities = [
  { icon: AlertCircle, title: 'Incident Management', description: 'Diagnose issues and suggest remediation steps' },
  { icon: Server, title: 'Infrastructure', description: 'Kubernetes, Docker, and cloud resource guidance' },
  { icon: Activity, title: 'Monitoring', description: 'Set up alerts, analyze metrics, and track SLOs' },
  { icon: DollarSign, title: 'Cost Optimization', description: 'Identify savings and optimize resource usage' },
]

export default function AssistantPage() {
  const { addToast } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: 'User is on the CloudOps AI Assistant page',
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        isDemo: data.isDemo,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      addToast({
        title: 'AI Error',
        description: error.message || 'Failed to get response',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([])
    addToast({ title: 'Chat cleared', variant: 'success' })
  }

  const copyToClipboard = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    addToast({ title: 'Copied to clipboard', variant: 'success' })
  }

  const formatContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        const lang = match?.[1] || ''
        const code = match?.[2] || part.replace(/```(\w+)?\n?/g, '').replace(/```$/g, '')
        return (
          <div key={index} className="relative group my-3">
            {lang && (
              <span className="absolute top-2 right-2 text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                {lang}
              </span>
            )}
            <pre className="bg-slate-950 text-slate-200 rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{code.trim()}</code>
            </pre>
          </div>
        )
      }
      return part.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={`${index}-${i}`} className="text-xl font-bold mt-6 mb-3 text-foreground">
              {line.replace('## ', '')}
            </h2>
          )
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={`${index}-${i}`} className="font-semibold mt-3 mb-1">
              {line.replace(/\*\*/g, '')}
            </p>
          )
        }
        if (line.includes('**')) {
          const parts = line.split(/(\*\*.*?\*\*)/g)
          return (
            <p key={`${index}-${i}`}>
              {parts.map((part, pi) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={pi}>{part.replace(/\*\*/g, '')}</strong>
                ) : (
                  part
                )
              )}
            </p>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <li key={`${index}-${i}`} className="ml-4 my-1">
              {line.replace('- ', '')}
            </li>
          )
        }
        if (line.match(/^\d+\./)) {
          return (
            <li key={`${index}-${i}`} className="ml-4 list-decimal my-1">
              {line.replace(/^\d+\.\s*/, '')}
            </li>
          )
        }
        if (line.trim() === '') {
          return <br key={`${index}-${i}`} />
        }
        return (
          <p key={`${index}-${i}`} className="my-1">
            {line}
          </p>
        )
      })
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Bot className="h-6 w-6 text-white" />
            </div>
            AI Assistant
            <Badge variant="info" className="text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Your intelligent DevOps companion for infrastructure management
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-220px)] flex flex-col">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="space-y-8">
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-fit mx-auto mb-6"
                    >
                      <Bot className="h-12 w-12 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      I can help with incident management, deployments, scaling, monitoring,
                      cost optimization, and more.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick prompts</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {quickPrompts.map((prompt, index) => (
                        <motion.div
                          key={prompt.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            variant="outline"
                            className="h-auto py-4 px-4 w-full justify-start text-left flex-col items-start gap-2 hover:bg-primary/5 hover:border-primary/50"
                            onClick={() => sendMessage(prompt.prompt)}
                          >
                            <prompt.icon className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">{prompt.label}</span>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-4',
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      )}
                    >
                      <div
                        className={cn(
                          'p-3 rounded-xl shrink-0 h-fit',
                          message.role === 'user'
                            ? 'bg-primary'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        )}
                      >
                        {message.role === 'user' ? (
                          <MessageSquare className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'flex-1 rounded-xl p-4 max-w-[80%]',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm">{message.content}</p>
                        ) : (
                          <div className="text-sm">
                            {formatContent(message.content)}
                            {message.isDemo && (
                              <p className="text-xs text-muted-foreground mt-4 pt-3 border-t italic">
                                Demo mode - Configure OPENAI_API_KEY or ANTHROPIC_API_KEY for full AI capabilities
                              </p>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {message.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => copyToClipboard(message.content, message.id)}
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="h-3 w-3 mr-1 text-emerald-500" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-4"
                    >
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 h-fit">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-muted-foreground">Thinking...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about incidents, deployments, scaling, costs, monitoring..."
                  className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[52px] max-h-[150px]"
                  rows={1}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="px-6"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {capabilities.map((cap) => (
                <div key={cap.title} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <cap.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cap.title}</p>
                    <p className="text-xs text-muted-foreground">{cap.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                To enable full AI capabilities, add one of these environment variables:
              </p>
              <div className="space-y-2">
                <code className="block bg-muted p-2 rounded text-xs">
                  GEMINI_API_KEY=your-key
                </code>
                <code className="block bg-muted p-2 rounded text-xs">
                  OPENAI_API_KEY=sk-...
                </code>
                <code className="block bg-muted p-2 rounded text-xs">
                  ANTHROPIC_API_KEY=sk-ant-...
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Add to <code>.env.local</code> file in the frontend directory
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
