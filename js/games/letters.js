'use strict';
/* Letter Bubbles — pop the bubbles with the target letter. Works through A–Z (progress persisted). */
Games.register({
  id: 'letters',
  title: 'Letter Bubbles',
  icon: '🔤',
  bg: '#bfeaff',
  start(stage) {
    const WORDS = {
      A: ['🍎', 'apple'], B: ['🏀', 'ball'], C: ['🐱', 'cat'], D: ['🐶', 'dog'], E: ['🥚', 'egg'], F: ['🐟', 'fish'],
      G: ['🍇', 'grapes'], H: ['🎩', 'hat'], I: ['🍦', 'ice cream'], J: ['🧃', 'juice'], K: ['🪁', 'kite'], L: ['🦁', 'lion'],
      M: ['🐵', 'monkey'], N: ['👃', 'nose'], O: ['🐙', 'octopus'], P: ['🐷', 'pig'], Q: ['👑', 'queen'], R: ['🚀', 'rocket'],
      S: ['☀️', 'sun'], T: ['🐢', 'turtle'], U: ['☂️', 'umbrella'], V: ['🎻', 'violin'], W: ['🐳', 'whale'], X: ['📦', 'box'],
      Y: ['🪀', 'yo-yo'], Z: ['🦓', 'zebra'],
    };
    const ABC = Object.keys(WORDS);
    const GOAL = 5;
    const TINTS = ['#ff8fab', '#ffd23d', '#8ce99a', '#74c0fc', '#b197fc', '#ffa94d'];

    const round = () => {
      stage.replaceChildren();
      const idx = Store.get('letters.idx', 0) % ABC.length;
      const letter = ABC[idx];
      const [emoji, word] = WORDS[letter];
      const phrase = letter === 'X' ? 'X is in box!' : `${letter} is for ${word}!`;
      const others = U.pick(ABC.filter((l) => l !== letter), 3);
      let found = 0;
      let sinceTarget = 0;
      let spawner = null;

      const slots = Array.from({ length: GOAL }, () => h('div', { class: 'letters-slot' }));
      const card = h('div', { class: 'letters-card' },
        h('div', { class: 'letters-big' }, letter, h('small', {}, letter.toLowerCase())),
        h('div', { class: 'letters-word' }, emojiEl(emoji), h('span', {}, word)));
      const sea = h('div', { class: 'letters-sea' },
        h('span', { class: 'letters-weed w1' }, '🌿'), h('span', { class: 'letters-weed w2' }, '🌱'),
        h('span', { class: 'letters-weed w3' }, '🌿'), h('span', { class: 'letters-fish' }, '🐠'), h('div', { class: 'letters-sand' }));
      stage.append(sea, h('div', { class: 'letters-hud' }, card, h('div', { class: 'letters-slots' }, slots)));

      const flyToSlot = (from, slot) => {
        const [x, y] = Fx.centerOf(from);
        const [tx, ty] = Fx.centerOf(slot);
        const chip = h('div', { class: 'letters-fly', style: { left: x + 'px', top: y + 'px' } }, letter);
        Fx.layer.append(chip);
        chip.animate(
          [{ transform: 'translate(-50%,-50%) scale(1)' },
           { transform: `translate(calc(-50% + ${(tx - x) * 0.5}px), calc(-50% + ${(ty - y) * 0.5 - 80}px)) scale(1.8)`, offset: 0.45 },
           { transform: `translate(calc(-50% + ${tx - x}px), calc(-50% + ${ty - y}px)) scale(.8)` }],
          { duration: 750, easing: 'ease-in-out' },
        ).onfinish = () => {
          chip.remove();
          slot.textContent = letter;
          slot.classList.add('on');
          Fx.bounce(slot);
        };
      };

      const spawn = () => {
        const isTarget = sinceTarget >= 2 || Math.random() < 0.5;
        sinceTarget = isTarget ? 0 : sinceTarget + 1;
        const l = isTarget ? letter : U.pick(others);
        const size = U.rand(15, 19);
        const inner = h('div', { class: 'letters-inner', style: { '--tint': U.pick(TINTS), 'animation-delay': -U.rand(0, 2) + 's' } }, h('span', {}, l));
        const b = h('div', { class: 'letters-bubble', style: { left: U.rand(3, 80) + '%', width: size + 'vmin', height: size + 'vmin' } }, inner);
        sea.append(b);
        const rise = b.animate(
          [{ transform: 'translateY(0)' }, { transform: `translateY(-${stage.clientHeight + b.offsetHeight * 1.4}px)` }],
          { duration: U.rand(7000, 9500), easing: 'linear' },
        );
        rise.onfinish = () => b.remove();
        b.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          if (b.dataset.done || found >= GOAL) return;
          if (l !== letter) {
            Sound.bad();
            Fx.wiggle(inner);
            Voice.say(`That's ${l}.`);
            return;
          }
          b.dataset.done = '1';
          rise.pause();
          Sound.pop();
          Sound.good();
          const [x, y] = Fx.centerOf(b);
          Fx.burst(x, y, ['#ffffff', '#d0f0ff', '#8fd8ff'], 16);
          flyToSlot(b, slots[found]);
          b.classList.add('popping');
          Engine.later(() => b.remove(), 260);
          found++;
          Voice.say(found === GOAL ? phrase : `${letter}!`);
          if (found === GOAL) {
            clearInterval(spawner);
            sea.querySelectorAll('.letters-bubble:not(.popping)').forEach((x) => x.classList.add('letters-fade'));
            Store.set('letters.idx', (idx + 1) % ABC.length);
            Engine.later(() => Reward.round(round), 1600);
          }
        });
      };

      spawn();
      Engine.later(spawn, 500);
      spawner = Engine.every(spawn, 1100);
      Engine.prompt(`Pop the letter ${letter}! ${phrase}`);
    };
    round();
  },
});
