export const EMPTY_STATE_MESSAGES = [
  'Nothing here yet — a blank page full of possibility.',
  'Wide open. Go plan something fun.',
  'Quiet in here. Too quiet.',
  'This spot is wide open — claim it!',
  'No plans, no problem. Or... add one?',
  "Looks empty. Your future self will thank you for filling it.",
]

export interface Milestone {
  count: number
  title: string
}

const MILESTONES: Milestone[] = [
  { count: 0, title: 'Blank slate' },
  { count: 1, title: 'First event!' },
  { count: 5, title: 'Getting the hang of it' },
  { count: 10, title: 'Certified planner' },
  { count: 25, title: 'Scheduling machine' },
  { count: 50, title: 'Calendar legend' },
  { count: 100, title: 'Time lord' },
]

export function getMilestone(count: number): Milestone {
  let current = MILESTONES[0]
  for (const milestone of MILESTONES) {
    if (count >= milestone.count) {
      current = milestone
    }
  }
  return current
}

export function pickRandomMessage(): string {
  return EMPTY_STATE_MESSAGES[Math.floor(Math.random() * EMPTY_STATE_MESSAGES.length)]
}
