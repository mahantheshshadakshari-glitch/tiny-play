'use strict';
/* Number Baskets — sort groups by how many things they have. */
Games.register({
  id: 'quantity',
  title: 'Number Baskets',
  icon: '🔢',
  bg: '#d7f0ff',
  start(stage) {
    const THINGS = ['🍎', '🐥', '⭐', '🌼', '🍪', '🐞', '🎈', '🐟'];
    const WORDS = ['zero', 'one', 'two', 'three', 'four'];

    const round = () => {
      stage.replaceChildren();
      const nums = [1, 2, 3];
      const baskets = nums.map((n) => {
        const content = h('div', { class: 'bin-content' });
        const b = h('div', { class: 'bin basket drop-target', style: { '--c': '#ffe6a8' } },
          h('div', { class: 'bin-label basket-num' }, String(n),
            h('div', { class: 'basket-dots' }, Array.from({ length: n }, () => h('i')))),
          content);
        b.dataset.n = n;
        b.content = content;
        return b;
      });
      const tray = h('div', { class: 'tray' });
      let left = nums.length;

      U.shuffle(nums).forEach((n) => {
        const thing = U.pick(THINGS);
        const p = h('div', { class: 'piece group-piece' }, h('div', { class: 'group' }, Array.from({ length: n }, () => h('span', {}, thing))));
        tray.append(p);
        Drag.make(p, {
          targets: () => baskets.filter((b) => !b.content.children.length),
          onDrop: (p, b) => {
            if (+b.dataset.n !== n) return false;
            Drag.moveInto(p, b.content);
            Drag.lock(p);
            Sound.good();
            Voice.say(WORDS[n]);
            Fx.bounce(b);
            if (--left === 0) Engine.later(() => Reward.round(round), 600);
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'row' }, baskets), tray);
      Engine.prompt('How many? Put each group in the basket with the same number.');
    };
    round();
  },
});
