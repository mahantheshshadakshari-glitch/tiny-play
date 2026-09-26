'use strict';
/* Number Baskets — sort groups by how many things they have, climbing from 1–3 up to 20.
   Groups are laid out in rows of five (ten-frame style) and can be tapped to count aloud. */
Games.register({
  id: 'quantity',
  title: 'Number Baskets',
  icon: '🔢',
  bg: '#d7f0ff',
  start(stage) {
    const THINGS = ['🍎', '🐥', '⭐', '🌼', '🍪', '🐞', '🎈', '🐟', '🍓', '🚗'];
    // Each level is a window of numbers; three different numbers are picked from it.
    const LEVELS = [[1, 3], [2, 5], [4, 7], [6, 10], [8, 12], [10, 14], [12, 16], [14, 18], [16, 20]];
    const MAX_LEVEL = LEVELS.length; // beyond the last window: any mix from 1–20
    let level = Store.get('quantity.level', 0);
    let counting = null; // group currently being counted aloud

    const pickNumbers = () => {
      if (level >= MAX_LEVEL) {
        const lo = U.randInt(1, 16);
        return U.pick(Array.from({ length: 5 }, (_, i) => lo + i), 3);
      }
      const [lo, hi] = LEVELS[level];
      return U.pick(Array.from({ length: hi - lo + 1 }, (_, i) => lo + i), 3);
    };

    const sizeFor = (n) => (n <= 5 ? 7.5 : n <= 10 ? 5 : 4);

    const countAloud = (piece) => {
      if (counting) counting.stop();
      const items = [...piece.querySelectorAll('.group span')];
      const ids = [];
      counting = { stop: () => { ids.forEach(clearTimeout); items.forEach((s) => s.classList.remove('counted')); } };
      items.forEach((s, i) => {
        ids.push(Engine.later(() => {
          s.classList.add('counted');
          Sound.tap();
          Voice.say(String(i + 1));
        }, i * 650));
      });
      ids.push(Engine.later(() => items.forEach((s) => s.classList.remove('counted')), items.length * 650 + 900));
    };

    const round = () => {
      stage.replaceChildren();
      counting = null;
      const nums = pickNumbers().sort((a, b) => a - b);
      const top = nums[nums.length - 1];

      const baskets = nums.map((n) => {
        const content = h('div', { class: 'bin-content' });
        const b = h('div', { class: 'bin basket drop-target', style: { '--c': '#ffe6a8' } },
          h('div', { class: 'bin-label basket-num' }, String(n),
            n <= 5 ? h('div', { class: 'basket-dots' }, Array.from({ length: n }, () => h('i'))) : null),
          content);
        b.dataset.n = n;
        b.content = content;
        return b;
      });
      const tray = h('div', { class: 'tray' });
      let left = nums.length;

      U.shuffle(nums).forEach((n) => {
        const thing = U.pick(THINGS);
        const p = h('div', { class: 'piece group-piece' },
          h('div', { class: 'group', style: { '--s': sizeFor(n) + 'vmin', 'grid-template-columns': `repeat(${Math.min(5, n)}, auto)` } }, Array.from({ length: n }, () => h('span', {}, thing))));
        tray.append(p);
        Drag.make(p, {
          targets: () => baskets.filter((b) => !b.content.children.length),
          onTap: countAloud,
          onDrop: (p, b) => {
            if (+b.dataset.n !== n) return false;
            if (counting) counting.stop();
            Drag.moveInto(p, b.content);
            Drag.lock(p);
            Sound.good();
            Voice.say(String(n));
            Fx.bounce(b);
            if (--left === 0) {
              level = Math.min(level + 1, MAX_LEVEL);
              Store.set('quantity.level', level);
              Engine.later(() => Reward.round(round), 600);
            }
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'row' }, baskets), tray);
      Engine.prompt(top > 5
        ? 'How many? Tap a group to count it, then put it in the basket with the same number.'
        : 'How many? Put each group in the basket with the same number.');
    };
    round();
  },
});
