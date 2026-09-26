'use strict';
/* Surprise Egg — tap the egg until it cracks open and a surprise pops out. */
Games.register({
  id: 'egg',
  title: 'Surprise Egg',
  icon: '🥚',
  bg: '#ffe9f3',
  start(stage) {
    const SURPRISES = [
      ['🐣', 'a baby chick'], ['🦆', 'a little duck'], ['🦖', 'a baby dinosaur'], ['🐢', 'a baby turtle'],
      ['🐧', 'a baby penguin'], ['🐊', 'a baby crocodile'], ['🦉', 'a little owl'], ['🦜', 'a parrot'],
      ['🦄', 'a unicorn'], ['🐉', 'a baby dragon'], ['🧸', 'a teddy bear'], ['🚗', 'a toy car'],
      ['⚽', 'a ball'], ['🐙', 'an octopus'], ['🦕', 'a dinosaur'], ['🐰', 'a bunny'],
    ];
    const PATTERNS = ['dots', 'stripes', 'zigzag'];
    const TAPS = 4;
    const TAP_WORDS = ['Tap!', 'Again!', 'One more!'];
    const EGG = 'M100 12 C152 12 186 110 186 166 C186 222 148 252 100 252 C52 252 14 222 14 166 C14 110 48 12 100 12 Z';
    // Zigzag line the shell breaks along.
    const ZIG = Array.from({ length: 9 }, (_, i) => [i * 25, i % 2 ? 152 : 132]);
    const pts = (a) => a.map(([x, y]) => `${x},${y}`).join(' ');
    let uid = 0;
    let lastSurprise = null;

    const shellContent = (fill, pattern) => {
      let deco = '';
      if (pattern === 'dots') {
        for (let y = 40, row = 0; y < 250; y += 36, row++) {
          for (let x = row % 2 ? 30 : 12; x < 200; x += 36) deco += `<circle cx="${x}" cy="${y}" r="9" fill="#fff" opacity=".75"/>`;
        }
      } else if (pattern === 'stripes') {
        deco = [70, 118, 178, 222].map((y) => `<rect x="0" y="${y}" width="200" height="15" fill="#fff" opacity=".7"/>`).join('');
      } else {
        deco = [78, 190].map((y) => `<polyline points="${pts(Array.from({ length: 11 }, (_, i) => [i * 20, y + (i % 2 ? 12 : -12)]))}" fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round" opacity=".75"/>`).join('');
      }
      return `<path d="${EGG}" fill="${fill}"/>${deco}
        <ellipse cx="66" cy="72" rx="15" ry="30" fill="#fff" opacity=".35" transform="rotate(22 66 72)"/>
        <path d="${EGG}" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="6"/>`;
    };

    const eggSVG = (fill, pattern) => {
      const n = ++uid;
      const content = shellContent(fill, pattern);
      const topClip = `0,0 200,0 ${pts([...ZIG].reverse())}`;
      const botClip = `${pts(ZIG)} 200,270 0,270`;
      return `<svg viewBox="0 0 200 262" class="egg-svg">
        <defs>
          <clipPath id="egg-c${n}"><path d="${EGG}"/></clipPath>
          <clipPath id="egg-t${n}"><polygon points="${topClip}"/></clipPath>
          <clipPath id="egg-b${n}"><polygon points="${botClip}"/></clipPath>
        </defs>
        <g class="egg-bottom"><g clip-path="url(#egg-b${n})"><g clip-path="url(#egg-c${n})">${content}</g></g></g>
        <g class="egg-top"><g clip-path="url(#egg-t${n})"><g clip-path="url(#egg-c${n})">${content}</g></g>
          <g transform="translate(40 48) scale(1.2)">${Art.face(50)}</g></g>
        <g class="egg-cracks" clip-path="url(#egg-c${n})" fill="none" stroke="#3a2e5c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
          <polyline class="c1" points="${pts(ZIG.slice(3, 6))}"/>
          <g class="c2"><polyline points="${pts(ZIG.slice(1, 8))}"/><path d="M75 132 l-8 -18 M125 132 l10 -16"/></g>
          <g class="c3"><polyline points="${pts(ZIG)}"/><path d="M25 152 l-6 16 M175 152 l8 14 M100 132 l2 -20"/></g>
        </g>
      </svg>`;
    };

    const NEST = `<svg viewBox="0 0 300 110" class="shape-svg">
      <ellipse cx="150" cy="58" rx="146" ry="46" fill="#a86b32"/>
      <ellipse cx="150" cy="50" rx="130" ry="30" fill="#c98a48"/>
      <g stroke="#7a4a1e" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M20 60 Q80 80 150 70 T285 58"/><path d="M30 78 Q100 95 170 86 T278 74"/>
        <path d="M50 44 Q120 62 200 52 T270 44"/><path d="M40 90 L70 70 M110 98 L140 74 M190 96 L215 72 M245 88 L262 66"/>
      </g>
      <g stroke="#e0a764" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M60 58 Q120 70 180 62"/><path d="M150 82 Q210 90 260 70"/>
      </g>
    </svg>`;

    const crackSound = (strength) => {
      Sound.tone(1800 + strength * 200, { dur: 0.04, type: 'square', vol: 0.1, to: 500 });
      Sound.tone(320, { dur: 0.08, type: 'triangle', vol: 0.18, to: 110, at: 0.02 });
    };
    const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

    const round = () => {
      stage.replaceChildren();
      const color = U.pick(COLORS);
      let surprise;
      do { surprise = U.pick(SURPRISES); } while (surprise === lastSurprise);
      lastSurprise = surprise;
      let taps = 0;
      let busy = false;

      const inner = h('div', { class: 'egg-inner', html: eggSVG(color.hex, U.pick(PATTERNS)) });
      const svg = inner.firstElementChild;
      const wrap = h('div', { class: 'egg-wrap', role: 'button', 'aria-label': 'Tap the egg' }, inner);
      const prize = h('div', { class: 'egg-surprise' }, emojiEl(surprise[0]));
      const rays = h('div', { class: 'egg-rays' });
      const hint = h('div', { class: 'egg-hint' }, '👆');
      const dots = Array.from({ length: TAPS }, () => h('div', { class: 'pop-dot' }));
      const scene = h('div', { class: 'egg-scene' },
        rays, prize, wrap, h('div', { class: 'egg-nest', html: NEST }), hint);

      wrap.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (busy) return;
        taps++;
        hint.remove();
        dots[taps - 1].classList.add('on');
        crackSound(taps);
        Fx.burst(e.clientX, e.clientY, [color.hex, '#fff', '#ffe066'], 8);
        if (taps < TAPS) {
          svg.classList.add('crack-' + taps);
          restart(inner, 'egg-squash');
          Voice.say(TAP_WORDS[taps - 1]);
          return;
        }
        // Final tap: anticipation shake, then burst open.
        busy = true;
        wrap.classList.add('egg-shaking');
        [0, 0.15, 0.3, 0.45, 0.6].forEach((at, i) => Sound.tone(300 + i * 90, { dur: 0.12, at, type: 'triangle', vol: 0.12 }));
        Engine.later(() => {
          wrap.classList.remove('egg-shaking');
          wrap.classList.add('egg-open');
          scene.append(h('div', { class: 'egg-flash' }));
          Sound.pop();
          Sound.good();
          rays.classList.add('show');
          prize.classList.add('show');
          const [x, y] = Fx.centerOf(wrap);
          Fx.burst(x, y, [color.hex, '#fff', '#ffe066', '#ff8fab'], 28);
          Engine.later(() => Fx.sparkle(prize), 350);
          Engine.later(() => Fx.sparkle(prize), 800);
          Engine.later(() => Voice.say(`It's ${surprise[1]}!`), 300);
          Engine.later(() => Reward.round(round), 2800);
        }, 800);
      });

      stage.append(h('div', { class: 'pop-dots egg-dots' }, dots), scene);
      Engine.prompt('Tap the egg to see what’s inside!');
    };
    round();
  },
});
