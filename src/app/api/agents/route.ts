/**
 * API Routes for Agent Management
 *
 * This module provides API endpoints for managing agents in the automation platform.
 */

import { NextRequest, NextResponse } from 'next/server'

// In-memory store for agents (would be replaced with database in production)
const agents = new Map()

// GET /api/agents - List all agents
export async function GET() {
  try {
    const agentList = Array.from(agents.values())
    return NextResponse.json({ agents: agentList })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

// POST /api/agents - Create a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = crypto.randomUUID()
    const agent = {
      id,
      type: body.type,
      name: body.name,
      description: body.description,
      status: 'IDLE',
    }
    agents.set(id, agent)
    return NextResponse.json(agent, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/:id - Delete an agent
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }
    agents.delete(id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
