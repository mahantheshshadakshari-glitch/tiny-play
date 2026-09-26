'use strict';
/* Pixel Art — pick a color and tap (or swipe) the matching dots to reveal a picture. */
Games.register({
  id: 'pixel',
  title: 'Pixel Art',
  icon: '🎨',
  bg: '#fff0d6',
  start(stage) {
    const PALETTE = {
      R: ['#ff4d4d', 'red'], P: ['#ff8fc0', 'pink'], O: ['#ff9a2e', 'orange'], Y: ['#ffd23d', 'yellow'],
      K: ['#3a2e5c', 'black'], W: ['#ffffff', 'white'], B: ['#9a6334', 'brown'], G: ['#3ecf5a', 'green'], C: ['#3d8bff', 'blue'],
    };
    // '.' = empty. Every row of a picture has the same width.
    const PICTURES = [
      { name: 'heart', rows: ['.RR...RR.', 'RPRR.RRRR', 'RPRRRRRRR', 'RRRRRRRRR', '.RRRRRRR.', '..RRRRR..', '...RRR...', '....R....'] },
      { name: 'fish', rows: ['...OOOO...', '..OOOOOO.Y', '.OKOOOOOYY', 'OOOOOOOOYY', '.OOOOOOOYY', '..OOOOOO.Y', '...OOOO...'] },
      { name: 'star', rows: ['....Y....', '...YYY...', '...YYY...', 'YYYYYYYYY', '.YYYOYYY.', '..YYYYY..', '..YYYYY..', '.YYY.YYY.', '.YY...YY.'] },
      { name: 'apple', rows: ['....BGG.', '....B...', '.RRRBRR.', 'RRRRRRRR', 'RWRRRRRR', 'RWRRRRRR', 'RRRRRRRR', '.RRRRRR.', '..RR.RR.'] },
      { name: 'flower', rows: ['..P...P..', '.PPP.PPP.', '.PPPYPPP.', '...YYY...', '.PPPYPPP.', '.PPP.PPP.', '..P.G.P..', '....GGG..', '....G....'] },
      { name: 'house', rows: ['....R....', '...RRR...', '..RRRRR..', '.RRRRRRR.', 'RRRRRRRRR', '.YYYYYYY.', '.YCCYBBY.', '.YCCYBBY.', '.YYYYBBY.'] },
      { name: 'kitty', rows: ['O.......O', 'OO.....OO', 'OOOOOOOOO', 'OOKOOOKOO', 'OOOOOOOOO', 'OOOOPOOOO', '.OOOOOOO.', '..OOOOO..'] },
      { name: 'sun', rows: ['Y...Y...Y', '.Y..Y..Y.', '...OOO...', '..OOOOO..', 'YYOOOOOYY', '..OOOOO..', '...OOO...', '.Y..Y..Y.', 'Y...Y...Y'] },
    ];
    const NOTES = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568];
    let last = -1;
    let st = null;

    const select = (key, say = true) => {
      st.sel = key;
      st.buttons.forEach((b) => b.classList.toggle('on', b.dataset.c === key));
      const b = st.buttons.find((x) => x.dataset.c === key);
      if (b) Fx.bounce(b);
      if (say) Voice.say(PALETTE[key][1]);
      Sound.tap();
    };

    const paint = (cell) => {
      if (!st || st.done || !cell || !cell.dataset.c || cell.classList.contains('filled')) return;
      if (cell.dataset.c !== st.sel) {
        if (st.wiggled.has(cell)) return;
        st.wiggled.add(cell);
        Fx.wiggle(cell);
        const now = performance.now();
        if (now - st.hintAt > 2500) {
          st.hintAt = now;
          Sound.bad();
          Voice.say(`That dot is ${PALETTE[cell.dataset.c][1]}!`);
        }
        return;
      }
      cell.classList.add('filled');
      st.filled++;
      Sound.tone(NOTES[st.filled % NOTES.length] * (st.filled % 18 >= 9 ? 1.5 : 1), { dur: 0.12, type: 'triangle', vol: 0.09 });
      const left = --st.remaining[st.sel];
      if (left === 0) {
        const btn = st.buttons.find((x) => x.dataset.c === st.sel);
        btn.classList.add('done');
        Fx.sparkle(btn);
        const next = Object.keys(st.remaining).find((k) => st.remaining[k] > 0);
        if (next) Engine.later(() => { if (st && !st.done) select(next); }, 250);
      }
      if (st.filled === st.total) finish();
    };

    const finish = () => {
      st.done = true;
      const { grid, pic } = st;
      grid.classList.add('done');
      Engine.later(() => {
        Fx.bounce(grid);
        const r = grid.getBoundingClientRect();
        for (let i = 0; i < 6; i++) {
          Engine.later(() => Fx.burst(r.left + U.rand(0.1, 0.9) * r.width, r.top + U.rand(0.1, 0.9) * r.height, ['#ffd23d', '#fff3a8', '#ffffff', '#ff8fc0'], 10), i * 120);
        }
        Sound.good();
        Voice.say(`A ${pic.name}!`);
      }, 450);
      Engine.later(() => Reward.round(round), 2300);
    };

    const cellAt = (x, y) => document.elementFromPoint(x, y)?.closest?.('.pix-cell');

    const round = () => {
      stage.replaceChildren();
      let pi;
      do { pi = U.randInt(0, PICTURES.length - 1); } while (pi === last);
      last = pi;
      const pic = PICTURES[pi];
      const cols = pic.rows[0].length, rows = pic.rows.length;
      const remaining = {};
      const grid = h('div', { class: 'pix-grid', style: { '--cols': cols, '--rows': rows } });
      pic.rows.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch === '.') { grid.append(h('div', { class: 'pix-blank' })); return; }
        remaining[ch] = (remaining[ch] || 0) + 1;
        const cell = h('div', { class: 'pix-cell', style: { '--c': PALETTE[ch][0], '--i': x + y } });
        cell.dataset.c = ch;
        grid.append(cell);
      }));
      const keys = Object.keys(remaining).sort((a, b) => remaining[b] - remaining[a]);
      const buttons = keys.map((k, i) => {
        const b = h('button', { class: 'pix-color', style: { '--c': PALETTE[k][0], '--i': i }, 'aria-label': PALETTE[k][1] }, h('span', { class: 'pix-drop' }));
        b.dataset.c = k;
        b.addEventListener('click', () => select(k));
        return b;
      });
      st = { pic, grid, buttons, remaining, total: Object.values(remaining).reduce((a, b) => a + b, 0), filled: 0, sel: null, done: false, hintAt: 0, wiggled: new Set(), painting: null };

      grid.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        st.painting = e.pointerId;
        st.wiggled = new Set();
        paint(cellAt(e.clientX, e.clientY));
      });
      grid.addEventListener('pointermove', (e) => {
        if (st.painting !== e.pointerId) return;
        // sample along the path so fast swipes don't skip cells
        const ev = e.getCoalescedEvents?.() || [e];
        ev.forEach((p) => paint(cellAt(p.clientX, p.clientY)));
      });
      const stop = (e) => { if (st && st.painting === e.pointerId) st.painting = null; };
      grid.addEventListener('pointerup', stop);
      grid.addEventListener('pointercancel', stop);
      grid.addEventListener('lostpointercapture', stop);

      stage.append(h('div', { class: 'pix-frame' }, grid), h('div', { class: 'pix-palette' }, buttons));
      select(keys[0], false);
      Engine.prompt(`Let's color a picture! Pick a color and tap the dots. Start with ${PALETTE[keys[0]][1]}!`);
    };

    Engine.onExit(() => { st = null; });
    round();
  },
});
