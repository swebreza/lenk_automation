/**
 * API Routes for Task Management
 *
 * This module provides API endpoints for managing tasks in the automation platform.
 */

import { NextRequest, NextResponse } from 'next/server'
import { agentEventBus } from '@/lib/agents'
import { v4 as uuidv4 } from 'uuid'

// In-memory store for tasks (would be replaced with database in production)
const tasks = new Map()

// GET /api/tasks - List all tasks
export async function GET() {
  try {
    const taskList = Array.from(tasks.values())
    return NextResponse.json({ tasks: taskList })
  } catch (error) {
    return NextResponse.json(
      { error: error },
      // { error: 'Failed to retrieve tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, agentId, workflowId, priority, data, deadline } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Task type is required' },
        { status: 400 }
      )
    }

    const id = uuidv4()
    const task = {
      id,
      type,
      agentId: agentId || null,
      workflowId: workflowId || null,
      status: 'pending',
      priority: priority || 1,
      data: data || {},
      result: null,
      error: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      deadline: deadline ? new Date(deadline) : null,
    }

    tasks.set(id, task)

    // If an agent is specified, publish the task to that agent
    if (agentId) {
      agentEventBus.publishEvent(`task:${agentId}`, task)
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error },
      // { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

// GET /api/tasks/:id - Get a specific task
export async function GET_TASK(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = tasks.get(params.id)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: error },
      // { error: 'Failed to retrieve task' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/:id - Update a task
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const body = await request.json()

    if (!id || !tasks.has(id)) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const task = tasks.get(id)

    // Update task properties
    if (
      body.status &&
      ['pending', 'in_progress', 'completed', 'failed'].includes(body.status)
    ) {
      task.status = body.status

      // Update timestamps based on status
      if (body.status === 'in_progress' && !task.startedAt) {
        task.startedAt = new Date()
      } else if (
        ['completed', 'failed'].includes(body.status) &&
        !task.completedAt
      ) {
        task.completedAt = new Date()
      }
    }

    if (body.priority) task.priority = body.priority
    if (body.data) task.data = { ...task.data, ...body.data }
    if (body.result) task.result = body.result
    if (body.error) task.error = body.error
    if (body.deadline) task.deadline = new Date(body.deadline)

    tasks.set(id, task)

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: error },
      // { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/:id - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id || !tasks.has(id)) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    tasks.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error },
      // { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
