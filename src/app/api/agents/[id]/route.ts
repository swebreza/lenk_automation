import { NextRequest, NextResponse } from 'next/server'

// Define the agent type
interface Agent {
  id: string
  type: string
  name: string
  description: string
  status: string
}

// In-memory store for agents (would be replaced with database in production)
const agents = new Map<string, Agent>()

// Define proper interface for route parameters
interface RouteParams {
  params: { id: string }
}

// GET /api/agents/[id] - Get a specific agent
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const agent = agents.get(params.id)

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    return NextResponse.json(agent)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

// If you have other methods like PUT, POST, DELETE, update them similarly
