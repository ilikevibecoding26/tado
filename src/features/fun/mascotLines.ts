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
  halloween: [
    'Boo! Did I scare you? Good. Now back to planning.',
    'I have no bones to pick, only dates to keep.',
    'Fun fact: I was a very round pumpkin before this job.',
    'Trick or treat? Treat yourself to a break.',
  ],
  christmas: [
    'I am not afraid of the cold. I am afraid of warm days.',
    'Make a list, check it twice. I will hold your carrot.',
    'Every snowflake is different. So is every day on your calendar.',
    'Be kind to yourself. It is the season for it.',
  ],
  newyear: [
    'Tick tock. I have been counting to midnight all year.',
    'Fresh calendar, fresh start. No pressure.',
    'Resolution: add one event today. Done? Good.',
    'Every day is a little new year if you plan it right.',
  ],
  valentines: [
    'You are the best thing on my calendar.',
    'I wear my heart on my sleeve. I do not have sleeves.',
    'Be kind to someone today. Start with yourself.',
    'Roses are red, violets are blue, I added your plans, and I am here for you.',
  ],
  stpatrick: [
    'I have four leaves and zero worries.',
    'Luck is just good planning with a little sparkle.',
    'May your meetings be short and your breaks be long.',
    'Find a pot of gold at the end of your to-do list.',
  ],
}

let lastLine = ''

export function pickMascotLine(mascot: ThemeId): string {
  const options = LINES[mascot].filter((line) => line !== lastLine)
  lastLine = options[Math.floor(Math.random() * options.length)]
  return lastLine
}
