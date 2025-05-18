export interface OnboardingData {
  clientName: string
  projectName: string
  teamAssigned: string[]
  slackWorkspace: string
}

export function runOnboarding(data: OnboardingData): string[] {
  const { clientName, projectName, teamAssigned, slackWorkspace } = data

  const instructions: string[] = []

  // Step 1: Create a Slack channel
  instructions.push(
    `Simulate Slack API call to create channel for ${clientName} on workspace ${slackWorkspace}`
  )

  // Step 2: Set up a shared Notion folder (or Google Drive)
  instructions.push(
    `Simulate Notion/Google Drive API call to set up shared folder for ${projectName}`
  )

  // Step 3: Assign a PM and developer
  instructions.push(
    `Assign team members ${teamAssigned.join(
      ' and '
    )} to project ${projectName}`
  )

  // Step 4: Send a welcome email
  instructions.push(
    `Simulate Gmail API call to send welcome email to ${clientName}`
  )

  return instructions
}
