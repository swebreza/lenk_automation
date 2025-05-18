/**
 * Dashboard Page for AI-powered Service Business Automation Platform
 *
 * This page provides a user interface for managing agents, workflows, and monitoring the system.
 */

'use client'

import { useState, useEffect } from 'react'
// import Image from 'next/image'
import { AgentType, AgentStatus } from '@/lib/agents'

// Dashboard component
export default function Dashboard() {
  const [agents, setAgents] = useState<
    Array<{
      id: string
      name: string
      type: string
      status: AgentStatus
      description: string
      capabilities?: string[]
    }>
  >([])
  const [workflows] = useState<
    Array<{
      id: string
      name: string
      status: string
    }>
  >([])
  const [activeTab, setActiveTab] = useState('agents')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/agents')
        if (!response.ok) throw new Error('Failed to fetch agents')
        const data = await response.json()
        setAgents(data.agents || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  // Create a new agent
  const createAgent = async (type: string) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Agent`,
          description: `Specialized ${type} agent for business automation`,
        }),
      })

      if (!response.ok) throw new Error('Failed to create agent')
      const newAgent = await response.json()
      setAgents([...agents, newAgent])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Create a new workflow
  const createWorkflow = async () => {
    // This would be implemented to create a new workflow
    alert('Workflow creation would be implemented here')
  }

  return (
    <div className='min-h-screen bg-background'>
      <header className='bg-foreground text-background p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>
            AI Business Automation Platform
          </h1>
          <nav>
            <ul className='flex space-x-4'>
              <li>
                <button
                  onClick={() => setActiveTab('agents')}
                  className={`px-3 py-2 rounded-md ${
                    activeTab === 'agents'
                      ? 'bg-background text-foreground'
                      : ''
                  }`}
                >
                  Agents
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('workflows')}
                  className={`px-3 py-2 rounded-md ${
                    activeTab === 'workflows'
                      ? 'bg-background text-foreground'
                      : ''
                  }`}
                >
                  Workflows
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('monitoring')}
                  className={`px-3 py-2 rounded-md ${
                    activeTab === 'monitoring'
                      ? 'bg-background text-foreground'
                      : ''
                  }`}
                >
                  Monitoring
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className='container mx-auto p-4'>
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {activeTab === 'agents' && (
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold'>Agent Management</h2>
              <div className='flex space-x-2'>
                {Object.values(AgentType).map((type) => (
                  <button
                    key={type}
                    onClick={() => createAgent(type)}
                    className='px-3 py-2 bg-foreground text-background rounded-md hover:bg-opacity-90'
                  >
                    Create {type.replace('_', ' ')} Agent
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p>Loading agents...</p>
            ) : agents.length === 0 ? (
              <p>
                No agents created yet. Create your first agent to get started.
              </p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className='border rounded-lg p-4 shadow-sm'
                  >
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='font-medium text-lg'>{agent.name}</h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {agent.type}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          agent.status === AgentStatus.IDLE
                            ? 'bg-gray-200 text-gray-800'
                            : agent.status === AgentStatus.WORKING
                            ? 'bg-blue-200 text-blue-800'
                            : agent.status === AgentStatus.COMPLETED
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <p className='mt-2 text-sm'>{agent.description}</p>
                    <div className='mt-3'>
                      <h4 className='text-sm font-medium'>Capabilities:</h4>
                      <ul className='mt-1 text-sm'>
                        {agent.capabilities?.map((capability, index) => (
                          <li
                            key={index}
                            className='text-gray-600 dark:text-gray-400'
                          >
                            • {capability.replace('_', ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'workflows' && (
          <div>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-xl font-semibold'>Workflow Management</h2>
              <button
                onClick={createWorkflow}
                className='px-3 py-2 bg-foreground text-background rounded-md hover:bg-opacity-90'
              >
                Create New Workflow
              </button>
            </div>

            {workflows.length === 0 ? (
              <p>
                No workflows created yet. Create your first workflow to get
                started.
              </p>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Workflow cards would be rendered here */}
                <p>Workflow list would be displayed here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div>
            <h2 className='text-xl font-semibold mb-6'>System Monitoring</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='border rounded-lg p-4 shadow-sm'>
                <h3 className='font-medium'>Active Agents</h3>
                <p className='text-3xl font-bold mt-2'>{agents.length}</p>
              </div>
              <div className='border rounded-lg p-4 shadow-sm'>
                <h3 className='font-medium'>Active Workflows</h3>
                <p className='text-3xl font-bold mt-2'>{workflows.length}</p>
              </div>
              <div className='border rounded-lg p-4 shadow-sm'>
                <h3 className='font-medium'>Tasks Completed</h3>
                <p className='text-3xl font-bold mt-2'>0</p>
              </div>
            </div>
            <div className='mt-6 border rounded-lg p-4 shadow-sm'>
              <h3 className='font-medium mb-4'>System Activity</h3>
              <p>Activity logs would be displayed here</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
