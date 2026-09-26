'use strict';
/* Shadow Match — drag each picture onto its shadow. */
Games.register({
  id: 'shadow',
  title: 'Shadow Match',
  icon: '🦒',
  bg: '#fde2a8',
  start(stage) {
    const ITEMS = [['🐶', 'dog'], ['🐱', 'cat'], ['🦁', 'lion'], ['🐘', 'elephant'], ['🦒', 'giraffe'], ['🐢', 'turtle'],
      ['🚗', 'car'], ['🚀', 'rocket'], ['🍎', 'apple'], ['🌸', 'flower'], ['🦋', 'butterfly'], ['🐳', 'whale'],
      ['🐧', 'penguin'], ['🦕', 'dinosaur'], ['☂️', 'umbrella'], ['🏠', 'house'], ['🐌', 'snail'], ['🦀', 'crab']];

    const round = () => {
      stage.replaceChildren();
      const items = U.pick(ITEMS, 3);
      const slots = U.shuffle(items).map(([e]) => {
        const slot = h('div', { class: 'shadow-slot drop-target' }, emojiEl(e, 'silhouette'));
        slot.dataset.item = e;
        return slot;
      });
      const tray = h('div', { class: 'tray' });
      let left = items.length;

      U.shuffle(items).forEach(([e, name]) => {
        const p = h('div', { class: 'piece' }, emojiEl(e));
        tray.append(p);
        Drag.make(p, {
          targets: () => slots.filter((s) => !s.querySelector('.piece')),
          onDrop: (p, slot) => {
            if (slot.dataset.item !== e) return false;
            Drag.moveInto(p, slot);
            Drag.lock(p);
            Sound.good();
            Voice.say(name);
            Fx.sparkle(slot);
            if (--left === 0) Engine.later(() => Reward.round(round), 600);
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'row' }, slots), tray);
      Engine.prompt('Match each picture to its shadow!');
    };
    round();
  },
});
