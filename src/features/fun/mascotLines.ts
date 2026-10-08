import type { ThemeId } from '../theme/theme'

// What each mascot says when you press and hold it: a riddle, a fun fact or a pun, in its own voice.
const LINES: Record<ThemeId, readonly string[]> = {
  tado: [
    'I would tell you a joke about time, but it is not the right moment.',
    'Fun fact: I have never missed a date. I am literally full of them.',
    'Plan today, high-five tomorrow.',
    'Seven days a week and I keep every one organized.',
  ],
  minimal: ['Enough.', 'Less, but better.', 'Quiet is also a plan.', 'Nothing more to add.'],
  candy: [
    'What do you call a sleeping cupcake? A nap-cake.',
    'I am 100% frosting and 0% worried.',
    'Sprinkles are just tiny confetti. Do not tell the confetti.',
    'Today is a good day to be sweet to yourself.',
  ],
  space: [
    'Fun fact: a day on Venus is longer than its year.',
    'In space, no one can hear you reschedule.',
    'Mission control says: take a break.',
    'One small step for you, one giant checkmark for your to-do list.',
  ],
  arcade: [
    'Extra life unlocked: drink some water.',
    'Press any key to keep being awesome.',
    'Riddle: what has pixels but no screen? Me, mostly.',
    'Combo breaker: take a walk, then come back.',
  ],
  ocean: [
    'Some say I forget things in three seconds. Good thing you have a calendar.',
    'Sea you later!',
    'Go with the flow, but keep a schedule.',
    'Fish fact: I never close my eyes. Sleep sounds nice, though.',
  ],
  forest: [
    'Riddle: what has roots nobody sees, and is taller than trees? A mountain.',
    'Quick as a fox, but even I schedule my naps.',
    'Every big forest started with one small plan.',
    'Tread softly. The best ideas grow slowly.',
  ],
  sunset: [
    'I set every single day, and I still show up tomorrow.',
    'Golden hour is just the day showing off.',
    'Rise and shine, even if it is almost dusk.',
    'Whatever is left on your list can wait for tomorrow.',
  ],
  gold: [
    'You found every one of us. You are the real MVP.',
    'Fun fact: gold never tarnishes. Neither do good plans.',
    'I do not wear the crown. I just keep it organized.',
    'A day well planned is a day well spent.',
  ],
}

let lastLine = ''

export function pickMascotLine(mascot: ThemeId): string {
  const options = LINES[mascot].filter((line) => line !== lastLine)
  lastLine = options[Math.floor(Math.random() * options.length)]
  return lastLine
}
