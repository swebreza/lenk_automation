export interface Task {
  task: string
  status: 'done' | 'in-progress' | 'overdue'
  assignedTo: string
}

export function generateProjectSummary(tasks: Task[]): string {
  let summary = 'Project Summary:\n\n'

  const doneTasks = tasks.filter((task) => task.status === 'done')
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress')
  const overdueTasks = tasks.filter((task) => task.status === 'overdue')

  summary += `Total Tasks: ${tasks.length}\n`
  summary += `Completed: ${doneTasks.length}\n`
  summary += `In Progress: ${inProgressTasks.length}\n`
  summary += `Overdue: ${overdueTasks.length}\n\n`

  if (overdueTasks.length > 0) {
    summary += 'Overdue Tasks:\n'
    overdueTasks.forEach((task) => {
      summary += `- ${task.task} (Assigned to: ${task.assignedTo})\n`
    })
    summary += '\n'
  }

  if (inProgressTasks.length > 0) {
    summary += 'Tasks In Progress:\n'
    inProgressTasks.forEach((task) => {
      summary += `- ${task.task} (Assigned to: ${task.assignedTo})\n`
    })
    summary += '\n'
  }

  if (doneTasks.length > 0) {
    summary += 'Completed Tasks:\n'
    doneTasks.forEach((task) => {
      summary += `- ${task.task}\n`
    })
    summary += '\n'
  }

  summary +=
    'Next Steps: Review overdue tasks and prioritize in-progress items.'

  return summary
}
