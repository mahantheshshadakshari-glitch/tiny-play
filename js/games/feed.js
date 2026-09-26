'use strict';
/* Feed the Animals — give each animal the food it loves. */
Games.register({
  id: 'feed',
  title: 'Feed Animals',
  icon: '🐶',
  bg: '#d4f5c4',
  start(stage) {
    const PAIRS = [
      { a: '🐶', an: 'dog', f: '🦴', fn: 'bone' },
      { a: '🐰', an: 'bunny', f: '🥕', fn: 'carrot' },
      { a: '🐱', an: 'cat', f: '🐟', fn: 'fish' },
      { a: '🐵', an: 'monkey', f: '🍌', fn: 'banana' },
      { a: '🐼', an: 'panda', f: '🎋', fn: 'bamboo' },
      { a: '🐭', an: 'mouse', f: '🧀', fn: 'cheese' },
      { a: '🐝', an: 'bee', f: '🌻', fn: 'flower' },
      { a: '🐿️', an: 'squirrel', f: '🌰', fn: 'nut' },
      { a: '🐮', an: 'cow', f: '🌾', fn: 'hay' },
      { a: '🐻', an: 'bear', f: '🍯', fn: 'honey' },
    ];
    const round = () => {
      stage.replaceChildren();
      const pairs = U.pick(PAIRS, 3);
      const animals = pairs.map((p) => {
        const card = h('div', { class: 'animal drop-target' }, emojiEl(p.a, 'animal-face'));
        card.dataset.food = p.f;
        return card;
      });
      const tray = h('div', { class: 'tray' });
      let left = pairs.length;

      U.shuffle(pairs).forEach((pair) => {
        const food = h('div', { class: 'piece' }, emojiEl(pair.f));
        tray.append(food);
        Drag.make(food, {
          targets: () => animals.filter((a) => !a.classList.contains('fed')),
          onDrop: (food, card) => {
            if (card.dataset.food !== pair.f) return false;
            Drag.moveInto(food, card);
            Drag.lock(food);
            food.classList.add('eaten');
            card.classList.add('fed');
            Fx.bounce(card);
            Sound.chomp();
            Voice.say(`Yum! The ${pair.an} loves the ${pair.fn}!`);
            Engine.later(() => { food.remove(); card.append(h('div', { class: 'heart' }, '❤️')); }, 500);
            if (--left === 0) Engine.later(() => Reward.round(round), 1800);
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'row' }, animals), tray);
      Engine.prompt('The animals are hungry! Give each one its food.');
    };
    round();
  },
});
