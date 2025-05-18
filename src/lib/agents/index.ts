/**
 * 
 * Agent Architecture for AI-powered Service Business Automation
 *
 * This module defines the core agent architecture for the automation platform.
 * It includes base agent interfaces, agent factory, and common agent utilities.
 */

import { EventEmitter } from 'events'

// Agent Types
export enum AgentType {
  CUSTOMER_SERVICE = 'customer_service',
  SCHEDULING = 'scheduling',
  BILLING = 'billing',
  DOCUMENT = 'document',
  WORKFLOW = 'workflow',
}

// Agent Status
export enum AgentStatus {
  IDLE = 'idle',
  WORKING = 'working',
  ERROR = 'error',
  COMPLETED = 'completed',
}

// Base Agent Interface
export interface BaseAgent {
  id: string
  type: AgentType
  status: AgentStatus
  name: string
  description: string
  capabilities: string[]
  initialize(): Promise<void>
  execute(task: AgentTask): Promise<AgentResult>
  getStatus(): AgentStatus
}

// Agent Task Interface
export interface AgentTask {
  id: string
  type: string
  priority: number
  data: Record<string, any>
  createdAt: Date
  deadline?: Date
}

// Agent Result Interface
export interface AgentResult {
  taskId: string
  success: boolean
  data: Record<string, any>
  error?: string
  completedAt: Date
}

// Agent Factory
export class AgentFactory {
  static createAgent(type: AgentType, config: Record<string, any>): BaseAgent {
    // This will be implemented by specific agent modules
    throw new Error('Method not implemented. Import specific agent modules.')
  }
}

// Agent Event Bus for inter-agent communication
export class AgentEventBus extends EventEmitter {
  private static instance: AgentEventBus

  private constructor() {
    super()
  }

  public static getInstance(): AgentEventBus {
    if (!AgentEventBus.instance) {
      AgentEventBus.instance = new AgentEventBus()
    }
    return AgentEventBus.instance
  }

  public publishEvent(eventName: string, data: any): void {
    this.emit(eventName, data)
  }

  public subscribeToEvent(
    eventName: string,
    callback: (data: any) => void
  ): void {
    this.on(eventName, callback)
  }
}

// Export the event bus instance
export const agentEventBus = AgentEventBus.getInstance()
