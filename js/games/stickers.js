'use strict';
/* Ocean Stickers — free play: drag sea friends into the ocean and watch them come alive. */
Games.register({
  id: 'stickers',
  title: 'Ocean Stickers',
  icon: '🐠',
  bg: '#9fe0ff',
  start(stage) {
    const STICKERS = [
      ['🐠', 'fish', 'swim'], ['🐟', 'fish', 'swim'], ['🐡', 'puffer fish', 'swim'], ['🐳', 'whale', 'swim'],
      ['🐬', 'dolphin', 'swim'], ['🦈', 'shark', 'swim'], ['🐢', 'turtle', 'swim'], ['🐙', 'octopus', 'pulse'],
      ['🪼', 'jellyfish', 'pulse'], ['🦀', 'crab', 'walk'], ['🐚', 'shell', 'wiggle'], ['⭐', 'starfish', 'wiggle'],
      ['🪸', 'coral', 'sway'],
    ];
    const CAP = 25;
    const EVERY = 6;
    let placedCount = 0;
    let drag = null; // { id, ghost, item, existing, move, up }

    const bubbles = Array.from({ length: 10 }, () => {
      const s = U.rand(1.5, 4.5);
      return h('i', { class: 'bubble', style: { left: U.rand(2, 98) + '%', width: s + 'vmin', height: s + 'vmin', 'animation-duration': U.rand(6, 13) + 's', 'animation-delay': -U.rand(0, 13) + 's' } });
    });
    const decor = [
      h('span', { class: 'stk-decor stk-weed', style: { left: '3%', 'animation-delay': '-.4s' } }, '🌿'),
      h('span', { class: 'stk-decor stk-weed', style: { left: '16%', 'font-size': '9vmin', 'animation-delay': '-1.6s' } }, '🌿'),
      h('span', { class: 'stk-decor stk-rock', style: { left: '30%' } }, '🪨'),
      h('span', { class: 'stk-decor stk-weed', style: { left: '72%', 'animation-delay': '-2.2s' } }, '🌿'),
      h('span', { class: 'stk-decor stk-rock', style: { left: '85%', 'font-size': '7vmin' } }, '🪨'),
      h('span', { class: 'stk-decor stk-weed', style: { left: '92%', 'font-size': '10vmin', 'animation-delay': '-.9s' } }, '🌿'),
    ];
    const layer = h('div', { class: 'stk-layer' });
    const clearBtn = h('button', { class: 'stk-clear', 'aria-label': 'Clear the ocean' }, '🧽');
    const scene = h('div', { class: 'stk-scene' },
      h('div', { class: 'stk-rays' }), bubbles, h('div', { class: 'stk-sand' }), decor, layer, clearBtn);
    const tray = h('div', { class: 'tray stk-tray' });

    const stickers = () => [...layer.querySelectorAll('.stk:not(.stk-gone)')];

    /* A placed sticker: position wrapper > movement (swim/walk…) > bob > emoji */
    const makeSticker = (item, xPct, yPct) => {
      const [emoji, , beh] = item;
      const sceneW = scene.clientWidth;
      const vmin = Math.min(innerWidth, innerHeight) / 100;
      const dist = U.randInt(10, 20) * vmin;
      // swim/walk toward the roomier side first so friends stay in the ocean
      const roomRight = sceneW * (1 - xPct / 100);
      const dir = roomRight > sceneW * (xPct / 100) ? 1 : -1;
      const emojiEl2 = h('div', { class: 'stk-emoji' }, emoji);
      const bob = h('div', { class: 'stk-bob', style: { 'animation-duration': U.rand(1.8, 2.8).toFixed(2) + 's', 'animation-delay': -U.rand(0, 2).toFixed(2) + 's' } }, emojiEl2);
      const dur = beh === 'swim' ? U.rand(6, 10) : beh === 'walk' ? U.rand(3.5, 5.5) : beh === 'pulse' ? U.rand(2.4, 3.4) : U.rand(3, 5);
      const move = h('div', {
        class: `stk-move stk-${beh}${beh === 'swim' && dir > 0 ? ' stk-right' : ''}`,
        style: { '--d': dir * dist + 'px', 'animation-duration': dur.toFixed(2) + 's', 'animation-delay': beh === 'swim' || beh === 'walk' ? '0s' : -U.rand(0, dur).toFixed(2) + 's' },
      }, bob);
      const s = h('div', { class: 'stk stk-new', style: { left: xPct + '%', top: yPct + '%' } }, move);
      s.item = item;
      s.addEventListener('pointerdown', (e) => startDrag(e, item, s));
      emojiEl2.addEventListener('animationend', () => s.classList.remove('stk-new'), { once: true });
      return s;
    };

    const drift = (s) => {
      s.classList.add('stk-gone', 'stk-drift');
      s.addEventListener('animationend', () => s.remove(), { once: true });
      Engine.later(() => s.remove(), 1200);
    };

    const celebrate = () => {
      Sound.tada();
      Fx.confetti();
      App.addStar();
      Engine.later(() => Voice.say(U.pick(PRAISE)), 900);
    };

    const drop = (x, y) => {
      const r = scene.getBoundingClientRect();
      const inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      const { item, existing, ghost } = drag;
      if (!inside) {
        // back off the ocean: poof
        ghost.animate([{ transform: 'translate(-50%,-50%) scale(1.15)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(0) rotate(90deg)', opacity: 0 }],
          { duration: 280, easing: 'ease-in' }).onfinish = () => ghost.remove();
        if (existing) { Sound.pop(); existing.remove(); } else Sound.bad();
        return;
      }
      ghost.remove();
      const xPct = Math.max(6, Math.min(94, ((x - r.left) / r.width) * 100));
      const yPct = Math.max(8, Math.min(90, ((y - r.top) / r.height) * 100));
      const s = makeSticker(item, xPct, yPct);
      if (existing) existing.replaceWith(s); else layer.append(s);
      Sound.pop();
      Fx.burst(x, y, ['#ffffff', '#bff0ff', '#8fdcff'], 10);
      Voice.say(item[1]);
      if (existing) return;
      const all = stickers();
      if (all.length > CAP) drift(all[0]);
      placedCount++;
      if (placedCount % EVERY === 0) celebrate();
    };

    const endDrag = () => {
      if (!drag) return;
      removeEventListener('pointermove', drag.move);
      removeEventListener('pointerup', drag.up);
      removeEventListener('pointercancel', drag.up);
      drag = null;
    };

    const startDrag = (e, item, existing) => {
      if (drag) return;
      e.preventDefault();
      e.stopPropagation();
      const ghost = h('div', { class: 'stk-ghost', style: { left: e.clientX + 'px', top: e.clientY + 'px' } }, h('div', { class: 'stk-emoji' }, item[0]));
      Fx.layer.append(ghost);
      if (existing) existing.classList.add('stk-lifted');
      Sound.pick();
      const move = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        ghost.style.left = ev.clientX + 'px';
        ghost.style.top = ev.clientY + 'px';
      };
      const up = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        const d = drag;
        if (ev.type === 'pointercancel') {
          d.ghost.remove();
          existing?.classList.remove('stk-lifted');
        } else drop(ev.clientX, ev.clientY);
        endDrag();
      };
      drag = { ghost, item, existing, move, up };
      addEventListener('pointermove', move);
      addEventListener('pointerup', up);
      addEventListener('pointercancel', up);
    };

    STICKERS.forEach((item, i) => {
      const src = h('button', { class: 'stk-src', style: { '--i': i }, 'aria-label': item[1] }, h('span', {}, item[0]));
      src.addEventListener('pointerdown', (e) => startDrag(e, item, null));
      tray.append(src);
    });

    clearBtn.addEventListener('click', () => {
      const all = stickers();
      if (!all.length) { Fx.wiggle(clearBtn); Sound.bad(); return; }
      const sponge = h('div', { class: 'stk-sponge' }, '🧽');
      scene.append(sponge);
      Engine.later(() => sponge.remove(), 1300);
      [0, 0.15, 0.3, 0.45].forEach((at, i) => Sound.tone(300 + i * 150, { dur: 0.25, at, to: 900 + i * 150, vol: 0.08 }));
      const r = scene.getBoundingClientRect();
      all.forEach((s) => {
        const sr = s.getBoundingClientRect();
        const delay = ((sr.left - r.left) / r.width) * 700;
        s.classList.add('stk-gone');
        Engine.later(() => {
          Fx.burst(sr.left + sr.width / 2, sr.top + sr.height / 2, ['#ffffff', '#bff0ff'], 8);
          s.classList.add('stk-wash');
          Engine.later(() => s.remove(), 500);
        }, delay);
      });
      Voice.say('All clean! Let’s play again!');
    });

    Engine.onExit(() => { drag?.ghost.remove(); endDrag(); });
    stage.append(scene, tray);
    Engine.prompt('Drag the sea friends into the ocean!');
  },
});
