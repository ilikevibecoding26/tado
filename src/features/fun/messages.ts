import type { Appearance } from '../theme/appearance'
import { isLateNight } from './timeOfDay'
import type { ThemeId } from '../theme/theme'

export interface Milestone {
  count: number
  title: string
}

// Event counts at which the planner badge levels up; each theme names the seven levels its own way.
const MILESTONE_COUNTS = [0, 1, 5, 10, 25, 50, 100] as const

interface Voice {
  empty: readonly string[]
  /** Said between midnight and 5am. */
  night: readonly string[]
  todoEmpty: string
  milestones: readonly string[]
}

const VOICES: Record<ThemeId, Voice> = {
  tado: {
    empty: [
      'Nothing here yet — a blank page full of possibility.',
      'Wide open. Go plan something fun.',
      'Quiet in here. Too quiet.',
      'This spot is wide open — claim it!',
      'No plans, no problem. Or... add one?',
      'Looks empty. Your future self will thank you for filling it.',
    ],
    todoEmpty: 'Nothing on the list. Add something above.',
    night: ['Still up? Even calendars need sleep.', 'Past midnight. Tomorrow is already on the calendar.'],
    milestones: [
      'Blank slate',
      'First event!',
      'Getting the hang of it',
      'Certified planner',
      'Scheduling machine',
      'Calendar legend',
      'Time lord',
    ],
  },
  minimal: {
    empty: ['Nothing scheduled.', 'A clear day.', 'No events.', 'Empty, for now.'],
    todoEmpty: 'Nothing to do.',
    night: ['Late.', 'Rest.'],
    milestones: ['Empty', 'Started', 'Five', 'Ten', 'Twenty-five', 'Fifty', 'One hundred'],
  },
  candy: {
    empty: [
      'No treats on the schedule yet. Add one!',
      'A blank sheet, waiting for sprinkles.',
      'Sweet, sweet nothing.',
      'Time to frost this day with plans.',
    ],
    todoEmpty: 'The to-do jar is empty. Drop something in!',
    night: ['Even cupcakes need a nap.', 'Late-night sprinkles? Maybe sleep first.'],
    milestones: [
      'Fresh batch',
      'First sprinkle!',
      'Sweet start',
      'Sugar rush',
      'Candy factory',
      'Dessert legend',
      'Sugar monarch',
    ],
  },
  space: {
    empty: [
      'All quiet in this sector.',
      'No missions scheduled. Plot a course?',
      'Empty orbit. Add something to launch.',
      'Houston, we have an empty calendar.',
    ],
    todoEmpty: 'Mission log is clear. Add a task to the manifest.',
    night: ['It is the dark side of the night. Time to power down.', 'Mission control suggests sleep.'],
    milestones: [
      'On the launchpad',
      'Liftoff!',
      'In orbit',
      'Mission specialist',
      'Flight commander',
      'Galaxy legend',
      'Master of the cosmos',
    ],
  },
  arcade: {
    empty: [
      'No games queued. Press start?',
      'Score: zero. Add an event to level up.',
      'Empty stage. Ready, player one?',
      'Continue? Add an event.',
    ],
    todoEmpty: 'No quests in the queue. Add one to get on the board.',
    night: ['Low energy. Save your game and rest.', 'Continue tomorrow? Press start after sleep.'],
    milestones: [
      'Player one',
      'First points!',
      'Warming up',
      'Combo builder',
      'High scorer',
      'Arcade champion',
      'Final boss',
    ],
  },
  ocean: {
    empty: [
      'Calm waters. Nothing on the tide.',
      'Smooth sailing. Add something to the voyage?',
      'An empty sea. Cast a plan.',
      'Not a ripple on the horizon.',
    ],
    todoEmpty: 'Clear waters. Toss something in.',
    night: ['The tide is low and so am I.', 'Even fish rest. Drift off soon.'],
    milestones: [
      'Calm waters',
      'First splash!',
      'Making waves',
      'Riding the tide',
      'Deep diver',
      'Ocean legend',
      'Master of the deep',
    ],
  },
  forest: {
    empty: [
      'The clearing is quiet.',
      'Nothing growing here yet. Plant a plan?',
      'Not a leaf out of place.',
      'Fresh ground, ready for something new.',
    ],
    todoEmpty: 'Nothing sprouting yet. Plant a task.',
    night: ['The forest is asleep. You should be too.', 'Owls are up. Foxes are in bed.'],
    milestones: [
      'Bare ground',
      'First sprout!',
      'Growing',
      'Strong roots',
      'Tall timber',
      'Forest keeper',
      'Ancient grove',
    ],
  },
  gold: {
    empty: [
      'Not a coin on the table.',
      'A vault with room to spare.',
      'Quiet luxury: an empty day.',
      'Nothing scheduled. Nothing wasted.',
    ],
    todoEmpty: 'Your ledger is clear.',
    night: ['Even treasure sleeps. Go rest.', 'Midnight oil is expensive. Go to bed.'],
    milestones: [
      'Pocket change',
      'First coin!',
      'Saving up',
      'Rich in plans',
      'Treasure keeper',
      'The gold standard',
      'Midas',
    ],
  },
  sunset: {
    empty: [
      'The sky is wide open.',
      'Nothing on the horizon. Yet.',
      'A quiet evening ahead.',
      'Plenty of daylight left to fill.',
    ],
    todoEmpty: 'Nothing left before dusk. Add something for tomorrow.',
    night: ['The sun has set. So should you.', 'Past midnight. The sky says rest.'],
    milestones: [
      'Before dawn',
      'First light!',
      'Rising',
      'Golden hour',
      'Glowing',
      'Sunset legend',
      'Endless summer',
    ],
  },
}

// With effects off, every theme speaks in the default TaDo voice.
function voiceFor({ theme, effects }: Appearance): Voice {
  return VOICES[effects === 'off' ? 'tado' : theme]
}

// The mascot's own lines: a guest mascot keeps its home theme's voice, even in another theme.
function speechFor({ theme, effects, mascot }: Appearance): Voice {
  return VOICES[effects === 'off' ? 'tado' : (mascot ?? theme)]
}

export function getMilestone(count: number, appearance: Appearance): Milestone {
  const { milestones } = voiceFor(appearance)
  let level = 0
  MILESTONE_COUNTS.forEach((threshold, index) => {
    if (count >= threshold) level = index
  })
  return { count: MILESTONE_COUNTS[level], title: milestones[level] }
}

export function pickRandomMessage(appearance: Appearance): string {
  const voice = speechFor(appearance)
  // After midnight, with effects on, the mascot gets sleepy.
  const pool = appearance.effects !== 'off' && isLateNight() ? voice.night : voice.empty
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getTodoEmptyMessage(appearance: Appearance): string {
  return speechFor(appearance).todoEmpty
}
