'use strict';
/* Potion Mix — pour two colors into the cauldron to make the color asked for. */
Games.register({
  id: 'potion',
  title: 'Potion Mix',
  icon: '🧪',
  bg: '#e6dcff',
  start(stage) {
    const HEX = { red: '#ff4d4d', yellow: '#ffd23d', blue: '#3d8bff', orange: '#ff9a2e', green: '#3ecf5a', purple: '#a45cff' };
    const WATER = '#bfe6ff';
    const MIX = { 'red+yellow': 'orange', 'blue+yellow': 'green', 'blue+red': 'purple' };
    const RECIPE = { orange: ['red', 'yellow'], green: ['yellow', 'blue'], purple: ['red', 'blue'] };
    const BASICS = ['red', 'yellow', 'blue'];
    let lastTarget = null;

    const bottleSVG = (hex) => `<svg viewBox="0 0 80 112" class="shape-svg potion-bottle-svg">
      <rect x="30" y="0" width="20" height="14" rx="4" fill="#b07a45"/>
      <rect x="31" y="12" width="18" height="26" rx="4" fill="rgba(255,255,255,.75)" stroke="rgba(0,0,0,.15)" stroke-width="3"/>
      <circle cx="40" cy="72" r="36" fill="rgba(255,255,255,.7)" stroke="rgba(0,0,0,.15)" stroke-width="4"/>
      <path class="potion-bottle-liquid" d="M6 70 Q23 62 40 70 T74 70 A34 34 0 0 1 6 70 Z" fill="${hex}"/>
      <circle cx="30" cy="88" r="3.5" fill="#fff" opacity=".7"/><circle cx="50" cy="94" r="2.5" fill="#fff" opacity=".7"/>
      <ellipse cx="25" cy="56" rx="6" ry="11" fill="#fff" opacity=".6" transform="rotate(30 25 56)"/>
      <g transform="translate(12 42) scale(.56)">${Art.face(50)}</g>
    </svg>`;

    const dropSVG = (hex) => `<svg viewBox="0 0 100 100" class="shape-svg">
      <path d="M50 4 C62 28 84 44 84 64 A34 34 0 0 1 16 64 C16 44 38 28 50 4 Z" fill="${hex}" stroke="rgba(0,0,0,.15)" stroke-width="4"/>
      <ellipse cx="36" cy="52" rx="6" ry="11" fill="#fff" opacity=".45" transform="rotate(25 36 52)"/>
      <g transform="translate(0 14)">${Art.face(50)}</g>
    </svg>`;

    const dot = (name) => h('i', { class: 'potion-dot', style: { background: HEX[name] } });

    const round = () => {
      stage.replaceChildren();
      let target;
      do { target = U.pick(Object.keys(RECIPE)); } while (target === lastTarget);
      lastTarget = target;
      let mix = [];
      let busy = false;

      const recipe = h('div', { class: 'potion-recipe' },
        dot(RECIPE[target][0]), h('b', {}, '+'), dot(RECIPE[target][1]), h('b', {}, '='), dot(target));
      const card = h('div', { class: 'potion-card' }, h('div', { class: 'potion-drop-icon', html: dropSVG(HEX[target]) }), recipe);

      const bubbles = Array.from({ length: 7 }, (_, i) =>
        h('span', { style: { left: 10 + i * 12 + '%', 'animation-delay': -i * 0.37 + 's', 'animation-duration': 1.6 + (i % 3) * 0.4 + 's' } }));
      const liquid = h('div', { class: 'potion-liquid' }, bubbles);
      const cauldron = h('div', { class: 'potion-cauldron drop-target', style: { '--liquid': WATER } },
        h('div', { class: 'potion-fire' }, h('span', {}, '🔥'), h('span', {}, '🔥'), h('span', {}, '🔥')),
        h('div', { class: 'potion-legs' }),
        h('div', { class: 'potion-body' }, h('div', { class: 'potion-face', html: `<svg viewBox="0 0 100 100" class="shape-svg">${Art.face(50)}</svg>` })),
        h('div', { class: 'potion-rim' }),
        liquid);

      const setLiquid = (hex) => {
        cauldron.style.setProperty('--liquid', hex);
        Fx.bounce(liquid);
      };

      const splashAt = (x, y, hex) => Fx.burst(x, y, [hex, '#fff'], 10);

      const droplets = (x, y, toY, hex) => {
        for (let i = 0; i < 9; i++) {
          const d = h('div', { class: 'potion-droplet', style: { background: hex, left: x + U.rand(-6, 6) + 'px', top: y + 'px' } });
          Fx.layer.append(d);
          d.animate(
            [{ transform: 'translate(-50%, 0) scale(.6, 1)' }, { transform: `translate(-50%, ${toY - y}px) scale(1, 1.3)` }],
            { duration: 320, delay: i * 55, easing: 'cubic-bezier(.5,0,1,1)', fill: 'backwards' },
          ).onfinish = () => d.remove();
        }
        [0, 0.12, 0.24, 0.36].forEach((at) => Sound.tone(240, { dur: 0.1, at, to: 120, type: 'sine', vol: 0.2 }));
      };

      const smoke = () => {
        const r = cauldron.getBoundingClientRect();
        for (let i = 0; i < 8; i++) {
          const s = U.rand(7, 13) * Math.min(innerWidth, innerHeight) / 100;
          const p = h('div', { class: 'potion-smoke', style: { width: s + 'px', height: s + 'px', left: r.left + r.width * U.rand(0.2, 0.8) + 'px', top: r.top + r.height * 0.15 + 'px' } });
          Fx.layer.append(p);
          p.animate(
            [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0.9 }, { transform: `translate(calc(-50% + ${U.rand(-60, 60)}px), calc(-50% - ${U.rand(90, 160)}px)) scale(1.4)`, opacity: 0 }],
            { duration: U.rand(900, 1300), delay: i * 60, easing: 'ease-out', fill: 'backwards' },
          ).onfinish = () => p.remove();
        }
      };

      const fizz = () => {
        cauldron.classList.add('potion-fizz');
        for (let i = 0; i < 12; i++) Sound.tone(U.rand(900, 1700), { dur: 0.05, at: i * 0.05, vol: 0.05 });
        const r = cauldron.getBoundingClientRect();
        [0, 250, 500, 800].forEach((ms) => Engine.later(() =>
          Fx.burst(r.left + r.width * U.rand(0.3, 0.7), r.top + r.height * 0.15, [HEX[target], '#fff', '#ffe066'], 16), ms));
      };

      const reset = () => {
        cauldron.classList.add('potion-drain');
        Engine.later(() => {
          cauldron.classList.remove('potion-drain');
          cauldron.style.setProperty('--liquid', WATER);
          mix = [];
          tray.querySelectorAll('.piece').forEach((b) => { b.classList.remove('potion-used'); delete b.dataset.locked; });
          busy = false;
          const [a, b] = RECIPE[target];
          Voice.say(`Try ${a} and ${b}!`);
        }, 600);
      };

      const afterPour = (name) => {
        mix.push(name);
        if (mix.length === 1) {
          setLiquid(HEX[name]);
          Voice.say(name);
          busy = false;
          return;
        }
        const res = MIX[[...mix].sort().join('+')];
        setLiquid(HEX[res]);
        Engine.later(() => {
          if (res === target) {
            fizz();
            Sound.good();
            Voice.say(`${mix[0]} and ${mix[1]} make ${res}!`);
            Engine.later(() => Reward.round(round), 2600);
          } else {
            Sound.bad();
            Fx.wiggle(cauldron.querySelector('.potion-body'));
            smoke();
            recipe.classList.add('show');
            Voice.say(`Oops! That made ${res}.`);
            Engine.later(reset, 1800);
          }
        }, 500);
      };

      const tray = h('div', { class: 'tray potion-tray' });
      BASICS.forEach((name) => {
        const b = h('div', { class: 'piece potion-bottle' }, h('div', { html: bottleSVG(HEX[name]) }));
        tray.append(b);
        Drag.make(b, {
          targets: () => (busy ? [] : [cauldron]),
          onDrop: (b) => {
            busy = true;
            b.dataset.locked = '1';
            // Fly the bottle over the cauldron, tip it, pour, then send it home.
            const dropped = b.style.transform;
            b.style.transition = 'none';
            b.style.transform = '';
            const home = b.getBoundingClientRect();
            b.style.transform = dropped;
            void b.offsetWidth;
            const cr = cauldron.getBoundingClientRect();
            const hgt = home.height;
            const cx = cr.left + cr.width / 2 + 0.39 * hgt;
            const mouthY = cr.top + cr.height * 0.02;
            // Keep the tipped bottle inside the play area (its top sits ~0.39×height above its center).
            const cy = Math.max(mouthY - 0.225 * hgt, stage.getBoundingClientRect().top + 0.42 * hgt);
            b.style.transition = 'transform .4s cubic-bezier(.3,1.3,.5,1)';
            b.style.transform = `translate(${cx - (home.left + home.width / 2)}px, ${cy - (home.top + hgt / 2)}px) rotate(-120deg)`;
            b.classList.add('potion-pouring');
            const mouthX = cr.left + cr.width / 2;
            const surface = cr.top + cr.height * 0.12;
            Engine.later(() => droplets(mouthX, mouthY, surface, HEX[name]), 380);
            Engine.later(() => { splashAt(mouthX, surface, HEX[name]); afterPour(name); }, 850);
            Engine.later(() => {
              b.classList.remove('potion-pouring');
              b.classList.add('potion-used');
              b.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
              b.style.transform = '';
            }, 1000);
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'row potion-row' }, card, cauldron), tray);
      Engine.prompt(`Let's make ${target}! Pour two colors in the pot.`);
    };
    round();
  },
});
