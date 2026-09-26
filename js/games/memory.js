'use strict';
/* Picnic Memory — flip cards to find matching pairs. */
Games.register({
  id: 'memory',
  title: 'Memory',
  icon: '🧺',
  bg: '#e3d9ff',
  start(stage) {
    const ITEMS = [['🍎', 'apple'], ['🍌', 'banana'], ['🍉', 'watermelon'], ['🍇', 'grapes'], ['🧀', 'cheese'],
      ['🥪', 'sandwich'], ['🍩', 'donut'], ['🍪', 'cookie'], ['🧃', 'juice'], ['🍓', 'strawberry']];
    let level = 0;

    const round = () => {
      stage.replaceChildren();
      const pairs = Math.min(2 + level, 4);
      level++;
      const items = U.pick(ITEMS, pairs);
      const deck = U.shuffle([...items, ...items]);
      let open = [];
      let busy = false;
      let found = 0;

      const grid = h('div', { class: 'memory-grid', style: { '--cols': pairs } });
      deck.forEach(([emoji, name], i) => {
        const card = h('button', { class: 'card', style: { '--i': i } },
          h('div', { class: 'card-inner' },
            h('div', { class: 'card-face card-back' }, '🧺'),
            h('div', { class: 'card-face card-front' }, emojiEl(emoji))));
        card.addEventListener('click', () => {
          if (busy || card.classList.contains('flipped')) return;
          card.classList.add('flipped');
          Sound.flip();
          open.push({ card, emoji, name });
          if (open.length < 2) return;
          busy = true;
          const [a, b] = open;
          open = [];
          if (a.emoji === b.emoji) {
            Engine.later(() => {
              a.card.classList.add('matched');
              b.card.classList.add('matched');
              Fx.sparkle(a.card);
              Fx.sparkle(b.card);
              Sound.good();
              Voice.say(name);
              busy = false;
              if (++found === pairs) Engine.later(() => Reward.round(round), 700);
            }, 400);
          } else {
            Engine.later(() => {
              Sound.bad();
              Fx.wiggle(a.card);
              Fx.wiggle(b.card);
            }, 500);
            Engine.later(() => {
              a.card.classList.remove('flipped');
              b.card.classList.remove('flipped');
              busy = false;
            }, 1100);
          }
        });
        grid.append(card);
      });

      stage.append(grid);
      Engine.prompt('Find the matching pairs!');
    };
    round();
  },
});
