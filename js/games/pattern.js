'use strict';
/* Pattern Train — what comes next? Finish the pattern on the train's last wagon.
   Difficulty climbs AB → AAB → ABB → ABC, then mixes (persisted). */
Games.register({
  id: 'pattern',
  title: 'Pattern Train',
  icon: '🚂',
  bg: '#fff3c4',
  start(stage) {
    const UNITS = [[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2]];
    const ANIMALS = [['🐶', 'dog'], ['🐱', 'cat'], ['🐸', 'frog'], ['🐷', 'pig'], ['🐤', 'chick'], ['🐵', 'monkey'], ['🐰', 'bunny'], ['🐻', 'bear']];
    const FRUITS = [['🍎', 'apple'], ['🍌', 'banana'], ['🍇', 'grapes'], ['🍓', 'strawberry'], ['🍊', 'orange'], ['🍉', 'watermelon']];
    const WAGON_COLORS = ['#ff6b6b', '#4dabf7', '#51cf66', '#ffa94d', '#b197fc', '#f783ac'];
    const LEN = 6; // 5 shown + 1 empty
    let level = Store.get('pattern.level', 0);

    /* Three distinct tokens of one kind: colored circles, shapes, animals or fruit. */
    const makeTokens = () => {
      const kind = U.pick(['color', 'shape', 'animal', 'fruit']);
      if (kind === 'color') {
        return U.pick(COLORS, 3).map((c) => ({ html: () => Art.shape('circle', c.hex), name: c.name }));
      }
      if (kind === 'shape') {
        const hex = U.pick(COLORS).hex;
        return U.pick(SHAPES, 3).map((k) => ({ html: () => Art.shape(k, hex), name: k }));
      }
      const list = kind === 'animal' ? ANIMALS : FRUITS;
      return U.pick(list, 3).map(([e, name]) => ({ html: () => `<div class="emoji">${e}</div>`, name }));
    };

    const toot = () => {
      Sound.tone(587, { dur: 0.22, type: 'square', vol: 0.06 });
      Sound.tone(740, { dur: 0.22, type: 'square', vol: 0.05 });
      Sound.tone(587, { dur: 0.45, at: 0.3, type: 'square', vol: 0.06 });
      Sound.tone(740, { dur: 0.45, at: 0.3, type: 'square', vol: 0.05 });
    };

    const round = () => {
      stage.replaceChildren();
      const unit = level < UNITS.length ? UNITS[level] : U.pick(UNITS);
      const tokens = makeTokens();
      const seq = Array.from({ length: LEN }, (_, i) => tokens[unit[i % unit.length]]);
      const answer = seq[LEN - 1];
      let solved = false;

      /* --- locomotive --- */
      const chimney = h('div', { class: 'pattern-chimney' });
      const loco = h('div', { class: 'pattern-loco' },
        h('div', { class: 'pattern-cab' }, h('div', { class: 'pattern-window' })),
        h('div', { class: 'pattern-boiler' }),
        chimney,
        h('div', { class: 'pattern-face', html: `<svg viewBox="0 0 100 100" class="shape-svg">${Art.face(52)}</svg>` }),
        h('div', { class: 'pattern-wheel big w-a' }), h('div', { class: 'pattern-wheel big w-b' }));

      /* --- wagons --- */
      const slot = h('div', { class: 'pattern-slot' }, h('div', { class: 'pattern-q' }, '?'));
      const wagons = seq.map((tok, i) => {
        const last = i === LEN - 1;
        const w = h('div', { class: `pattern-wagon${last ? ' pattern-empty drop-target' : ''}`, style: { '--wc': WAGON_COLORS[i % WAGON_COLORS.length], '--i': i } },
          last ? slot : h('div', { class: 'pattern-item', html: tok.html() }),
          h('div', { class: 'pattern-car' }),
          h('div', { class: 'pattern-wheel w-a' }), h('div', { class: 'pattern-wheel w-b' }));
        return w;
      });
      const target = wagons[LEN - 1];
      const train = h('div', { class: 'pattern-train moving' }, loco, wagons);
      const track = h('div', { class: 'pattern-track' }, train, h('div', { class: 'pattern-rails' }));

      /* Puffs of smoke from the chimney. */
      const puff = (big = false) => {
        if (!chimney.isConnected) return;
        const r = chimney.getBoundingClientRect();
        const p = h('div', { class: 'pattern-puff', style: { left: r.left + r.width / 2 + 'px', top: r.top + 'px' } });
        Fx.layer.append(p);
        const s = big ? U.rand(2.2, 3.2) : U.rand(1.4, 2);
        p.animate(
          [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0.95 },
           { transform: `translate(calc(-50% + ${U.rand(10, 50)}px), calc(-50% - ${U.rand(60, 110)}px)) scale(${s})`, opacity: 0 }],
          { duration: U.rand(1100, 1600), easing: 'ease-out' },
        ).onfinish = () => p.remove();
      };
      const puffer = Engine.every(() => puff(), 700);
      Engine.later(() => train.classList.remove('moving'), 1700);

      /* --- choices --- */
      const tray = h('div', { class: 'tray' });
      const place = (p, tok) => {
        if (solved) return false;
        if (tok !== answer) return false;
        solved = true;
        slot.querySelector('.pattern-q')?.remove();
        Drag.moveInto(p, slot);
        Drag.lock(p);
        target.classList.remove('pattern-empty');
        Sound.good();
        Fx.sparkle(target);
        tray.querySelectorAll('.piece:not(.placed)').forEach((x) => x.classList.add('fade'));
        level = Math.min(level + 1, UNITS.length);
        Store.set('pattern.level', level);
        Engine.later(() => Voice.say(seq.map((t) => t.name).join(', ') + '!'), 300);
        Engine.later(() => {
          toot();
          clearInterval(puffer);
          train.classList.add('moving', 'go');
          for (let i = 0; i < 8; i++) Engine.later(() => puff(true), i * 140);
        }, 1900);
        Engine.later(() => Reward.round(round), 3300);
        return true;
      };

      U.shuffle(tokens).forEach((tok) => {
        const p = h('div', { class: 'piece', html: tok.html() });
        tray.append(p);
        Drag.make(p, {
          targets: () => (solved ? [] : [target]),
          onDrop: (p) => place(p, tok),
          // Tapping a choice also answers — easier for the youngest players.
          onTap: (p) => {
            if (solved || p.dataset.locked) return;
            if (!place(p, tok)) {
              Sound.bad();
              Fx.wiggle(target);
              Fx.wiggle(p.firstElementChild || p);
            }
          },
        });
      });

      stage.append(track, tray);
      Engine.prompt(`${seq.slice(0, LEN - 1).map((t) => t.name).join(', ')}… what comes next?`);
    };
    round();
  },
});
