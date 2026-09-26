'use strict';
/* Counting Pot — cook soup by putting in the right number of veggies. */
Games.register({
  id: 'count',
  title: 'Counting Pot',
  icon: '🍲',
  bg: '#fff1c1',
  start(stage) {
    const FOODS = [['🥕', 'carrot'], ['🍅', 'tomato'], ['🥔', 'potato'], ['🍄', 'mushroom'], ['🫑', 'pepper'], ['🧅', 'onion']];
    const WORDS = ['one', 'two', 'three', 'four', 'five'];
    let last = 0;

    const round = () => {
      stage.replaceChildren();
      let n;
      do { n = U.randInt(1, 5); } while (n === last);
      last = n;
      const [food, name] = U.pick(FOODS);
      let count = 0;

      const dots = Array.from({ length: n }, () => h('div', { class: 'count-dot' }));
      const card = h('div', { class: 'count-card' }, h('div', { class: 'count-num' }, String(n)), h('div', { class: 'count-dots' }, dots));
      const inside = h('div', { class: 'pot-inside' });
      const pot = h('div', { class: 'pot drop-target' },
        h('div', { class: 'steam' }, h('span', {}), h('span', {}), h('span', {})),
        inside, h('div', { class: 'pot-rim' }), h('div', { class: 'pot-body' }, h('div', { class: 'pot-face', html: `<svg viewBox="0 0 100 100" class="shape-svg">${Art.face(50)}</svg>` })));
      const tray = h('div', { class: 'tray' });

      for (let i = 0; i < n + 2; i++) {
        const p = h('div', { class: 'piece' }, emojiEl(food));
        tray.append(p);
        Drag.make(p, {
          targets: () => (count < n ? [pot] : []),
          onDrop: (p) => {
            Drag.moveInto(p, inside);
            Drag.lock(p);
            dots[count].classList.add('on');
            count++;
            Sound.good();
            Voice.say(WORDS[count - 1]);
            Fx.bounce(pot);
            if (count === n) {
              pot.classList.add('cooking');
              tray.querySelectorAll('.piece').forEach((x) => x.classList.add('fade'));
              Engine.later(() => Reward.round(round), 900);
            }
            return true;
          },
        });
      }

      stage.append(h('div', { class: 'row' }, card, pot), tray);
      Engine.prompt(`Put ${n} ${U.plural(n, name)} in the pot!`);
    };
    round();
  },
});
