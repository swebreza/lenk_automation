/**
 * Workflow Orchestrator Agent
 *
 * This module implements the workflow orchestrator agent that coordinates tasks
 * between specialized agents and manages business processes.
 */

import {
  BaseAgent,
  AgentType,
  AgentStatus,
  AgentTask,
  AgentResult,
  agentEventBus,
} from '../index'
import { createSpecializedAgent } from '../specialized'
import { v4 as uuidv4 } from 'uuid'

// Workflow Step Status
export enum WorkflowStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

// Workflow Step Interface
export interface WorkflowStep {
  id: string
  name: string
  agentType: AgentType
  action: string
  status: WorkflowStepStatus
  config: Record<string, any>
  dependsOn: string[]
  result?: AgentResult
}

// Workflow Interface
export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  data: Record<string, any>
  status: 'active' | 'paused' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// Workflow Orchestrator Agent
export class WorkflowOrchestratorAgent implements BaseAgent {
  id: string
  type: AgentType.WORKFLOW
  status: AgentStatus = AgentStatus.IDLE
  name: string
  description: string
  capabilities: string[]
  private activeWorkflows: Map<string, Workflow> = new Map()
  private agents: Map<AgentType, BaseAgent> = new Map()

  constructor(id: string, name: string, description: string) {
    this.id = id
    this.type = AgentType.WORKFLOW
    this.name = name
    this.description = description
    this.capabilities = [
      'workflow_orchestration',
      'process_automation',
      'task_coordination',
      'business_logic_execution',
    ]
  }

  async initialize(): Promise<void> {
    // Initialize all specialized agents
    for (const agentType of Object.values(AgentType)) {
      if (agentType !== AgentType.WORKFLOW) {
        const agent = createSpecializedAgent(agentType, {
          name: `${agentType} Agent`,
          description: `Specialized ${agentType} agent`,
        })
        await agent.initialize()
        this.agents.set(agentType, agent)
      }
    }

    // Subscribe to workflow-related events
    agentEventBus.subscribeToEvent(
      'workflow:create',
      this.createWorkflow.bind(this)
    )
    agentEventBus.subscribeToEvent(
      'workflow:start',
      this.startWorkflow.bind(this)
    )
    agentEventBus.subscribeToEvent(
      'workflow:pause',
      this.pauseWorkflow.bind(this)
    )
    agentEventBus.subscribeToEvent(
      'workflow:resume',
      this.resumeWorkflow.bind(this)
    )
    agentEventBus.subscribeToEvent(
      'workflow:cancel',
      this.cancelWorkflow.bind(this)
    )

    // Subscribe to task results to update workflow steps
    agentEventBus.subscribeToEvent('result:*', this.handleTaskResult.bind(this))

    this.status = AgentStatus.IDLE
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    this.status = AgentStatus.WORKING

    try {
      let result: AgentResult

      switch (task.type) {
        case 'create_workflow':
          result = await this.handleCreateWorkflow(task)
          break
        case 'execute_workflow':
          result = await this.handleExecuteWorkflow(task)
          break
        case 'update_workflow':
          result = await this.handleUpdateWorkflow(task)
          break
        default:
          throw new Error(`Unsupported task type: ${task.type}`)
      }

      this.status = AgentStatus.COMPLETED
      return result
    } catch (error) {
      this.status = AgentStatus.ERROR
      return {
        taskId: task.id,
        success: false,
        data: {},
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      }
    } finally {
      this.status = AgentStatus.IDLE
    }
  }

  getStatus(): AgentStatus {
    return this.status
  }

  // Workflow Management Methods
  private async createWorkflow(data: any): Promise<void> {
    const workflow: Workflow = {
      id: data.id || uuidv4(),
      name: data.name,
      description: data.description,
      steps: data.steps.map((step: any) => ({
        id: step.id || uuidv4(),
        name: step.name,
        agentType: step.agentType,
        action: step.action,
        status: WorkflowStepStatus.PENDING,
        config: step.config || {},
        dependsOn: step.dependsOn || [],
      })),
      data: data.data || {},
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.activeWorkflows.set(workflow.id, workflow)
    agentEventBus.publishEvent('workflow:created', { workflowId: workflow.id })
  }

  private async startWorkflow(data: { workflowId: string }): Promise<void> {
    const workflow = this.activeWorkflows.get(data.workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${data.workflowId}`)
    }

    workflow.status = 'active'
    workflow.updatedAt = new Date()

    // Start executing steps that have no dependencies
    const initialSteps = workflow.steps.filter(
      (step) => step.dependsOn.length === 0
    )
    for (const step of initialSteps) {
      await this.executeWorkflowStep(workflow, step)
    }
  }

  private async pauseWorkflow(data: { workflowId: string }): Promise<void> {
    const workflow = this.activeWorkflows.get(data.workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${data.workflowId}`)
    }

    workflow.status = 'paused'
    workflow.updatedAt = new Date()
  }

  private async resumeWorkflow(data: { workflowId: string }): Promise<void> {
    const workflow = this.activeWorkflows.get(data.workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${data.workflowId}`)
    }

    workflow.status = 'active'
    workflow.updatedAt = new Date()

    // Resume executing steps that are pending and have all dependencies completed
    const pendingSteps = workflow.steps.filter(
      (step) =>
        step.status === WorkflowStepStatus.PENDING &&
        this.areStepDependenciesMet(workflow, step)
    )

    for (const step of pendingSteps) {
      await this.executeWorkflowStep(workflow, step)
    }
  }

  private async cancelWorkflow(data: { workflowId: string }): Promise<void> {
    const workflow = this.activeWorkflows.get(data.workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${data.workflowId}`)
    }

    workflow.status = 'failed'
    workflow.updatedAt = new Date()
    workflow.completedAt = new Date()

    // Mark all in-progress steps as failed
    workflow.steps
      .filter((step) => step.status === WorkflowStepStatus.IN_PROGRESS)
      .forEach((step) => {
        step.status = WorkflowStepStatus.FAILED
      })

    // Mark all pending steps as skipped
    workflow.steps
      .filter((step) => step.status === WorkflowStepStatus.PENDING)
      .forEach((step) => {
        step.status = WorkflowStepStatus.SKIPPED
      })

    agentEventBus.publishEvent('workflow:cancelled', {
      workflowId: workflow.id,
    })
  }

  // Task Handlers
  private async handleCreateWorkflow(task: AgentTask): Promise<AgentResult> {
    await this.createWorkflow(task.data)

    return {
      taskId: task.id,
      success: true,
      data: {
        workflowId: task.data.id || uuidv4(),
        message: 'Workflow created successfully',
      },
      completedAt: new Date(),
    }
  }

  private async handleExecuteWorkflow(task: AgentTask): Promise<AgentResult> {
    await this.startWorkflow({ workflowId: task.data.workflowId })

    return {
      taskId: task.id,
      success: true,
      data: {
        workflowId: task.data.workflowId,
        message: 'Workflow execution started',
      },
      completedAt: new Date(),
    }
  }

  private async handleUpdateWorkflow(task: AgentTask): Promise<AgentResult> {
    const workflow = this.activeWorkflows.get(task.data.workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${task.data.workflowId}`)
    }

    // Update workflow properties
    if (task.data.name) workflow.name = task.data.name
    if (task.data.description) workflow.description = task.data.description
    if (task.data.data) workflow.data = { ...workflow.data, ...task.data.data }

    workflow.updatedAt = new Date()

    return {
      taskId: task.id,
      success: true,
      data: {
        workflowId: workflow.id,
        message: 'Workflow updated successfully',
      },
      completedAt: new Date(),
    }
  }

  // Workflow Step Execution
  private async executeWorkflowStep(
    workflow: Workflow,
    step: WorkflowStep
  ): Promise<void> {
    if (workflow.status !== 'active') {
      return // Don't execute steps if workflow is not active
    }

    // Check if all dependencies are met
    if (!this.areStepDependenciesMet(workflow, step)) {
      return // Skip this step for now
    }

    // Update step status
    step.status = WorkflowStepStatus.IN_PROGRESS

    // Get the appropriate agent for this step
    const agent = this.agents.get(step.agentType)
    if (!agent) {
      step.status = WorkflowStepStatus.FAILED
      return
    }

    // Create a task for the agent
    const task: AgentTask = {
      id: uuidv4(),
      type: step.action,
      priority: 1,
      data: {
        ...step.config,
        workflowId: workflow.id,
        stepId: step.id,
        workflowData: workflow.data,
      },
      createdAt: new Date(),
    }

    // Publish the task to the agent
    agentEventBus.publishEvent(`task:${step.agentType}`, task)
  }

  // Check if all dependencies for a step are completed
  private areStepDependenciesMet(
    workflow: Workflow,
    step: WorkflowStep
  ): boolean {
    if (step.dependsOn.length === 0) {
      return true // No dependencies
    }

    return step.dependsOn.every((dependencyId) => {
      const dependencyStep = workflow.steps.find((s) => s.id === dependencyId)
      return (
        dependencyStep && dependencyStep.status === WorkflowStepStatus.COMPLETED
      )
    })
  }

  // Handle task results and update workflow steps
  private async handleTaskResult(
    result: AgentResult & { workflowId?: string; stepId?: string }
  ): Promise<void> {
    if (!result.workflowId || !result.stepId) {
      return // Not a workflow task result
    }

    const workflow = this.activeWorkflows.get(result.workflowId)
    if (!workflow) {
      return // Workflow not found
    }

    const step = workflow.steps.find((s) => s.id === result.stepId)
    if (!step) {
      return // Step not found
    }

    // Update step status and result
    step.status = result.success
      ? WorkflowStepStatus.COMPLETED
      : WorkflowStepStatus.FAILED
    step.result = result

    // If step completed successfully, check and execute dependent steps
    if (result.success) {
      // Find steps that depend on this one
      const dependentSteps = workflow.steps.filter(
        (s) =>
          s.dependsOn.includes(step.id) &&
          s.status === WorkflowStepStatus.PENDING
      )

      // Check and execute dependent steps
      for (const dependentStep of dependentSteps) {
        if (this.areStepDependenciesMet(workflow, dependentStep)) {
          await this.executeWorkflowStep(workflow, dependentStep)
        }
      }
    }

    // Check if workflow is completed
    const allStepsCompleted = workflow.steps.every(
      (s) =>
        s.status === WorkflowStepStatus.COMPLETED ||
        s.status === WorkflowStepStatus.FAILED ||
        s.status === WorkflowStepStatus.SKIPPED
    )

    if (allStepsCompleted) {
      const anyStepFailed = workflow.steps.some(
        (s) => s.status === WorkflowStepStatus.FAILED
      )
      workflow.status = anyStepFailed ? 'failed' : 'completed'
      workflow.completedAt = new Date()
      workflow.updatedAt = new Date()

      agentEventBus.publishEvent('workflow:completed', {
        workflowId: workflow.id,
        success: !anyStepFailed,
      })
    }
  }
}

// Create and export a workflow orchestrator factory function
export function createWorkflowOrchestrator(
  config: Record<string, any> = {}
): WorkflowOrchestratorAgent {
  const id = config.id || uuidv4()
  const name = config.name || 'Workflow Orchestrator'
  const description =
    config.description ||
    'Coordinates tasks between specialized agents and manages business processes'

  return new WorkflowOrchestratorAgent(id, name, description)
}
