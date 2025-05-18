/**
 * Workflow Editor Component
 *
 * This component provides a visual interface for creating and editing workflows
 * in the AI-powered service business automation platform.
 */

'use client'

import { useState, useEffect, SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import { AgentType } from '@/lib/agents'

export default function WorkflowEditor() {
  const router = useRouter()
  const [workflow, setWorkflow] = useState<{
    name: string
    description: string
    steps: Array<{
      id: string
      name: string
      agentType: AgentType
      action: string
      config: Record<string, string>
      dependsOn: string[]
    }>
    data: Record<string, string>
  }>({
    name: '',
    description: '',
    steps: [],
    data: {},
  })
  const [currentStep, setCurrentStep] = useState<{
    id: string
    name: string
    agentType: AgentType
    action: string
    config: Record<string, string>
    dependsOn: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch available agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/agents')
        if (!response.ok) throw new Error('Failed to fetch agents')
        await response.json()
      } catch (err) {
        setError(
          err instanceof Error
            ? new Error(err.message)
            : new Error('Unknown error')
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  // Update workflow name
  const updateWorkflowName = (e: { target: { value: string } }) => {
    setWorkflow({ ...workflow, name: e.target.value })
  }

  // Update workflow description
  const updateWorkflowDescription = (e: { target: { value: string } }) => {
    setWorkflow({ ...workflow, description: e.target.value })
  }

  // Add a new step to the workflow
  const addStep = () => {
    const newStep = {
      id: crypto.randomUUID(),
      name: 'New Step',
      agentType: AgentType.CUSTOMER_SERVICE,
      action: '',
      config: {},
      dependsOn: [],
    }

    setWorkflow({
      ...workflow,
      steps: Array.isArray(workflow.steps)
        ? [...workflow.steps, newStep]
        : [newStep],
    })

    setCurrentStep(newStep)
  }

  // Update a step in the workflow
  const updateStep = (
    updatedStep: SetStateAction<{
      id: string
      name: string
      agentType: AgentType
      action: string
      config: Record<string, string>
      dependsOn: string[]
    } | null>
  ) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map((step) => {
        if (typeof updatedStep === 'function') {
          const result = updatedStep(step)
          return result && step.id === result.id ? result : step
        }
        return updatedStep && step.id === updatedStep.id ? updatedStep : step
      }),
    })

    setCurrentStep(updatedStep)
  }

  // Remove a step from the workflow
  const removeStep = (stepId: string) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.filter((step) => step.id !== stepId),
    })

    if (currentStep && currentStep.id === stepId) {
      setCurrentStep(null)
    }
  }

  // Save the workflow
  const saveWorkflow = async () => {
    if (!workflow.name) {
      setError(new Error('Workflow name is required'))
      return
    }

    if (workflow.steps.length === 0) {
      setError(new Error('Workflow must have at least one step'))
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      })

      if (!response.ok) throw new Error('Failed to save workflow')

      await response.json()
      router.push('/dashboard?tab=workflows')
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('An unknown error occurred')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='container mx-auto'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold'>Workflow Editor</h1>
          <div className='flex space-x-2'>
            <button
              onClick={() => router.push('/dashboard?tab=workflows')}
              className='px-3 py-2 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              Cancel
            </button>
            <button
              onClick={saveWorkflow}
              disabled={loading}
              className='px-3 py-2 bg-foreground text-background rounded-md hover:bg-opacity-90 disabled:opacity-50'
            >
              {loading ? 'Saving...' : 'Save Workflow'}
            </button>
          </div>
        </div>

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error.message}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Workflow Details */}
          <div className='md:col-span-1 border rounded-lg p-4 shadow-sm'>
            <h2 className='text-xl font-semibold mb-4'>Workflow Details</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Workflow Name
                </label>
                <input
                  type='text'
                  value={workflow.name}
                  onChange={updateWorkflowName}
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground'
                  placeholder='Enter workflow name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Description
                </label>
                <textarea
                  value={workflow.description}
                  onChange={updateWorkflowDescription}
                  className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground'
                  placeholder='Enter workflow description'
                  rows={3}
                />
              </div>
            </div>

            <div className='mt-6'>
              <h3 className='text-lg font-medium mb-2'>Steps</h3>
              <button
                onClick={addStep}
                className='w-full px-3 py-2 bg-foreground text-background rounded-md hover:bg-opacity-90 mb-4'
              >
                Add Step
              </button>
              {workflow.steps.length === 0 ? (
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  No steps added yet. Click &ldquo;Add Step&rdquo; to create
                  your first workflow step.
                </p>
              ) : (
                <ul className='space-y-2'>
                  {workflow.steps.map((step) => (
                    <li
                      key={step.id}
                      className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                        currentStep?.id === step.id
                          ? 'bg-gray-100 dark:bg-gray-800'
                          : ''
                      }`}
                      onClick={() => setCurrentStep(step)}
                    >
                      <span>{step.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeStep(step.id)
                        }}
                        className='text-red-500 hover:text-red-700'
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Step Editor */}
          <div className='md:col-span-2 border rounded-lg p-4 shadow-sm'>
            {currentStep ? (
              <div>
                <h2 className='text-xl font-semibold mb-4'>
                  Edit Step: {currentStep.name}
                </h2>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Step Name
                    </label>
                    <input
                      type='text'
                      value={currentStep.name}
                      onChange={(e) =>
                        updateStep({ ...currentStep, name: e.target.value })
                      }
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground'
                      placeholder='Enter step name'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Agent Type
                    </label>
                    <select
                      value={currentStep.agentType}
                      onChange={(e) =>
                        updateStep({
                          ...currentStep,
                          agentType: e.target.value as AgentType,
                        })
                      }
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground'
                    >
                      {Object.values(AgentType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Action
                    </label>
                    <input
                      type='text'
                      value={currentStep.action}
                      onChange={(e) =>
                        updateStep({ ...currentStep, action: e.target.value })
                      }
                      className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground'
                      placeholder='Enter action name'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Dependencies
                    </label>
                    <div className='space-y-2'>
                      {workflow.steps
                        .filter((step) => step.id !== currentStep.id)
                        .map((step) => (
                          <div key={step.id} className='flex items-center'>
                            <input
                              type='checkbox'
                              id={`dep-${step.id}`}
                              checked={currentStep.dependsOn.includes(step.id)}
                              onChange={(e) => {
                                const dependsOn = e.target.checked
                                  ? [...currentStep.dependsOn, step.id]
                                  : currentStep.dependsOn.filter(
                                      (id) => id !== step.id
                                    )
                                updateStep({ ...currentStep, dependsOn })
                              }}
                              className='mr-2'
                            />
                            <label htmlFor={`dep-${step.id}`}>
                              {step.name}
                            </label>
                          </div>
                        ))}
                      {workflow.steps.length <= 1 && (
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          No other steps available for dependencies.
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Configuration (JSON)
                    </label>
                    <textarea
                      value={JSON.stringify(currentStep.config, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value)
                          updateStep({ ...currentStep, config })
                        } catch {
                          // Allow invalid JSON during editing
                        }
                      }}
                      className='w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-foreground'
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full py-12'>
                <p className='text-lg text-gray-500 dark:text-gray-400'>
                  Select a step to edit or create a new step
                </p>
                <button
                  onClick={addStep}
                  className='mt-4 px-4 py-2 bg-foreground text-background rounded-md hover:bg-opacity-90'
                >
                  Add Step
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
