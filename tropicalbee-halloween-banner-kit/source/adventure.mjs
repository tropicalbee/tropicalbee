import {extendAdventure} from './adventure-expansion.mjs';

// Each URL represents one complete game state. No account or server is needed.
const page = (id, title, room, objective, paragraphs, choices, extra = {}) => ({
  id, title, room, objective, paragraphs, choices,
  key: false, cat: false, seals: 0, ...extra,
});

export const rooms = {
  entrance: {
    file: 'adventure/night/entrance.png',
    alt: 'A dark spruce Halloween manor with stone foundations, cobwebs and a pumpkin-lit path to the front door.',
  },
  foyer: {
    file: 'adventure/night/foyer.png',
    alt: 'A spruce staircase, a closed attic door, a study doorway and a black cat in a dim stone hall lit by a pumpkin and lantern.',
  },
  study: {
    file: 'adventure/night/study.png',
    alt: 'A closed oak puzzle chest with moon, pumpkin and spider symbols in a quiet stone-and-spruce study.',
  },
  'study-open': {
    file: 'adventure/night/study-open.png',
    alt: 'The study chest stands open and empty. Its brass key is now in your inventory.',
  },
  attic: {
    file: 'adventure/night/attic.png',
    alt: 'A ghost waits by a tea table beneath attic rafters. Three seasonal bells guard the garden exit.',
  },
  'attic-cat': {
    file: 'adventure/night/attic-cat.png',
    alt: 'Your black cat waits in the attic with the silent caretaker, the tea table and the three seasonal bells.',
  },
  garden: {
    file: 'adventure/night/garden.png',
    alt: 'An open iron gate leads into a moonlit garden while the cottage ghost waves goodbye.',
  },
};

const chestHint = 'Count the legs in the note. Only one of the three symbols has eight.';
const bellHint = 'Think of the season when oak leaves fall and pumpkins are carved. Ring the leaf bell.';
const keyed = {key: true, seals: 1};
const accompanied = {...keyed, cat: true};

export const pages = [
  page('start', 'THE THIRTEENTH KNOCK', 'entrance', 'October 31. Briar House has opened its door again.', [
    'You were following the last trick-or-treaters when their costumes vanished between the trees. Only their paper candy bags remained. Ahead, a house stands on a plot that was empty yesterday.',
    'Something knocks from inside the front door. Twelve times. A pale caretaker opens it before the thirteenth. "Come in before she counts you," he whispers. Behind you, the gate locks.',
    'Every jack-o\'-lantern turns toward the sound of your breathing. One mouths your name. You have not told anyone here your name.',
    'A Halloween horror adventure in two chapters, with seven puzzles and six endings. Choose the stone buttons to explore. There is no real-time countdown; wrong answers allow retries, and bookmarking a page saves your place.',
  ], [['ENTER THE HOUSE', 'foyer']]),
  page('foyer', 'THE FOYER', 'foyer', 'Find the brass key to the attic.', [
    'The front door closes without touching its frame. A staircase leads to a locked attic. To your left, a candle burns in the study. Your muddy footprints continue across the floor several steps ahead of you.',
    'The caretaker calls himself Elias. A black cat hisses at the shadow behind him. Elias has no body solid enough to cast one.',
    '"The study key. Then the autumn bell," he says. "And whatever you hear outside, do not say trick or treat back."',
  ], [['SEARCH THE STUDY', 'study'], ['TRY THE ATTIC', 'locked'], ['PET THE CAT', 'cat']]),
  page('locked', 'SOMETHING ON THE STAIRS', 'foyer', 'Find the brass key to the attic.', [
    'A brass keyhole sits beneath a carved spider. Through the attic door, someone drags a chair into place directly opposite you.',
    '"She cannot cross a locked threshold," Elias says. "Neither can you. Find the key before she remembers which side you are on."',
  ], [['SEARCH THE STUDY', 'study'], ['BACK TO THE FOYER', 'foyer']], {
    hint: 'The key is in the study. The spider on this door is a clue.',
  }),
  page('study', 'EIGHT LEGS', 'study', 'Open the chest. Choose its correct symbol.', [
    'Three symbols mark an oak chest: moon, pumpkin, spider. A childish hand has scratched October 31 into the desk beside it, over and over.',
    'A note reads: "No wings to fly. No flame to light. Eight legs keep the brass key tight." Beneath it, in another hand: "She can borrow your voice. She cannot undo my locks. - E."',
    'Which symbol do you press?',
  ], [['PRESS THE MOON', 'wrong'], ['PRESS THE PUMPKIN', 'wrong'], ['PRESS THE SPIDER', 'key']], {
    hint: chestHint,
  }),
  page('wrong', 'A VOICE IN THE CHEST', 'study', 'The chest is still locked. Try another symbol.', [
    'The symbol springs back. From inside the chest comes your own voice: "Let me out." It is younger than you remember.',
    'You keep the lid shut. The note still says eight legs. Whatever is imitating you does not know the answer.',
  ], [['TRY THE LOCK AGAIN', 'study'], ['BACK TO THE FOYER', 'foyer']], {hint: chestHint}),
  page('key', 'THE BRASS KEY', 'study-open', 'First seal broken. Unlock the attic.', [
    'The spider sinks into the wood. A brass key rests inside on an orange ribbon, cold enough to hurt. When you lift it, the voice stops.',
    'The chest is empty now. Under the lid someone has carved: "A guest may leave. A name may not." Upstairs, a bell rings once.',
  ], [['UNLOCK THE ATTIC', 'attic'], ['BACK TO THE FOYER', 'foyer-key'], ['VISIT THE CAT', 'cat-key']], keyed),
  page('foyer-key', 'BACK IN THE FOYER', 'foyer', 'Use the brass key on the attic door.', [
    'The key makes the false footprints fade. At the top of the stairs, the handle turns once from the other side and stops.',
    'The cat watches the orange ribbon. Elias keeps looking at your mouth, as though waiting for you to answer a question nobody has asked.',
  ], [['UNLOCK THE ATTIC', 'attic'], ['VISIT THE CAT', 'cat-key'], ['REVISIT THE STUDY', 'study-key']], keyed),
  page('study-key', 'THE QUIET STUDY', 'study-open', 'The chest is solved. Continue to the attic.', [
    'The chest is still empty. In the open ledger, every entry is dated Halloween. Each name has been crossed out; each number matches a pumpkin in the garden.',
    'At the bottom, a new line begins writing itself. You shut the book before it reaches your surname.',
  ], [['UNLOCK THE ATTIC', 'attic'], ['BACK TO THE FOYER', 'foyer-key']], keyed),
  page('cat', 'YOU HAVE BEEN CHOSEN', 'foyer', 'Ending 03 of 06 - The Familiar', [
    'Without the brass key to protect you, you sit on the bottom step. The cat settles in your lap. Its purring matches the scratching beneath the floor.',
    'You dream of chasing a ribbon through the house. When you wake, the stairs tower above you. Two black cats stare from the hallway mirror. Neither reflection belongs to a person.',
    'THE FAMILIAR - Next Halloween, you will try to warn the next visitor. All they will hear is a hiss. Choose GET UP AND EXPLORE to return to the moment before you fell asleep.',
  ], [['GET UP AND EXPLORE', 'foyer']], {ending: 'familiar'}),
  page('cat-key', 'THE CAT SEES HER', 'foyer', 'Companion found. Keep the brass key close.', [
    'The cat touches the key with one paw, then climbs onto your shoulder. Its eyes follow something moving along the ceiling. You see only wood.',
    'Elias steps away. "She dislikes anything that can see her without being invited." The cat stays with you from here.',
  ], [['CLIMB TO THE ATTIC', 'attic-cat'], ['BACK TO THE FOYER', 'foyer-cat']], accompanied),
  page('foyer-cat', 'A SECOND SET OF EYES', 'foyer', 'Use the brass key. Your cat is coming too.', [
    'Your cat goes rigid whenever the lantern flickers. In the dark between each flicker, one more stair creaks above you.',
    'You still have the key. The cat will not let you look behind the banister.',
  ], [['CLIMB TO THE ATTIC', 'attic-cat'], ['REVISIT THE STUDY', 'study-cat']], accompanied),
  page('study-cat', 'THE UNFINISHED NAME', 'study-open', 'The chest is solved. Your companion stays with you.', [
    'A quill moves across the ledger by itself. The cat knocks it to the floor before the final letter of your name can form.',
    'You close the book. The key is still in your pocket; the cat stays pressed against your shoulder. Something beneath the desk exhales.',
  ], [['CLIMB TO THE ATTIC', 'attic-cat'], ['BACK TO THE FOYER', 'foyer-cat']], accompanied),
  page('attic', 'THE ATTIC', 'attic', 'Find the song that opens the garden exit.', [
    'The key fits. The attic smells of wet leaves and burnt sugar. A tea table is laid for two. The second cup has your initials on it.',
    'Three bells guard the garden exit: snowflake, sun and leaf. Elias stands beside the cups, repeating, "A little warmth before you go." His lips keep moving after the words stop.',
    'Under the table, his hand points urgently toward the bells.',
  ], [['INSPECT THE BELLS', 'bells'], ['ACCEPT THE TEA', 'tea'], ['BACK DOWNSTAIRS', 'foyer-key']], keyed),
  page('attic-cat', 'THE ATTIC', 'attic-cat', 'Find the song that opens the garden exit.', [
    'The attic smells of burnt sugar. Three bells guard the garden exit: snowflake, sun and leaf. Elias sets a saucer beside two cups.',
    'Your cat refuses the saucer. In its reflection, someone very tall is standing behind your chair. The space itself is empty.',
    '"A little warmth before you go," Elias says. Beneath the table, his hand points urgently toward the bells.',
  ], [['INSPECT THE BELLS', 'bells-cat'], ['ACCEPT THE TEA', 'tea-cat'], ['BACK DOWNSTAIRS', 'foyer-cat']], accompanied),
  page('bells', 'THE HALLOWS BELL', 'attic', 'Ring the season that opens the Halloween threshold.', [
    'Beneath the bells, Elias has scratched a verse into the door:',
    '"When harvest ends and masks are worn, the borrowed dead walk until morn. Before the snow, beyond the sun, ring falling leaves and let me run."',
    'Snowflake for winter, sun for summer, leaf for autumn. Behind you, a teaspoon stirs a cup without a hand.',
  ], [['RING THE SNOWFLAKE', 'wrong-bell'], ['RING THE SUN', 'wrong-bell'], ['RING THE LEAF', 'gate']], {...keyed, hint: bellHint}),
  page('bells-cat', 'THE HALLOWS BELL', 'attic-cat', 'Ring the season that opens the Halloween threshold.', [
    'Beneath the bells, Elias has scratched a verse into the door:',
    '"When harvest ends and masks are worn, the borrowed dead walk until morn. Before the snow, beyond the sun, ring falling leaves and let me run."',
    'Snowflake, sun or leaf? Your cat claws at an oak leaf beneath the door. The saucer slides across the floor toward it.',
  ], [['RING THE SNOWFLAKE', 'wrong-bell-cat'], ['RING THE SUN', 'wrong-bell-cat'], ['RING THE LEAF', 'gate-cat']], {...accompanied, hint: bellHint}),
  page('wrong-bell', 'SHE HEARD THAT', 'attic', 'The second seal holds. You can try again.', [
    'The wrong bell rings. Every pumpkin outside answers with a whisper. For a moment, a long shadow covers the garden door.',
    'It recedes when you touch the brass key. Think of Halloween: fallen leaves, harvest, autumn. Try the bells again.',
  ], [['TRY THE BELLS AGAIN', 'bells'], ['BACK TO THE ATTIC', 'attic']], {...keyed, hint: bellHint}),
  page('wrong-bell-cat', 'SHE HEARD THAT', 'attic-cat', 'The second seal holds. You can try again.', [
    'The wrong bell rings. Your cat arches its back at a shadow covering the garden door. The shadow folds away when you touch the key.',
    'The cat pushes the fallen oak leaf against your shoe. Halloween belongs to autumn. You can try again.',
  ], [['TRY THE BELLS AGAIN', 'bells-cat'], ['BACK TO THE ATTIC', 'attic-cat']], {...accompanied, hint: bellHint}),
  page('gate', 'BOTH SEALS BROKEN', 'garden', 'The garden gate is open. Choose your ending.', [
    'The leaf bell rings. Outside, the carved mouths fall silent. A narrow stair takes you into the garden, and the iron gate swings open.',
    'You can see the road home. Then a pumpkin beside your shoe whispers, "Please. My name was Ada." In the attic window, Elias still holds out the cup.',
  ], [['LEAVE THROUGH THE GATE', 'escape'], ['STAY FOR GHOST TEA', 'tea-open']], {...keyed, seals: 2}),
  page('gate-cat', 'BOTH SEALS BROKEN', 'garden', 'The garden gate is open. Nobody gets left behind.', [
    'The leaf bell opens the garden exit. Your cat clings to your shoulder as you descend. The road home is visible beyond the iron gate.',
    'A pumpkin beside the path whispers, "My name was Ada." The cat touches its carved mouth. In the attic window, Elias holds out the cup with a trembling hand.',
  ], [['TAKE YOUR FRIEND HOME', 'escape-cat'], ['STAY FOR GHOST TEA', 'tea-open-cat']], {...accompanied, seals: 2}),
  page('escape', 'THE LAST TRICK OR TREATER', 'garden', 'Ending 01 of 06 - The Unfinished Visit', [
    'You reach the road as the town clock strikes twelve. Briar House vanishes. The key remains in your hand, tied to a ribbon bearing next Halloween\'s date.',
    'At home, your porch pumpkin turns toward the door. From inside it comes Ada\'s whisper: "You left us."',
    'THE UNFINISHED VISIT - You escaped. The names are still trapped, and the house knows where to send its next invitation.',
  ], [], {...keyed, seals: 2, ending: 'escape'}),
  page('escape-cat', 'SOMETHING FOLLOWED', 'garden', 'Ending 04 of 06 - The Watcher at the Window', [
    'The cat leads you through the gate without once looking back. At the edge of town, you hear a third set of footsteps stop when yours do.',
    'At home, the cat takes its place at your bedroom window. All night, something outside politely asks to be let in. It uses Elias\'s voice.',
    'THE WATCHER AT THE WINDOW - You both escaped. The cat keeps the thing outside. Every October 31, you remember to shut the windows before dark.',
  ], [], {...accompanied, seals: 2, ending: 'company'}),
];

for (const [id, cat, seals] of [
  ['tea', false, 1], ['tea-cat', true, 1],
  ['tea-open', false, 2], ['tea-open-cat', true, 2],
]) {
  pages.push(page(id, 'A PLACE AT HER TABLE', cat ? 'attic-cat' : 'attic', 'Ending 02 of 06 - The Empty Costume', [
    seals === 2 ? 'The gate is open, but you return to the table. Elias tries to spill your cup. His hand passes through it.' : 'You set the key beside your cup. Elias mouths a warning, but a different voice comes out: "Drink."',
    cat ? 'Your cat strikes the cup too late. The tea tastes of burnt sugar. You try to say your name and find an empty space where the word should be.' : 'The tea tastes of burnt sugar. You try to say your name and find an empty space where the word should be.',
    'On the chair lies your Halloween coat, still shaped around someone who is no longer there. A new pumpkin lights up in the garden.',
    'THE EMPTY COSTUME - When the next visitor arrives, your voice will join the others asking to be taken home.',
  ], [], {key: true, cat, seals, ending: 'resident'}));
}

extendAdventure(pages, rooms);

export const endingGuide = [
  ['01 - The Unfinished Visit', 'Solve the two house locks and leave through the garden gate without the cat.'],
  ['02 - The Empty Costume', 'Accept the caretaker\'s tea in the attic or return for tea after opening the gate.'],
  ['03 - The Familiar', 'Pet the cat before finding the brass key.'],
  ['04 - The Watcher at the Window', 'Find the key, befriend the cat, solve the bells and leave together.'],
  ['05 - All Souls Home', 'Follow the unlit lanterns, restore the five parts of the ward, then lead the stolen names home.'],
  ['06 - The October Keeper', 'Restore the ward, then stay to guard the threshold against next Halloween.'],
];
