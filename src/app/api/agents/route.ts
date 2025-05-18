/**
 * API Routes for Agent Management
 *
 * This module provides API endpoints for managing agents in the automation platform.
 */

import { NextRequest, NextResponse } from 'next/server'
import { AgentType } from '@/lib/agents'
import { createSpecializedAgent } from '@/lib/agents/specialized'
import { createWorkflowOrchestrator } from '@/lib/agents/workflow'
import { v4 as uuidv4 } from 'uuid'

// In-memory store for agents (would be replaced with database in production)
const agents = new Map()

// GET /api/agents - List all agents
export async function GET() {
  try {
    const agentList = Array.from(agents.values())
    return NextResponse.json({ agents: agentList })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, description, capabilities } = body

    if (!type || !Object.values(AgentType).includes(type as AgentType)) {
      return NextResponse.json({ error: 'Invalid agent type' }, { status: 400 })
    }

    const id = uuidv4()
    let agent

    if (type === AgentType.WORKFLOW) {
      agent = createWorkflowOrchestrator({
        id,
        name: name || 'Workflow Orchestrator',
        description:
          description || 'Coordinates tasks between specialized agents',
      })
    } else {
      agent = createSpecializedAgent(type as AgentType, {
        id,
        name: name || `${type} Agent`,
        description: description || `Specialized ${type} agent`,
      })
    }

    await agent.initialize()
    agents.set(id, agent)

    return NextResponse.json(
      {
        id: agent.id,
        type: agent.type,
        name: agent.name,
        description: agent.description,
        capabilities: agent.capabilities,
        status: agent.getStatus(),
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// GET /api/agents/:id - Get a specific agent
export async function GET_AGENT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = agents.get(params.id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: agent.id,
      type: agent.type,
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
      status: agent.getStatus(),
    })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// DELETE /api/agents/:id - Delete an agent
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id || !agents.has(id)) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    agents.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
