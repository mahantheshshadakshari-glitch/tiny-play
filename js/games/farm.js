'use strict';
/* Farm Friends — find the animal by name or by the sound it makes. */
Games.register({
  id: 'farm',
  title: 'Farm Friends',
  icon: '🐮',
  bg: '#d8f3c0',
  start(stage) {
    const tone = (...a) => Sound.tone(...a);
    const ANIMALS = [
      { e: '🐮', name: 'cow', says: 'moo', call: () => tone(150, { dur: 0.7, to: 110, type: 'sawtooth', vol: 0.07 }) },
      { e: '🐷', name: 'pig', says: 'oink', call: () => [0, 0.18].forEach((at) => tone(520, { dur: 0.13, at, to: 300, type: 'square', vol: 0.06 })) },
      { e: '🐑', name: 'sheep', says: 'baa', call: () => [0, 0.08, 0.16, 0.24].forEach((at, i) => tone(i % 2 ? 400 : 440, { dur: 0.1, at, type: 'sawtooth', vol: 0.06 })) },
      { e: '🦆', name: 'duck', says: 'quack', call: () => [0, 0.2].forEach((at) => tone(620, { dur: 0.12, at, to: 480, type: 'square', vol: 0.06 })) },
      { e: '🐴', name: 'horse', says: 'neigh', call: () => tone(900, { dur: 0.6, to: 300, type: 'sawtooth', vol: 0.06 }) },
      { e: '🐶', name: 'dog', says: 'woof', call: () => [0, 0.2].forEach((at) => tone(320, { dur: 0.1, at, to: 180, type: 'square', vol: 0.08 })) },
      { e: '🐱', name: 'cat', says: 'meow', call: () => tone(520, { dur: 0.45, to: 820, type: 'triangle', vol: 0.12 }) },
      { e: '🐔', name: 'chicken', says: 'cluck', call: () => [0, 0.1, 0.2].forEach((at) => tone(820, { dur: 0.06, at, to: 600, type: 'square', vol: 0.05 })) },
    ];
    const FINDS = 3;
    let askBySound = false;

    const cap = (s) => s[0].toUpperCase() + s.slice(1);

    const round = () => {
      stage.replaceChildren();
      const animals = U.pick(ANIMALS, 4);
      const order = U.pick(animals, FINDS);
      let found = 0;
      let busy = false;
      let current = null;

      const question = h('button', { class: 'farm-question', onclick: () => Voice.say(Engine.promptText) });
      const dots = Array.from({ length: FINDS }, () => h('div', { class: 'pop-dot' }));

      const bubble = (card, text) => {
        card.querySelector('.farm-bubble')?.remove();
        const b = h('div', { class: 'farm-bubble' }, cap(text) + '!');
        card.append(b);
        Engine.later(() => b.remove(), 1800);
      };

      const cards = animals.map((a, i) => {
        const card = h('button', { class: 'farm-animal', style: { '--i': i }, 'aria-label': a.name },
          h('div', { class: 'farm-shadow' }), emojiEl(a.e, 'farm-emoji'));
        card.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          if (busy) return;
          if (a === current) {
            busy = true;
            card.classList.remove('farm-hop');
            Fx.bounce(card);
            card.classList.add('farm-yay');
            Engine.later(() => card.classList.remove('farm-yay'), 900);
            bubble(card, a.says);
            a.call();
            Sound.good();
            Fx.sparkle(card);
            Voice.say(`The ${a.name} says ${a.says}!`);
            dots[found].classList.add('on');
            found++;
            if (!card.querySelector('.farm-star')) card.append(h('div', { class: 'farm-star' }, '⭐'));
            if (found === FINDS) Engine.later(() => Reward.round(round), 2200);
            else Engine.later(ask, 2400);
          } else {
            // Wrong animal still teaches: it says its own sound.
            Fx.wiggle(card.querySelector('.farm-emoji'));
            bubble(card, a.says);
            a.call();
            Mascot.react('oops');
            Voice.say(`That's the ${a.name}. The ${a.name} says ${a.says}!`);
          }
        });
        return card;
      });

      const ask = () => {
        current = order[found];
        busy = false;
        askBySound = !askBySound;
        question.replaceChildren();
        if (askBySound) {
          question.append(h('span', { class: 'farm-q-icon' }, '👂'), h('span', {}, `“${cap(current.says)}!”`));
          Engine.prompt(`Who says ${current.says}?`);
        } else {
          question.append(h('span', { class: 'farm-q-icon' }, '🔍'), h('span', {}, `${cap(current.name)}?`));
          Engine.prompt(`Where is the ${current.name}?`);
        }
        Fx.bounce(question);
      };

      // Every few seconds a random animal does a happy hop so the field feels alive.
      Engine.every(() => {
        const c = U.pick(cards);
        if (c.classList.contains('farm-yay')) return;
        c.classList.remove('farm-hop');
        void c.offsetWidth;
        c.classList.add('farm-hop');
      }, 2200);

      const scene = h('div', { class: 'farm-scene', 'aria-hidden': 'true' },
        h('div', { class: 'farm-sun' }, '☀️'),
        h('div', { class: 'farm-cloud f1' }, '☁️'), h('div', { class: 'farm-cloud f2' }, '☁️'),
        h('div', { class: 'farm-barn' }, h('div', { class: 'farm-roof' }), h('div', { class: 'farm-door' })),
        h('div', { class: 'farm-hill' }), h('div', { class: 'farm-fence' }),
        h('span', { class: 'farm-flower' }, '🌼'), h('span', { class: 'farm-flower b' }, '🌷'), h('span', { class: 'farm-flower c' }, '🌻'));

      stage.append(scene,
        h('div', { class: 'farm-top' }, question, h('div', { class: 'pop-dots farm-dots' }, dots)),
        h('div', { class: 'farm-field' }, cards));
      ask();
    };
    round();
  },
});
