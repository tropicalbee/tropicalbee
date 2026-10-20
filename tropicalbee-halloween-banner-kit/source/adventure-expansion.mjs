// Chapter two keeps the original exit available and carries both companion routes.
export function extendAdventure(pages, rooms) {
  Object.assign(rooms, {
    greenhouse: {file: 'adventure/greenhouse.png', alt: 'A moonlit greenhouse with a silver flower and sun, rain and moon irrigation valves.'},
    cellar: {file: 'adventure/cellar.png', alt: 'A flooded stone cellar with a raised walkway, a copper pump and amber, blue and green fuses.'},
    workshop: {file: 'adventure/workshop.png', alt: 'An oak workbench holds a brass lantern, copper coil, glass lens and a three-part circuit.'},
    observatory: {file: 'adventure/observatory.png', alt: 'A brass telescope and an orrery beneath a star-filled dome, with a beacon pedestal.'},
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
    'The old nightkeeper built a beacon to guide lost travellers. Its light has gone out.',
    'The silver flower opens only to water that has caught moonlight. Its moonseed stores that light.',
    'Pump fuse order: amber before blue, blue before green. The dry cabinet holds the copper coil.',
    'Lantern circuit: socket receives the seed, gear draws the current, prism sends the light outward.',
    'The four-star diamond points north. The observatory bearing is now recorded.',
    'Beacon sequence: seed, coil, lantern. Its light reaches every room and the path beyond the gate.',
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
    originalGate.paragraphs.push('A trail of unlit lanterns leads away from the gate, toward a greenhouse. On the nearest post hangs a note: "If you have a little longer, the house could use your help."');
    originalGate.choices.push(['FOLLOW THE LANTERNS', target('trail')]);

    add('trail', 'THE UNLIT PATH', 'garden', 0, 'Chapter two - discover why the lanterns went dark.', [
      'You choose the path deeper into the grounds. Each unlit lantern contains the same little brass star.',
      'The ghost calls from the attic: "The nightkeeper used to guide people home. I have kept the tea warm, but I never learned to fix the light."',
      cat ? 'Your cat follows the trail with its tail held high. You still have the brass key.' : 'You still have the brass key. For once, it feels like an invitation rather than a way out.',
      'Five repairs lie ahead: wake a moonseed, restore the pump, build a star lantern, find the sky bearing and rekindle the beacon.',
    ], [['ENTER THE GREENHOUSE', 'greenhouse'], ['READ THE OLD NOTICE', 'notice'], ['RETURN TO THE GATE', 'gate']]);
    add('notice', 'THE NIGHTKEEPER', 'garden', 0, 'Discovery - a promise left unfinished.', [
      'The notice is pinned beneath the brass star: "No one should have to find their way through these trees alone."',
      'The nightkeeper left for one final journey and never returned. The ghost has been waiting ever since.',
      'Below the promise is a practical list: a living light, a steady current, a lens, a bearing. Someone expected this to be repairable.',
    ], [['CONTINUE TO THE GLASS', 'greenhouse'], ['BACK TO THE PATH', 'trail']]);
    add('greenhouse', 'THE MOON GARDEN', 'greenhouse', 0, 'Wake the silver flower without flooding its roots.', [
      'The greenhouse smells of wet clay. Under a glass dome, a silver flower keeps its last seed tucked out of reach.',
      'Three valves feed its planter: sun, rain and moon. A botanical notebook lies on the stone shelf.',
      cat ? 'Your cat refuses to drink from any of the pipes. Sensible.' : 'A drip echoes through the room, patient as a clock.',
    ], [['READ THE BOTANIST NOTES', 'botanist'], ['INSPECT THE VALVES', 'valves'], ['SEARCH THE SEED DRAWER', 'seed-drawer']]);
    add('botanist', 'WATER THAT REMEMBERS', 'greenhouse', 0, 'Clue - choose the water the flower can use.', [
      'The notebook describes three supplies. Sun water is warm and meant for the pumpkins. Rain water feeds the thirsty ferns.',
      '"The moonflower drinks neither heat nor abundance. Give it the quiet water from the trough beneath the glass roof."',
      'A crescent is scratched into that trough. Its reflection trembles in the water.',
    ], [['INSPECT THE VALVES', 'valves'], ['BACK TO THE FLOWER', 'greenhouse']]);
    add('seed-drawer', 'A DRAWER OF TOMORROWS', 'greenhouse', 0, 'Discovery - the garden remembers its keeper.', [
      'Every empty seed packet has been folded into a little boat. A whole paper fleet rests in the drawer.',
      'On the bottom is one plain sentence: "Plant something even when you are not sure you will see it grow."',
      'You close the drawer gently. The silver flower is the only living light left in the room.',
    ], [['READ THE BOTANIST NOTES', 'botanist'], ['INSPECT THE VALVES', 'valves']]);
    add('valves', 'THREE KINDS OF WATER', 'greenhouse', 0, 'Puzzle 03 - choose one irrigation valve.', [
      'The three handles resist, then loosen. You can send one supply into the flower bed.',
      'Sun warms the pumpkins. Rain feeds the ferns. Moon catches the night in a shallow trough. Which belongs to the silver flower?',
    ], [['OPEN THE SUN VALVE', 'wrong-water'], ['OPEN THE RAIN VALVE', 'wrong-water'], ['OPEN THE MOON VALVE', 'moonseed']], {
      hint: 'The botanical note points to the crescent-marked trough. Choose the moon valve.',
    });
    add('wrong-water', 'A SLEEPING FLOWER', 'greenhouse', 0, 'The petals stay closed. Choose a different supply.', [
      'The flower folds its leaves around itself. An overflow channel carries the water safely away.',
      'Nothing is lost. You close the valve and notice the still reflection in the moonlit trough.',
    ], [['TRY THE VALVES AGAIN', 'valves'], ['READ THE NOTEBOOK', 'botanist']]);
    add('moonseed', 'A LIGHT THAT GROWS', 'greenhouse', 1, 'Moonseed collected. Find a source of current.', [
      'Moon water reaches the roots. The flower unfolds and releases a single pale seed, bright enough to cast your shadow.',
      'You lift it into the little ceramic cup beside the planter. It hums softly.',
      'A pipe from the irrigation bench descends into the cellar. The notebook mentions a spare copper coil stored below.',
    ], [['DESCEND TO THE CELLAR', 'cellar'], ['READ THE PIPE LABEL', 'pipe-note']]);
    add('pipe-note', 'FOLLOW THE COPPER', 'greenhouse', 1, 'Clue - the pump circuit has an order.', [
      'A maintenance note is wrapped around the pipe: "Amber wakes before blue. Blue wakes before green. Let the current follow the sunrise into the sea, then into the leaves."',
      'Three small paint spots mark the note in the same order. You keep the sequence in mind as the pipe disappears down the steps.',
    ], [['DESCEND TO THE CELLAR', 'cellar'], ['BACK TO THE MOONSEED', 'moonseed']]);
    add('cellar', 'UNDER THE FLOORBOARDS', 'cellar', 1, 'Restore the pump to reach the spare copper coil.', [
      'Shallow water covers the stone floor. A raised walkway leads safely to an idle pump.',
      'The spare coil is behind a mesh cabinet across the wet section. Three loose fuses wait beside the control box.',
      cat ? 'Your cat settles on a dry barrel and supervises with extraordinary seriousness.' : 'The floorboards overhead creak as if the house is listening.',
    ], [['READ THE PUMP CHART', 'pump-chart'], ['FIT THE THREE FUSES', 'fuses'], ['CHECK THE DRY SHELF', 'cellar-shelf']]);
    add('pump-chart', 'CURRENT AND COLOUR', 'cellar', 1, 'Clue - fit all three fuses in the correct order.', [
      'The chart gives two rules: amber must come before blue; green must come after blue.',
      'Only one left-to-right arrangement satisfies both rules. You do not need to guess or rush.',
    ], [['FIT THE THREE FUSES', 'fuses'], ['BACK TO THE WALKWAY', 'cellar']]);
    add('cellar-shelf', 'THE LOST AND FOUND', 'cellar', 1, 'Discovery - the beacon brought people here.', [
      'The dry shelf holds a mitten, a cracked compass, a small wooden horse and a ledger of returned belongings.',
      'Beside each entry, in the same careful handwriting: "Found their way home."',
      'The last page is blank. You leave the little collection undisturbed.',
    ], [['FIT THE THREE FUSES', 'fuses'], ['BACK TO THE WALKWAY', 'cellar']]);
    add('fuses', 'WAKE THE PUMP', 'cellar', 1, 'Puzzle 04 - arrange the fuses from left to right.', [
      'You hold the amber, blue and green fuses above the sockets. Amber before blue. Green after blue.',
      'Choose the order, then turn the insulated starter handle.',
    ], [['AMBER - BLUE - GREEN', 'coil'], ['BLUE - AMBER - GREEN', 'wrong-fuses'], ['AMBER - GREEN - BLUE', 'wrong-fuses']], {
      hint: 'Blue belongs between the other two: amber, then blue, then green.',
    });
    add('wrong-fuses', 'ONE QUIET CLICK', 'cellar', 1, 'The pump stays off. Reorder the fuses.', [
      'The safety relay clicks and the starter springs back. The fuses are intact; the sequence is simply wrong.',
      'You pull the handle to OFF before moving them. The maintenance chart is still beside you.',
    ], [['TRY THE FUSES AGAIN', 'fuses'], ['READ THE PUMP CHART', 'pump-chart']]);
    add('coil', 'THE WATER RECEDES', 'cellar', 2, 'Copper coil collected. Visit the workshop.', [
      'The pump hums. Water drains beneath the walkway, revealing the path to the spare-parts cabinet.',
      'You take the copper coil and wrap it in a dry cloth. The moonseed answers with a brighter glow.',
      'Behind the cabinet, a short stair leads directly into the nightkeeper\'s workshop.',
    ], [['ENTER THE WORKSHOP', 'workshop'], ['READ THE REPAIR LOG', 'repair-log']]);
    add('repair-log', 'NOT A FAILED INVENTION', 'cellar', 2, 'Discovery - a repair, not a replacement.', [
      '"The seed still shines. The wire still carries. The lens still bends," reads the repair log. "When a thing goes dark, do not assume every part is broken."',
      'The last entry mentions a lamp frame waiting on the workshop bench.',
    ], [['ENTER THE WORKSHOP', 'workshop'], ['BACK TO THE PUMP', 'coil']]);
    add('workshop', 'SOMETHING THAT WORKS', 'workshop', 2, 'Build a star lantern from the parts you have found.', [
      'At last, a proper garage. The workbench holds a brass lantern frame, a glass lens and a circuit with three marked positions.',
      'You set down the moonseed and copper coil. Both stay in your inventory as parts of the repair.',
      'The builder\'s diagram is pinned above the bench. A half-finished letter sits underneath it.',
    ], [['READ THE CIRCUIT PLAN', 'circuit-plan'], ['CONNECT THE LANTERN', 'circuit'], ['READ THE LETTER', 'letter']]);
    add('circuit-plan', 'FROM LIGHT TO LIGHT', 'workshop', 2, 'Clue - follow the direction of energy.', [
      'The socket receives the glowing seed. The gear draws current through the coil. The prism spreads the light toward the road.',
      'The diagram warns: "A lens has nothing to send until the current reaches it."',
      'Arrange the three parts in the order energy passes through them.',
    ], [['CONNECT THE LANTERN', 'circuit'], ['BACK TO THE WORKBENCH', 'workshop']]);
    add('letter', 'IF YOU ARE READING THIS', 'workshop', 2, 'Discovery - the nightkeeper trusted the next visitor.', [
      '"I kept waiting until I could build something perfect. Then someone got lost in the trees, and I built something that worked."',
      '"If it stops, I hope you will mend it. You do not have to be its maker to care for it."',
      'The final line is unfinished. You have the feeling that finishing the repair might be answer enough.',
    ], [['CONNECT THE LANTERN', 'circuit'], ['READ THE CIRCUIT PLAN', 'circuit-plan']]);
    add('circuit', 'THE LITTLE CIRCUIT', 'workshop', 2, 'Puzzle 05 - connect receiver, current and light.', [
      'Socket, gear, prism. Three parts and one continuous path.',
      'Choose the order from the seed toward the beam. The brass frame will keep the pieces together.',
    ], [['SOCKET - GEAR - PRISM', 'lantern'], ['PRISM - SOCKET - GEAR', 'wrong-circuit'], ['GEAR - PRISM - SOCKET', 'wrong-circuit']], {
      hint: 'Receive first, carry second, send last: socket, gear, prism.',
    });
    add('wrong-circuit', 'A SMALL SPARK', 'workshop', 2, 'The lantern stays dim. Reconnect the circuit.', [
      'The frame makes a disappointed little chirp. The current has nowhere useful to go.',
      'A protective catch opens the circuit. Your seed and coil are safe. You can rearrange the parts.',
    ], [['TRY THE CIRCUIT AGAIN', 'circuit'], ['READ THE CIRCUIT PLAN', 'circuit-plan']]);
    add('lantern', 'IT EVEN WORKS', 'workshop', 3, 'Star lantern assembled. Find its bearing upstairs.', [
      'A thin star of light appears in the glass. The frame warms in your hands. Against all reasonable expectations, it works.',
      'The moonseed and coil are secured inside; you carry them as part of the assembled lantern.',
      'A narrow spiral stair climbs to the observatory. The beacon needs a direction before it can guide anyone.',
    ], [['CLIMB TO THE DOME', 'observatory'], ['READ THE BUILDERS NOTE', 'builders-note']]);
    add('builders-note', 'BUILT TO BE REPAIRED', 'workshop', 3, 'Discovery - the house was always a work in progress.', [
      'The underside of the lantern bears tiny scratches from earlier repairs. Someone has fixed it many times.',
      '"Leave the screws where the next person can reach them," says a note. "Leave enough light to see by."',
      'You tighten the last screw and carry the lantern upstairs.',
    ], [['CLIMB TO THE DOME', 'observatory'], ['BACK TO THE LANTERN', 'lantern']]);
    add('observatory', 'ABOVE THE ROOFTOPS', 'observatory', 3, 'Find the sky bearing for the homeward path.', [
      'The dome opens above a brass telescope. Four bright stars form a diamond. Below them, the treetops stretch like a dark sea.',
      'The telescope has three bearing marks: north, east and west. A chart explains which stars the nightkeeper trusted.',
      cat ? 'Your cat watches a moving point of light with professional interest.' : 'For the first time all evening, the house feels very small beneath the sky.',
    ], [['READ THE STAR CHART', 'star-chart'], ['ALIGN THE TELESCOPE', 'bearing'], ['LISTEN AT THE DOME', 'dome-note']]);
    add('star-chart', 'THE STILL POINT', 'observatory', 3, 'Clue - use the star that stays above the northern trees.', [
      'The chart reads: "The sun rises in the east and sets in the west. Our diamond stays above the northern pines."',
      'The road home runs beneath those pines. Align the telescope with the diamond, not the sunrise or sunset.',
    ], [['ALIGN THE TELESCOPE', 'bearing'], ['BACK TO THE DOME', 'observatory']]);
    add('dome-note', 'VOICES IN THE RAFTERS', 'observatory', 3, 'Discovery - the ghost has stopped waiting alone.', [
      'From far below comes the clink of cups. The ghost is setting a table for someone who might actually return.',
      'The nightkeeper\'s absence is still here, but it is no longer the only thing filling the house.',
    ], [['READ THE STAR CHART', 'star-chart'], ['ALIGN THE TELESCOPE', 'bearing']]);
    add('bearing', 'THE HOMEWARD BEARING', 'observatory', 3, 'Puzzle 06 - choose the direction of the star diamond.', [
      'You loosen the telescope mount and turn the bearing ring. The chart describes a still diamond above the northern pines.',
      'Where should the lantern point?',
    ], [['SET NORTH', 'aligned'], ['SET EAST', 'wrong-bearing'], ['SET WEST', 'wrong-bearing']], {
      hint: 'The star chart names the northern pines. Set the bearing north.',
    });
    add('wrong-bearing', 'ONLY EMPTY SKY', 'observatory', 3, 'The diamond is outside the lens. Adjust the bearing.', [
      'The telescope catches a lovely patch of sky, but not the four stars that mark the homeward road.',
      'You return the mount to its starting notch. The lantern is still safe in its cradle.',
    ], [['TRY THE BEARING AGAIN', 'bearing'], ['READ THE STAR CHART', 'star-chart']]);
    add('aligned', 'FOUR STARS IN THE GLASS', 'observatory', 4, 'Sky bearing recorded. Restore the beacon.', [
      'The diamond settles into the lens. A guide line runs down toward the path beyond the garden gate.',
      'You lock the bearing ring. The beacon pedestal unfolds three brass catches, waiting for a careful start.',
      'A commissioning card gives the sequence. This is the last repair.',
    ], [['READ THE STARTUP CARD', 'startup'], ['START THE BEACON', 'beacon']]);
    add('startup', 'ONE LAST CHECK', 'observatory', 4, 'Clue - wake the source, carry the current, release the light.', [
      'The card says: "Wake the moonseed. Seat the copper coil. Open the lantern shutter."',
      'The order matters. A shutter cannot guide light that has not yet reached it.',
      'Your completed journal lists every part of the journey, from the quiet flower to the northern stars.',
    ], [['START THE BEACON', 'beacon'], ['BACK TO THE BEARING', 'aligned']]);
    add('beacon', 'THE HOUSE HOLDS ITS BREATH', 'observatory', 4, 'Puzzle 07 - commission the repaired beacon.', [
      'Your hands rest on the three catches: seed, coil, lantern. The sky bearing is locked in place.',
      'Choose the startup sequence. Downstairs, even the kettle has gone quiet.',
    ], [['SEED - COIL - LANTERN', 'restored'], ['LANTERN - SEED - COIL', 'wrong-beacon'], ['COIL - LANTERN - SEED', 'wrong-beacon']], {
      hint: 'Follow the commissioning card exactly: seed, coil, lantern.',
    });
    add('wrong-beacon', 'NOT YET', 'observatory', 4, 'The interlock holds. Review the startup order.', [
      'A brass catch returns to its notch. The beacon will not start with its parts out of sequence.',
      'Nothing is damaged. You breathe out, check the card and try again.',
    ], [['TRY STARTUP AGAIN', 'beacon'], ['READ THE STARTUP CARD', 'startup']]);
    add('restored', 'A LIGHT THROUGH THE TREES', 'observatory', 5, 'All seven puzzles solved. Choose what comes next.', [
      'Seed. Coil. Lantern. A warm beam crosses the garden and threads through the northern pines.',
      'Below you, one lantern after another flickers awake. The greenhouse shines. The pump hums. The house feels like a place that is being lived in again.',
      'The ghost reaches the top stair with two cups. "You can go home," it says. "Or there is still that spare desk."',
    ], [['FOLLOW THE LIGHT HOME', 'dawn'], ['BECOME THE NIGHTKEEPER', 'keeper']]);
    add('dawn', 'THE LONG WAY HOME', 'garden', 5, 'Ending 05 of 06 - The Lantern Road', [
      'You follow the newly lit path. For the first time, the woods offer a clear way through.',
      cat ? 'Your cat trots ahead, stopping at every lantern until you catch up. Nobody is left behind.' : 'Behind you, the ghost stands in a bright window. You wave until the trees hide the house.',
      'THE LANTERN ROAD - You solved seven puzzles, repaired a forgotten promise and left a light for the next lost traveller.',
    ], [], {ending: 'lantern-road'});
    add('keeper', 'THE NEXT NIGHTKEEPER', 'workshop', 5, 'Ending 06 of 06 - The Nightkeeper', [
      'You return to the workshop. The ghost clears a desk. You place the brass key beside a fresh notebook.',
      cat ? 'Your cat claims the best chair. There will apparently be management oversight.' : 'The empty chair looks less like a vacancy and more like a beginning.',
      'Outside, the beacon turns toward the trees. Somewhere, someone will notice it.',
      'THE NIGHTKEEPER - The house is no longer waiting for someone to come back. Someone new has chosen to stay.',
    ], [], {ending: 'nightkeeper'});
  }
}
