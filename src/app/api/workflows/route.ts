/**
 * API Routes for Workflow Management
 *
 * This module provides API endpoints for managing workflows in the automation platform.
 */

import { NextRequest, NextResponse } from 'next/server'
import { agentEventBus } from '@/lib/agents'
import { v4 as uuidv4 } from 'uuid'

// In-memory store for workflows (would be replaced with database in production)
const workflows = new Map()

// GET /api/workflows - List all workflows
export async function GET() {
  try {
    const workflowList = Array.from(workflows.values())
    return NextResponse.json({ workflows: workflowList })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, steps, data } = body

    if (!name || !steps || !Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'Invalid workflow data' },
        { status: 400 }
      )
    }

    const id = uuidv4()
    const workflow = {
      id,
      name,
      description: description || 'Automated business workflow',
      steps: steps.map((step) => ({
        ...step,
        id: step.id || uuidv4(),
        status: 'pending',
        dependsOn: step.dependsOn || [],
      })),
      data: data || {},
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    workflows.set(id, workflow)

    // Notify the workflow orchestrator about the new workflow
    agentEventBus.publishEvent('workflow:create', workflow)

    return NextResponse.json(workflow, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// GET /api/workflows/:id - Get a specific workflow
export async function GET_WORKFLOW(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflow = workflows.get(params.id)

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// PUT /api/workflows/:id - Update a workflow
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const body = await request.json()

    if (!id || !workflows.has(id)) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const workflow = workflows.get(id)

    // Update workflow properties
    if (body.name) workflow.name = body.name
    if (body.description) workflow.description = body.description
    if (body.data) workflow.data = { ...workflow.data, ...body.data }
    if (
      body.status &&
      ['active', 'paused', 'completed', 'failed'].includes(body.status)
    ) {
      workflow.status = body.status
    }

    workflow.updatedAt = new Date()
    workflows.set(id, workflow)

    return NextResponse.json(workflow)
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// DELETE /api/workflows/:id - Delete a workflow
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id || !workflows.has(id)) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    workflows.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// POST /api/workflows/:id/start - Start a workflow
export async function START_WORKFLOW(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id || !workflows.has(id)) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const workflow = workflows.get(id)

    // Notify the workflow orchestrator to start the workflow
    agentEventBus.publishEvent('workflow:start', { workflowId: id })

    workflow.status = 'active'
    workflow.updatedAt = new Date()

    return NextResponse.json({ success: true, message: 'Workflow started' })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// POST /api/workflows/:id/pause - Pause a workflow
export async function PAUSE_WORKFLOW(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id || !workflows.has(id)) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const workflow = workflows.get(id)

    // Notify the workflow orchestrator to pause the workflow
    agentEventBus.publishEvent('workflow:pause', { workflowId: id })

    workflow.status = 'paused'
    workflow.updatedAt = new Date()

    return NextResponse.json({ success: true, message: 'Workflow paused' })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}

// POST /api/workflows/:id/cancel - Cancel a workflow
export async function CANCEL_WORKFLOW(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id || !workflows.has(id)) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const workflow = workflows.get(id)

    // Notify the workflow orchestrator to cancel the workflow
    agentEventBus.publishEvent('workflow:cancel', { workflowId: id })

    workflow.status = 'failed'
    workflow.updatedAt = new Date()
    workflow.completedAt = new Date()

    return NextResponse.json({ success: true, message: 'Workflow cancelled' })
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
