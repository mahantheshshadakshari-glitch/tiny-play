'use strict';
/* Big & Small — put each one on the spot that is just the right size. */
Games.register({
  id: 'size',
  title: 'Big & Small',
  icon: '🐘',
  bg: '#ffd6e7',
  start(stage) {
    const ITEMS = ['🍎', '🍓', '🐻', '🐸', '🐤', '🚗', '⭐', '🌸', '🧁', '🐳'];
    const SIZES = [
      { key: 'big', box: 30, font: 22 },
      { key: 'middle', box: 22, font: 15 },
      { key: 'small', box: 15, font: 9.5 },
    ];
    const round = () => {
      stage.replaceChildren();
      const item = U.pick(ITEMS);
      const slots = SIZES.map((s) => {
        const slot = h('div', { class: 'size-slot drop-target', style: { '--box': s.box + 'vmin', '--font': s.font + 'vmin' } },
          emojiEl(item, 'silhouette'));
        slot.dataset.size = s.key;
        return slot;
      });
      const tray = h('div', { class: 'tray' });
      let left = SIZES.length;

      U.shuffle(SIZES).forEach((s) => {
        const p = h('div', { class: 'piece size-piece', style: { '--box': s.box + 'vmin', '--font': s.font + 'vmin' } }, emojiEl(item));
        tray.append(p);
        Drag.make(p, {
          targets: () => slots.filter((sl) => !sl.querySelector('.piece')),
          onDrop: (p, slot) => {
            if (slot.dataset.size !== s.key) return false;
            Drag.moveInto(p, slot);
            Drag.lock(p);
            Sound.good();
            Voice.say(s.key);
            Fx.sparkle(slot);
            if (--left === 0) Engine.later(() => Reward.round(round), 600);
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'row size-row' }, slots), tray);
      Engine.prompt('Big, middle, and small! Put each one where it fits.');
    };
    round();
  },
});
