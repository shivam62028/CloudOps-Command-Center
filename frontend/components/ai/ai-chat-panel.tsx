'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Send,
  X,
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
} from 'lucide-react'
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
  { icon: AlertCircle, label: 'Diagnose incident', prompt: 'Help me diagnose a service incident' },
  { icon: Zap, label: 'Scale service', prompt: 'How do I scale a service that is experiencing high load?' },
  { icon: Server, label: 'Deployment help', prompt: 'Guide me through a safe deployment process' },
  { icon: DollarSign, label: 'Reduce costs', prompt: 'How can I optimize cloud costs?' },
]

export function AIChatPanel() {
  const { addToast } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

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
          context: 'User is on the CloudOps dashboard',
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
        const code = part.replace(/```(\w+)?\n?/g, '').replace(/```$/g, '')
        return (
          <pre
            key={index}
            className="bg-slate-950 text-slate-200 rounded-lg p-3 my-2 overflow-x-auto text-sm font-mono"
          >
            <code>{code}</code>
          </pre>
        )
      }
      return part.split('\n').map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={`${index}-${i}`} className="text-lg font-bold mt-4 mb-2">
              {line.replace('## ', '')}
            </h2>
          )
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <p key={`${index}-${i}`} className="font-semibold mt-2">
              {line.replace(/\*\*/g, '')}
            </p>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <li key={`${index}-${i}`} className="ml-4">
              {line.replace('- ', '')}
            </li>
          )
        }
        if (line.match(/^\d+\./)) {
          return (
            <li key={`${index}-${i}`} className="ml-4 list-decimal">
              {line.replace(/^\d+\.\s*/, '')}
            </li>
          )
        }
        if (line.trim() === '') {
          return <br key={`${index}-${i}`} />
        }
        return (
          <span key={`${index}-${i}`}>
            {line}
            <br />
          </span>
        )
      })
    })
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[420px] h-[600px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    CloudOps AI
                    <Badge variant="info" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Beta
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground">Your DevOps assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button variant="ghost" size="icon-sm" onClick={clearChat}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-fit mx-auto mb-4">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-1">How can I help you today?</h4>
                    <p className="text-sm text-muted-foreground">
                      Ask me about incidents, deployments, scaling, or costs
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickPrompts.map((prompt) => (
                      <Button
                        key={prompt.label}
                        variant="outline"
                        className="h-auto py-3 px-3 justify-start text-left"
                        onClick={() => sendMessage(prompt.prompt)}
                      >
                        <prompt.icon className="h-4 w-4 mr-2 shrink-0 text-primary" />
                        <span className="text-xs">{prompt.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      )}
                    >
                      <div
                        className={cn(
                          'p-2 rounded-lg shrink-0 h-fit',
                          message.role === 'user'
                            ? 'bg-primary'
                            : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        )}
                      >
                        {message.role === 'user' ? (
                          <MessageSquare className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'flex-1 rounded-lg p-3',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm">{message.content}</p>
                        ) : (
                          <div className="text-sm prose-sm">
                            {formatContent(message.content)}
                            {message.isDemo && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                Demo mode - Add API key for full AI capabilities
                              </p>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {message.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(message.content, message.id)}
                            >
                              {copiedId === message.id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
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
                      className="flex gap-3"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 h-fit">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </ScrollArea>

            <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about incidents, deployments, scaling..."
                  className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px] max-h-[120px]"
                  rows={1}
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 transition-colors',
          isOpen
            ? 'bg-muted'
            : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Bot className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </motion.button>
    </>
  )
}
