import {extendAdventure} from './adventure-expansion.mjs';

// Each URL represents one complete game state. No account or server is needed.
const page = (id, title, room, objective, paragraphs, choices, extra = {}) => ({
  id, title, room, objective, paragraphs, choices,
  key: false, cat: false, seals: 0, ...extra,
});

export const rooms = {
  entrance: {
    file: 'tropicalbee-halloween-preview.png',
    alt: 'A moonlit cottage, pumpkin lanterns, a friendly ghost and the wooden Enter the House sign.',
  },
  foyer: {
    file: 'adventure/foyer.png',
    alt: 'An oak staircase, a closed attic door, a study doorway and a black cat in a candlelit stone hall.',
  },
  study: {
    file: 'adventure/study.png',
    alt: 'A brass-trimmed puzzle chest with moon, pumpkin and spider symbols, surrounded by books and candles.',
  },
  'study-open': {
    file: 'adventure/study-open.png',
    alt: 'The study chest stands open and empty. Its brass key is now in your inventory.',
  },
  attic: {
    file: 'adventure/attic.png',
    alt: 'A ghost waits by a tea table beneath attic rafters. Three seasonal bells guard the garden exit.',
  },
  'attic-cat': {
    file: 'adventure/attic-cat.png',
    alt: 'Your black cat waits in the attic with the friendly ghost, the tea table and the three seasonal bells.',
  },
  garden: {
    file: 'adventure/garden.png',
    alt: 'An open iron gate leads into a moonlit garden while the cottage ghost waves goodbye.',
  },
};

const chestHint = 'Count the legs in the note. Only one of the three symbols has eight.';
const bellHint = 'Think of the season when oak leaves fall and pumpkins are carved. Ring the leaf bell.';
const keyed = {key: true, seals: 1};
const accompanied = {...keyed, cat: true};

export const pages = [
  page('start', 'MIDNIGHT AT THE GARAGE', 'entrance', 'Find the way out. Or a reason to stay.', [
    'You followed a light through the trees. Now a ghost is holding the door open, and the garden gate has clicked shut behind you.',
    '"Two little locks," it says. "One key, one song. You can leave whenever you solve them. Tea is entirely optional."',
    'Two chapters, seven puzzles and six endings. Escape the house for a shorter adventure, or follow the unlit lanterns beyond the garden to discover the nightkeeper\'s story.',
    'Choose the wooden buttons to explore. There is no timer, wrong answers are recoverable, and you can bookmark any page to resume later.',
  ], [['ENTER THE HOUSE', 'foyer']]),
  page('foyer', 'THE FOYER', 'foyer', 'Find the brass key to the attic.', [
    'The floorboards creak a greeting. A staircase climbs toward a locked attic door. To your left, a candle burns in a room full of books.',
    'A black cat watches from the bottom step. The ghost points to the study, then carefully avoids making eye contact with the cat.',
  ], [['SEARCH THE STUDY', 'study'], ['TRY THE ATTIC', 'locked'], ['PET THE CAT', 'cat']]),
  page('locked', 'A VERY LOCKED DOOR', 'foyer', 'Find the brass key to the attic.', [
    'The attic handle turns exactly half an inch. A brass keyhole sits beneath a tiny carved spider.',
    '"The previous resident liked puzzles," says the ghost. "And refused to label the spare keys."',
  ], [['SEARCH THE STUDY', 'study'], ['BACK TO THE FOYER', 'foyer']], {
    hint: 'The key is in the study. The spider on this door is a clue.',
  }),
  page('study', 'EIGHT LEGS', 'study', 'Open the chest. Choose its correct symbol.', [
    'A small chest has three symbols on its lock: a moon, a pumpkin and a spider. The lid will not lift.',
    'The note beside it reads: "No wings to fly. No flame to light. Eight legs keep the brass key tight."',
    'Which symbol do you press?',
  ], [['PRESS THE MOON', 'wrong'], ['PRESS THE PUMPKIN', 'wrong'], ['PRESS THE SPIDER', 'key']], {
    hint: chestHint,
  }),
  page('wrong', 'A POLITE WARNING', 'study', 'The chest is still locked. Try another symbol.', [
    'Click. A tiny spring sneezes, and the symbol pops back out. Nothing breaks.',
    '"Eight," whispers the ghost from the doorway. "I counted twice. Spiders dislike being miscounted."',
  ], [['TRY THE LOCK AGAIN', 'study'], ['BACK TO THE FOYER', 'foyer']], {hint: chestHint}),
  page('key', 'THE BRASS KEY', 'study-open', 'First seal broken. Unlock the attic.', [
    'The spider symbol sinks into the wood. The lid springs open: a brass key rests on an orange ribbon.',
    'You tuck the key safely into your pocket. Somewhere upstairs, a bell sounds once. The chest is empty now.',
  ], [['UNLOCK THE ATTIC', 'attic'], ['BACK TO THE FOYER', 'foyer-key'], ['VISIT THE CAT', 'cat-key']], keyed),
  page('foyer-key', 'BACK IN THE FOYER', 'foyer', 'Use the brass key on the attic door.', [
    'The brass key warms your pocket. Upstairs, the carved spider seems to smile.',
    'The cat follows the orange ribbon with its eyes. It would clearly like an introduction.',
  ], [['UNLOCK THE ATTIC', 'attic'], ['VISIT THE CAT', 'cat-key'], ['REVISIT THE STUDY', 'study-key']], keyed),
  page('study-key', 'THE QUIET STUDY', 'study-open', 'The chest is solved. Continue to the attic.', [
    'You have already taken the brass key. There is nothing else in the chest except a receipt for an unreasonable number of candles.',
    'You leave the books as you found them. Some are still breathing.',
  ], [['UNLOCK THE ATTIC', 'attic'], ['BACK TO THE FOYER', 'foyer-key']], keyed),
  page('cat', 'YOU HAVE BEEN CHOSEN', 'foyer', 'Ending 03 of 06 - The Familiar', [
    'You sit on the bottom step and offer a hand. The cat climbs into your lap, circles once, and falls asleep.',
    'The ghost brings a blanket. The attic can wait. Apparently this is your home now.',
    'THE FAMILIAR - You did not escape the house. You were adopted by it.',
  ], [['GET UP AND EXPLORE', 'foyer']], {ending: 'familiar'}),
  page('cat-key', 'A FAMILIAR FRIEND', 'foyer', 'Companion found. Take your friend upstairs.', [
    'The cat catches the orange ribbon, gives the brass key one suspicious sniff, then hops onto your shoulder.',
    '"Excellent," says the ghost. "You have been approved by management." Your new companion stays with you for the rest of this run.',
  ], [['CLIMB TO THE ATTIC', 'attic-cat'], ['BACK TO THE FOYER', 'foyer-cat']], accompanied),
  page('foyer-cat', 'A HOUSE FOR TWO', 'foyer', 'Use the brass key. Your cat is coming too.', [
    'A soft purr accompanies every step. The cat watches the attic door; you still carry the brass key.',
    'Even the staircase seems less ominous with someone checking it for mice.',
  ], [['CLIMB TO THE ATTIC', 'attic-cat'], ['REVISIT THE STUDY', 'study-cat']], accompanied),
  page('study-cat', 'BOOKS AND WHISKERS', 'study-open', 'The chest is solved. Your companion stays with you.', [
    'The cat considers pushing a candle off the desk. You consider the fire risk. A diplomatic agreement is reached.',
    'You still have the brass key, and the attic is waiting.',
  ], [['CLIMB TO THE ATTIC', 'attic-cat'], ['BACK TO THE FOYER', 'foyer-cat']], accompanied),
  page('attic', 'THE ATTIC', 'attic', 'Find the song that opens the garden exit.', [
    'The brass key fits. Beyond the door, a steep-roofed attic smells of cedar and tea.',
    'Three bells hang over a second door: snowflake, sun and leaf. Beside them the ghost has set out two cups.',
    '"The garden is through there," it says. "But you are very welcome to stay."',
  ], [['INSPECT THE BELLS', 'bells'], ['ACCEPT THE TEA', 'tea'], ['BACK DOWNSTAIRS', 'foyer-key']], keyed),
  page('attic-cat', 'THE ATTIC', 'attic-cat', 'Find the song that opens the garden exit.', [
    'The brass key fits. Your cat pads into the attic and inspects the tea table without accepting an invitation.',
    'Three bells hang over the garden door: snowflake, sun and leaf. The ghost pours an extra saucer.',
    '"One last puzzle before the garden," it says. "Or one more cup."',
  ], [['INSPECT THE BELLS', 'bells-cat'], ['ACCEPT THE TEA', 'tea-cat'], ['BACK DOWNSTAIRS', 'foyer-cat']], accompanied),
  page('bells', 'THE LAST SONG', 'attic', 'Ring the bell for the season in the riddle.', [
    'Under the bells, a carved verse reads:',
    '"I dress the path in copper gold. I light the pumpkins as nights grow cold. Before the snow, after the sun - ring my season and you are done."',
    'The snowflake bell is winter. The sun bell is summer. The leaf bell is autumn.',
  ], [['RING THE SNOWFLAKE', 'wrong-bell'], ['RING THE SUN', 'wrong-bell'], ['RING THE LEAF', 'gate']], {...keyed, hint: bellHint}),
  page('bells-cat', 'THE LAST SONG', 'attic-cat', 'Ring the bell for the season in the riddle.', [
    'Under the bells, a carved verse reads:',
    '"I dress the path in copper gold. I light the pumpkins as nights grow cold. Before the snow, after the sun - ring my season and you are done."',
    'Snowflake, sun or leaf? Your cat paws at an oak leaf caught beneath the door.',
  ], [['RING THE SNOWFLAKE', 'wrong-bell-cat'], ['RING THE SUN', 'wrong-bell-cat'], ['RING THE LEAF', 'gate-cat']], {...accompanied, hint: bellHint}),
  page('wrong-bell', 'NOT QUITE THE SEASON', 'attic', 'The second seal holds. You can try again.', [
    'The bell makes a beautiful sound. The door remains completely unimpressed.',
    'The ghost points to the pumpkin on the table. "The house has a favourite season. Subtlety is not its strength."',
  ], [['TRY THE BELLS AGAIN', 'bells'], ['BACK TO THE ATTIC', 'attic']], {...keyed, hint: bellHint}),
  page('wrong-bell-cat', 'NOT QUITE THE SEASON', 'attic-cat', 'The second seal holds. You can try again.', [
    'The bell makes a beautiful sound. The door remains completely unimpressed.',
    'Your cat nudges the fallen oak leaf toward your shoe. The ghost politely pretends it has not just given you the answer.',
  ], [['TRY THE BELLS AGAIN', 'bells-cat'], ['BACK TO THE ATTIC', 'attic-cat']], {...accompanied, hint: bellHint}),
  page('gate', 'BOTH SEALS BROKEN', 'garden', 'The garden gate is open. Choose your ending.', [
    'The leaf bell rings with the sound of a hundred autumn evenings. The latch lifts. A staircase takes you down into the garden.',
    'Beyond the open gate, the path home glimmers in the moonlight. Behind you, the ghost is still holding a warm cup.',
  ], [['LEAVE THROUGH THE GATE', 'escape'], ['STAY FOR GHOST TEA', 'tea-open']], {...keyed, seals: 2}),
  page('gate-cat', 'BOTH SEALS BROKEN', 'garden', 'The garden gate is open. Nobody gets left behind.', [
    'The leaf bell rings. The latch lifts, and you follow the garden stairs with your cat balanced proudly on your shoulder.',
    'The path home is clear. The ghost waves a warm cup in your direction, just in case.',
  ], [['TAKE YOUR FRIEND HOME', 'escape-cat'], ['STAY FOR GHOST TEA', 'tea-open-cat']], {...accompanied, seals: 2}),
  page('escape', 'BACK BEFORE MIDNIGHT', 'garden', 'Ending 01 of 06 - The Escape', [
    'You step through the gate. Behind you, the cottage windows brighten and the ghost waves from the attic.',
    'The brass key is yours to keep. On its ribbon, someone has tied a note: "Next time, knock."',
    'THE ESCAPE - Two seals broken. One very good story. You found your way home.',
  ], [], {...keyed, seals: 2, ending: 'escape'}),
  page('escape-cat', 'NO ONE LEFT BEHIND', 'garden', 'Ending 04 of 06 - The Best Company', [
    'You step through the gate together. The cat leaps down, walks a few paces, then turns to make absolutely sure you are following.',
    'From the attic, the ghost waves. It has left a tiny saucer on the windowsill for your next visit.',
    'THE BEST COMPANY - Two seals broken, a new friend, and a homeward path. Some treasures follow you out.',
  ], [], {...accompanied, seals: 2, ending: 'company'}),
];

for (const [id, cat, seals] of [
  ['tea', false, 1], ['tea-cat', true, 1],
  ['tea-open', false, 2], ['tea-open-cat', true, 2],
]) {
  pages.push(page(id, 'ONE MORE CUP', cat ? 'attic-cat' : 'attic', 'Ending 02 of 06 - The Resident', [
    seals === 2 ? 'You could leave. Instead, you turn back toward the warm attic light.' : 'You set the brass key beside your cup. The last lock can wait.',
    cat ? 'The tea tastes of cinnamon. Your cat curls up beside you. By the second cup, your feet no longer quite touch the floor.' : 'The tea tastes of cinnamon and rain on warm stone. By the second cup, your feet no longer quite touch the floor.',
    '"The garage has room for another desk," says the ghost.',
    'THE RESIDENT - You came looking for a way out. You found a place to build something.',
  ], [], {key: true, cat, seals, ending: 'resident'}));
}

extendAdventure(pages, rooms);

export const endingGuide = [
  ['01 - The Escape', 'Solve the two house locks and leave through the garden gate without the cat.'],
  ['02 - The Resident', 'Accept the ghost\'s tea in the attic or return for tea after opening the gate.'],
  ['03 - The Familiar', 'Pet the cat before finding the brass key.'],
  ['04 - The Best Company', 'Find the key, befriend the cat, solve the bells and leave together.'],
  ['05 - The Lantern Road', 'Follow the unlit lanterns from the garden, complete all five repairs, then follow the light home.'],
  ['06 - The Nightkeeper', 'Complete the extended repair quest, then choose to stay and care for the beacon.'],
];
