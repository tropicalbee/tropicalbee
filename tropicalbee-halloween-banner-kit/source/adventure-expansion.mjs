// Chapter two keeps the original exit available and carries both companion routes.
export function extendAdventure(pages, rooms) {
  Object.assign(rooms, {
    greenhouse: {file: 'adventure/night/greenhouse.png', alt: 'A moonlit glass-block greenhouse with a silver flower and sun, rain and moon irrigation valves.'},
    cellar: {file: 'adventure/night/cellar.png', alt: 'A flooded stone-brick cellar with a dry raised walkway, a copper pump and amber, blue and green fuses.'},
    workshop: {file: 'adventure/night/workshop.png', alt: 'A spruce workbench holds a lantern frame, copper coil, glass lens and socket, gear and prism circuit tiles.'},
    observatory: {file: 'adventure/night/observatory.png', alt: 'A block-built telescope points through an open roof toward a four-star diamond, beside an empty beacon pedestal.'},
  });

  const equipment = [
    [],
    ['Moonseed'],
    ['Moonseed', 'Copper coil'],
    ['Moonseed', 'Copper coil', 'Star lantern'],
    ['Moonseed', 'Copper coil', 'Star lantern', 'Sky bearing'],
    ['Moonseed', 'Copper coil', 'Star lantern', 'Sky bearing', 'Beacon restored'],
  ];
  const notes = [
    'Briar House steals names every Halloween. Elias left a broken beacon ward; restoring it can release the names.',
    'Moon water opens the silver flower. Its moonseed reveals things the haunting conceals.',
    'Pump fuse order: amber before blue, blue before green. The dry cabinet holds the copper coil.',
    'Lantern circuit: socket receives the seed, gear draws the current, prism sends the light outward.',
    'The four-star diamond points north. The observatory bearing is now recorded.',
    'Beacon sequence: seed, coil, lantern. The restored ward releases the names and holds the October threshold shut.',
  ];

  for (const cat of [false, true]) {
    const suffix = cat ? '-cat' : '';
    const target = id => `${id}${suffix}`;
    const add = (id, title, room, progress, objective, paragraphs, choices, extra = {}) => {
      pages.push({
        id: target(id), title, room, objective, paragraphs,
        choices: choices.map(([label, to]) => [label, target(to)]),
        key: true, cat, seals: 2, chapter: 2, progress,
        equipment: equipment[progress], journal: notes.slice(0, progress + 1),
        ...extra,
      });
    };
    const originalGate = pages.find(p => p.id === target('gate'));
    originalGate.paragraphs.push('A trail of unlit lanterns leads toward a greenhouse. A note tied to the first post reads: "The gate saves one guest. The beacon can save every name. Five parts remain. - Elias"');
    originalGate.choices.push(['FOLLOW THE LANTERNS', target('trail')]);

    add('trail', 'THE PUMPKINS HAVE NAMES', 'garden', 0, 'Chapter two - restore the ward and free the stolen names.', [
      'You leave the open gate behind. As you pass each pumpkin, it whispers a different name. Ada. Thomas. Nell. Some voices sound very old. None remember leaving this garden.',
      'Elias calls from the window, "I built a light to send them home. She put it out." Another voice speaks through him: "Such a helpful guest."',
      cat ? 'Your cat watches the gap between the trees. Something there wears a different Halloween mask every time you blink.' : 'Between the trees hangs a white Halloween mask. When you blink, it is one trunk closer.',
      'His note lists five parts of the ward: moonseed, copper coil, star lantern, northern bearing, beacon. The house has kept them apart. You still have the brass key.',
    ], [['ENTER THE GREENHOUSE', 'greenhouse'], ['READ THE OLD NOTICE', 'notice'], ['RETURN TO THE GATE', 'gate']]);
    add('notice', 'THE OCTOBER RULE', 'garden', 0, 'Discovery - why the house appears on Halloween.', [
      'Beneath the notice is an older warning: "On All Hallows\' Eve, the boundary thins. Mother Hollow may knock twelve times. A living invitation gives her the thirteenth."',
      '"She keeps her guests by taking their names. Do not answer her call. Do not eat at her table. A jack-o\'-lantern is a face she has already borrowed."',
      'Elias has written across the bottom: "My beacon held the threshold. I let it fail. The key protects your name while you repair it, unless you willingly give it away."',
    ], [['CONTINUE TO THE GLASS', 'greenhouse'], ['BACK TO THE PATH', 'trail']]);
    add('greenhouse', 'THE MOON GARDEN', 'greenhouse', 0, 'Wake the silver flower without flooding its roots.', [
      'Inside the glass-block greenhouse, a silver flower grows in soil that has never seen daylight. Beyond the panes, carved pumpkin faces turn slowly away from it.',
      'Three valves feed its planter: sun, rain and moon. A botanical notebook lies on the stone shelf. Something taps against the glass when you look down.',
      cat ? 'Your cat stays beside the silver flower. Its reflection watches a different window.' : 'Your reflection keeps looking out of the window after you have turned away.',
    ], [['READ THE BOTANIST NOTES', 'botanist'], ['INSPECT THE VALVES', 'valves'], ['SEARCH THE SEED DRAWER', 'seed-drawer']]);
    add('botanist', 'WATER THAT REMEMBERS', 'greenhouse', 0, 'Clue - choose the water the flower can use.', [
      'The notebook describes three supplies. Sun water is warm and meant for the pumpkins. Rain water feeds the thirsty ferns.',
      '"The moonflower drinks neither heat nor abundance. Give it the quiet water from the trough beneath the glass roof. Its seed reveals whatever has borrowed a face."',
      'A crescent marks the trough. In its reflection, the empty doorway is crowded with people in paper masks.',
    ], [['INSPECT THE VALVES', 'valves'], ['BACK TO THE FLOWER', 'greenhouse']]);
    add('seed-drawer', 'LAST YEARS HARVEST', 'greenhouse', 0, 'Discovery - what grows inside the pumpkins.', [
      'The seed packets bear names instead of plant varieties. Ada Bell. Thomas Reed. Nell Wren. Every sowing date is October 31.',
      'Ada\'s packet contains a tiny paper witch hat. It matches one of the costumes you followed into the trees.',
      'On the drawer bottom, Elias has scratched: "Their bodies went home empty. Their names are still here."',
    ], [['READ THE BOTANIST NOTES', 'botanist'], ['INSPECT THE VALVES', 'valves']]);
    add('valves', 'THREE KINDS OF WATER', 'greenhouse', 0, 'Puzzle 03 - choose one irrigation valve.', [
      'The three handles resist, then loosen. Outside, a borrowed voice asks what you are growing. You do not answer.',
      'Sun warms the pumpkins. Rain feeds the ferns. Moon catches the night in a shallow trough. Which belongs to the silver flower?',
    ], [['OPEN THE SUN VALVE', 'wrong-water'], ['OPEN THE RAIN VALVE', 'wrong-water'], ['OPEN THE MOON VALVE', 'moonseed']], {
      hint: 'The botanical note points to the crescent-marked trough. Choose the moon valve.',
    });
    add('wrong-water', 'FINGERS ON THE GLASS', 'greenhouse', 0, 'The petals stay closed. Choose a different supply.', [
      'The flower closes. On the other side of the roof, five long streaks appear in the condensation. Something has found a hand.',
      'You shut the valve. The overflow drains away; the flower is unharmed. The crescent-marked trough is still full.',
    ], [['TRY THE VALVES AGAIN', 'valves'], ['READ THE NOTEBOOK', 'botanist']]);
    add('moonseed', 'WHAT THE LIGHT REVEALS', 'greenhouse', 1, 'Moonseed collected. Recover the copper coil below.', [
      'Moon water reaches the roots. The flower opens around a pale seed. When you lift it, every false reflection vanishes at once.',
      'For an instant you see the garden clearly: the pumpkins hold small, frightened lights. Beyond them stands something tall without a face. It backs away from the seed.',
      'A pipe descends into the cellar. Elias\'s notebook says the copper coil below can carry the seed\'s light into a protective lantern.',
    ], [['DESCEND TO THE CELLAR', 'cellar'], ['READ THE PIPE LABEL', 'pipe-note']]);
    add('pipe-note', 'FOLLOW THE COPPER', 'greenhouse', 1, 'Clue - the pump circuit has an order.', [
      'A maintenance note wraps the pipe: "Amber wakes before blue. Blue wakes before green." Beneath it: "If the water starts speaking, stay on the walkway."',
      'Three paint spots repeat the order. As you descend, something below clears its throat.',
    ], [['DESCEND TO THE CELLAR', 'cellar'], ['BACK TO THE MOONSEED', 'moonseed']]);
    add('cellar', 'UNDER THE FLOORBOARDS', 'cellar', 1, 'Restore the pump to reach the spare copper coil.', [
      'Black water covers the stone floor. A dry raised walkway leads to the idle pump. Your light catches faces under the surface; they disappear before you can count them.',
      'The copper coil rests above a cabinet across the flooded section. Three loose fuses wait by the pump. You need the water lowered to reach it.',
      cat ? 'Your cat stays on your shoulder. From the water, another cat calls in exactly its voice.' : 'From the water comes the voice of someone you trust, asking you to step down.',
    ], [['READ THE PUMP CHART', 'pump-chart'], ['FIT THE THREE FUSES', 'fuses'], ['CHECK THE DRY SHELF', 'cellar-shelf']]);
    add('pump-chart', 'CURRENT AND COLOUR', 'cellar', 1, 'Clue - fit all three fuses in the correct order.', [
      'The chart gives two rules: amber must come before blue; green must come after blue.',
      'Below the rules, someone has written: "Listen to the chart. The water lies." Only one left-to-right order satisfies both rules.',
    ], [['FIT THE THREE FUSES', 'fuses'], ['BACK TO THE WALKWAY', 'cellar']]);
    add('cellar-shelf', 'THE COSTUMES LEFT BEHIND', 'cellar', 1, 'Discovery - the missing guests were never visitors by chance.', [
      'The shelf holds a paper crown, a cracked skull mask and a candy bag with Ada\'s name on it. None of the sweets have wrappers.',
      'A register lists one Halloween after another. Beside every guest, the same phrase: "Answered the door."',
      'The newest entry describes your coat. Its space for a name is still blank. The brass key grows cold in your pocket.',
    ], [['FIT THE THREE FUSES', 'fuses'], ['BACK TO THE WALKWAY', 'cellar']]);
    add('fuses', 'WAKE THE PUMP', 'cellar', 1, 'Puzzle 04 - arrange the fuses from left to right.', [
      'You hold the amber, blue and green fuses above the sockets. Amber before blue. Green after blue.',
      'Choose the order, then turn the insulated starter handle.',
    ], [['AMBER - BLUE - GREEN', 'coil'], ['BLUE - AMBER - GREEN', 'wrong-fuses'], ['AMBER - GREEN - BLUE', 'wrong-fuses']], {
      hint: 'Blue belongs between the other two: amber, then blue, then green.',
    });
    add('wrong-fuses', 'THE WATER ANSWERS', 'cellar', 1, 'The pump stays off. Reorder the fuses.', [
      'The relay clicks off. Three knocks travel through the pipes. In the water, your reflection smiles without you.',
      'You release the handle. The fuses are intact. Amber before blue, green after blue: the chart has not changed.',
    ], [['TRY THE FUSES AGAIN', 'fuses'], ['READ THE PUMP CHART', 'pump-chart']]);
    add('coil', 'THE WATER RECEDES', 'cellar', 2, 'Copper coil collected. Visit the workshop.', [
      'The pump shudders into life. As the water drops, the voices recede into a drain too narrow for a person.',
      'You cross the exposed stones and take the copper coil. Beside it lies a strip of scorched ribbon matching the one on your key.',
      'A short stair leads to Elias\'s workshop. On its first step is a footprint facing the wrong way.',
    ], [['ENTER THE WORKSHOP', 'workshop'], ['READ THE REPAIR LOG', 'repair-log']]);
    add('repair-log', 'THE NIGHT THE WARD FAILED', 'cellar', 2, 'Discovery - someone opened the house from within.', [
      '"October 31. She used Ada\'s voice outside the door. I knew Ada was already inside. I opened it anyway."',
      '"The beam died. She scattered its parts and took my name. I can touch no tool now. I left the lantern frame on the workshop bench before my hands went through it."',
    ], [['ENTER THE WORKSHOP', 'workshop'], ['BACK TO THE PUMP', 'coil']]);
    add('workshop', 'THE CARETAKERS LAST WORK', 'workshop', 2, 'Build the lantern that can carry the ward upstairs.', [
      'The bench holds an empty lantern frame, a glass lens and three circuit positions. Every tool has been tied down, as though someone feared the house would move it.',
      'You set down the moonseed and coil. The shadow in the doorway stops at the edge of their light. Both items remain with you as parts of the lantern.',
      'A diagram and an unsent letter lie beneath the lens. Across the window, a finger writes: "He invited me."',
    ], [['READ THE CIRCUIT PLAN', 'circuit-plan'], ['CONNECT THE LANTERN', 'circuit'], ['READ THE LETTER', 'letter']]);
    add('circuit-plan', 'FROM LIGHT TO LIGHT', 'workshop', 2, 'Clue - follow the direction of energy.', [
      'The socket receives the glowing seed. The gear draws current through the coil. The prism spreads the light toward the road.',
      'The diagram warns: "A lens has nothing to send until the current reaches it. Keep the light unbroken; she enters through gaps."',
      'Arrange the three parts in the order energy passes through them.',
    ], [['CONNECT THE LANTERN', 'circuit'], ['BACK TO THE WORKBENCH', 'workshop']]);
    add('letter', 'THE INVITATION WAS MINE', 'workshop', 2, 'Discovery - Elias is a prisoner, and his welcome is part of the trap.', [
      '"Ada was my daughter. The thing outside sounded so frightened that I answered, though I had just put her to bed. That was the thirteenth knock."',
      '"Now she makes me welcome the next guest. If I offer tea, watch my hands. I can still point to an exit. I cannot make my mouth tell you why."',
      '"The beacon releases every stolen name when it faces the northern path. Afterward, leave with them, or keep the light through the next October. Never answer the thirteenth knock."',
    ], [['CONNECT THE LANTERN', 'circuit'], ['READ THE CIRCUIT PLAN', 'circuit-plan']]);
    add('circuit', 'KEEP THE LIGHT UNBROKEN', 'workshop', 2, 'Puzzle 05 - connect receiver, current and light.', [
      'Socket, gear, prism. Three parts and one continuous path.',
      'Choose the order from the seed toward the beam. Something scratches at the window in time with your movements.',
    ], [['SOCKET - GEAR - PRISM', 'lantern'], ['PRISM - SOCKET - GEAR', 'wrong-circuit'], ['GEAR - PRISM - SOCKET', 'wrong-circuit']], {
      hint: 'Receive first, carry second, send last: socket, gear, prism.',
    });
    add('wrong-circuit', 'THE GAP IN THE LIGHT', 'workshop', 2, 'The lantern stays dim. Reconnect the circuit.', [
      'The current breaks. In the dark glass lens, you see a face wearing your eyes. It leans closer.',
      'You lift the moonseed and the face disappears. The parts are intact. Follow the diagram from source to beam.',
    ], [['TRY THE CIRCUIT AGAIN', 'circuit'], ['READ THE CIRCUIT PLAN', 'circuit-plan']]);
    add('lantern', 'SHE HAS NO FACE', 'workshop', 3, 'Star lantern assembled. Find the northern path upstairs.', [
      'A thin white star appears in the lantern. At the window, a dozen borrowed faces peel away into darkness. Mother Hollow has nothing beneath them.',
      'She withdraws into the trees. The seed and coil remain secured inside the lantern you carry. For now, its light reaches farther than her hands.',
      'A narrow stair climbs to the observatory. The beacon must face the path that leads out of her October night.',
    ], [['CLIMB TO THE DOME', 'observatory'], ['READ THE BUILDERS NOTE', 'builders-note']]);
    add('builders-note', 'TWELVE SCRATCHES', 'workshop', 3, 'Discovery - the ward was renewed every Halloween.', [
      'Twelve scratches mark the underside of the lantern. Each is dated October 31, one year apart. The thirteenth was never finished.',
      'Elias wrote beside them: "The light does not kill her. It shuts the door. Someone must keep it burning when the boundary thins again."',
      'You tighten the last screw. From the front of the house comes a single knock.',
    ], [['CLIMB TO THE DOME', 'observatory'], ['BACK TO THE LANTERN', 'lantern']]);
    add('observatory', 'THE SKY SHE CANNOT CHANGE', 'observatory', 3, 'Find the true bearing beyond the Halloween threshold.', [
      'The stepped roof opens onto a sky without a moon. Four stars form a diamond above the trees. Below, every path seems to bend back toward the house.',
      'The telescope has north, east and west bearings. Elias left a chart beside it. Your lantern keeps the stairs behind you lit.',
      cat ? 'Your cat watches the stairwell. When it growls, the knocking below stops for a moment.' : 'The second knock rises through the floor. The stars do not move.',
    ], [['READ THE STAR CHART', 'star-chart'], ['ALIGN THE TELESCOPE', 'bearing'], ['LISTEN AT THE DOME', 'dome-note']]);
    add('star-chart', 'THE STILL POINT', 'observatory', 3, 'Clue - use the star that stays above the northern trees.', [
      'The chart reads: "The sun rises in the east and sets in the west. Our diamond stays above the northern pines."',
      'Underneath: "She can move a path, borrow a face, mimic a voice. She cannot move these four stars." Align with the northern diamond.',
    ], [['ALIGN THE TELESCOPE', 'bearing'], ['BACK TO THE DOME', 'observatory']]);
    add('dome-note', 'TRICK OR TREAT', 'observatory', 3, 'Discovery - she needs an answer to complete the invitation.', [
      'From the front door, children call, "Trick or treat." One of the voices is your own. You keep your mouth shut.',
      'Elias answers from the attic, over and over: "No one is home." For the first time, you hear the effort it costs him.',
    ], [['READ THE STAR CHART', 'star-chart'], ['ALIGN THE TELESCOPE', 'bearing']]);
    add('bearing', 'THE HOMEWARD BEARING', 'observatory', 3, 'Puzzle 06 - choose the direction of the star diamond.', [
      'You loosen the telescope mount and turn the bearing ring. The chart describes a still diamond above the northern pines.',
      'Where should the lantern point?',
    ], [['SET NORTH', 'aligned'], ['SET EAST', 'wrong-bearing'], ['SET WEST', 'wrong-bearing']], {
      hint: 'The star chart names the northern pines. Set the bearing north.',
    });
    add('wrong-bearing', 'THE WRONG WINDOW', 'observatory', 3, 'The diamond is outside the lens. Adjust the bearing.', [
      'Instead of stars, the lens shows your bedroom window from outside. Something is standing where you would stand to look in.',
      'You turn away. The lantern remains lit. Find the four-star diamond above the northern pines.',
    ], [['TRY THE BEARING AGAIN', 'bearing'], ['READ THE STAR CHART', 'star-chart']]);
    add('aligned', 'FOUR STARS IN THE GLASS', 'observatory', 4, 'Sky bearing recorded. Restore the beacon.', [
      'The diamond settles into the lens. One path through the trees straightens. Along it, the pumpkin mouths begin whispering their names together.',
      'You lock the bearing ring. Three catches wait on the beacon pedestal. Downstairs, the twelfth knock falls.',
      'The final instruction card lies beneath the catches. Mother Hollow cannot make the thirteenth without an answer. You have time to read.',
    ], [['READ THE STARTUP CARD', 'startup'], ['START THE BEACON', 'beacon']]);
    add('startup', 'ONE LAST CHECK', 'observatory', 4, 'Clue - wake the source, carry the current, release the light.', [
      'The card says: "Wake the moonseed. Seat the copper coil. Open the lantern shutter."',
      'The order matters. A shutter cannot guide light that has not yet reached it.',
      'At the bottom: "Do not speak while starting it. Whatever calls your name, let the light answer."',
    ], [['START THE BEACON', 'beacon'], ['BACK TO THE BEARING', 'aligned']]);
    add('beacon', 'BEFORE THE THIRTEENTH KNOCK', 'observatory', 4, 'Puzzle 07 - restore the ward without answering her.', [
      'Your hands rest on the three catches: seed, coil, lantern. The sky bearing is locked in place.',
      'From below, Ada calls for her father. Elias says nothing. Choose the startup sequence; let the light answer.',
    ], [['SEED - COIL - LANTERN', 'restored'], ['LANTERN - SEED - COIL', 'wrong-beacon'], ['COIL - LANTERN - SEED', 'wrong-beacon']], {
      hint: 'Follow the commissioning card exactly: seed, coil, lantern.',
    });
    add('wrong-beacon', 'HOLD YOUR ANSWER', 'observatory', 4, 'The interlock holds. Review the startup order.', [
      'The catch slips back. From below, your own voice asks, "Are you still there?" You swallow the answer.',
      'The parts are unharmed. The twelfth knock still hangs in the silence. Read the card and try the sequence again.',
    ], [['TRY STARTUP AGAIN', 'beacon'], ['READ THE STARTUP CARD', 'startup']]);
    add('restored', 'THE NAMES COME HOME', 'observatory', 5, 'The ward is restored. Leave with the names, or keep the threshold.', [
      'Seed. Coil. Lantern. The beam strikes the northern path. Every pumpkin goes dark; small lights rise from their mouths and gather beyond the gate.',
      'A hand presses against the outside of the window. With no face left to borrow, Mother Hollow slips between the trees. The thirteenth knock never comes.',
      'Elias reaches the stair, his own voice at last. "Ada?" One small light waits for him. Before joining it, he tells you the ward will need a keeper when next Halloween comes.',
    ], [['FOLLOW THE LIGHT HOME', 'dawn'], ['BECOME THE NIGHTKEEPER', 'keeper']]);
    add('dawn', 'NOVEMBER FIRST', 'garden', 5, 'Ending 05 of 06 - All Souls Home', [
      'You lead the lights through the northern pines. At each turning, a name leaves you for a house in town. Curtains stir. Someone remembers who they are.',
      cat ? 'Your cat walks beside the last two lights: Elias and Ada. They fade together where the forest ends.' : 'The last two lights are Elias and Ada. They fade together where the forest ends.',
      'At dawn, Briar House is an empty plot again. You post the caretaker\'s warning on the town noticeboard and keep the key. Next October, you will return before anyone knocks.',
      'ALL SOULS HOME - Every stolen name is free. The curse is held shut, and this time the town knows what waits behind the door.',
    ], [], {ending: 'lantern-road'});
    add('keeper', 'THE HOUSE KEEPS ONE', 'workshop', 5, 'Ending 06 of 06 - The October Keeper', [
      'You let Elias and Ada follow the other lights. Then you return to the workshop and turn the brass key in the inside lock. Briar House settles around you.',
      cat ? 'Your cat takes the chair beside yours. It watches the door while you write the names of everyone who escaped.' : 'You write every rescued name into a new ledger. This time, none are crossed out.',
      'Outside the window, the first of November never arrives. A keeper remains on this side of the threshold. Once a year the town will see your lantern in the trees.',
      'THE OCTOBER KEEPER - The names are free. You have chosen the watch. On the next Halloween, twelve knocks sound at your door. You do not answer.',
    ], [], {ending: 'nightkeeper'});
  }
}
