'use strict';
/* Find the Shape — tap every shape that matches the one shown. */
Games.register({
  id: 'find',
  title: 'Find Shapes',
  icon: '⭐',
  bg: '#cdf3e6',
  start(stage) {
    const round = () => {
      stage.replaceChildren();
      const target = U.pick(SHAPES);
      const others = SHAPES.filter((s) => s !== target);
      const TOTAL = 4;
      const kinds = U.shuffle([...Array(TOTAL).fill(target), ...Array.from({ length: 8 }, () => U.pick(others))]);
      let found = 0;

      const dots = Array.from({ length: TOTAL }, () => h('div', { class: 'pop-dot' }));
      const hint = h('div', { class: 'find-hint' },
        h('div', { class: 'find-target', html: Art.shape(target, '#fff', { face: false }) }), h('div', { class: 'pop-dots' }, dots));
      const field = h('div', { class: 'find-field' });

      kinds.forEach((k, i) => {
        const item = h('button', {
          class: 'find-item',
          style: { '--r': U.randInt(-25, 25) + 'deg', '--x': U.randInt(-12, 12) + '%', '--y': U.randInt(-12, 12) + '%', '--i': i },
          html: Art.shape(k, U.pick(COLORS).hex),
        });
        item.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          if (item.classList.contains('found')) return;
          if (k !== target) {
            Sound.bad();
            Fx.wiggle(item);
            Voice.say(`That's a ${k}!`);
            return;
          }
          item.classList.add('found');
          dots[found].classList.add('on');
          found++;
          Sound.good();
          Fx.sparkle(item);
          Voice.say(target);
          if (found === TOTAL) Engine.later(() => Reward.round(round), 700);
        });
        field.append(item);
      });

      stage.append(hint, field);
      Engine.prompt(`Find all the ${target}s!`);
    };
    round();
  },
});
