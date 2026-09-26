'use strict';
/* Gift Wrap — sort presents into the box lined with the same wrapping paper (color & pattern). */
Games.register({
  id: 'gifts',
  title: 'Gift Wrap',
  icon: '🎁',
  bg: '#ffe0e9',
  start(stage) {
    const PATTERNS = [
      { key: 'stripes', name: 'stripes' },
      { key: 'dots', name: 'polka dots' },
      { key: 'checks', name: 'checks' },
      { key: 'zigzag', name: 'zigzags' },
    ];
    const PAPER_COLORS = COLORS.filter((c) => c.name !== 'yellow'); // white accents need contrast
    const TOYS = ['🧸', '🚗', '⚽', '🪀', '🦆', '🎨', '🚂', '🪁', '🦖', '🤖', '🪅', '🐰'];
    let variant = 0;

    /* Three papers per round; every third round is harder in a different way. */
    const makePapers = () => {
      const v = variant++ % 3;
      if (v === 1) { // same color, different patterns
        const c = U.pick(PAPER_COLORS);
        return { v, papers: U.pick(PATTERNS, 3).map((p) => ({ p, c })) };
      }
      if (v === 2) { // same pattern, different colors
        const p = U.pick(PATTERNS);
        return { v, papers: U.pick(PAPER_COLORS, 3).map((c) => ({ p, c })) };
      }
      const ps = U.pick(PATTERNS, 3);
      return { v, papers: U.pick(PAPER_COLORS, 3).map((c, i) => ({ p: ps[i], c })) };
    };

    const paperEl = (cls, { p, c }, ...kids) =>
      h('div', { class: `${cls} gifts-paper gp-${p.key}`, style: { '--c': c.hex } }, ...kids);

    const describe = ({ p, c }, v) => (v === 1 ? p.name : v === 2 ? c.name : `${c.name} ${p.name}`);

    const round = () => {
      stage.replaceChildren();
      const { v, papers } = makePapers();
      let left = papers.length;

      const boxes = papers.map((paper, i) => {
        const inside = h('div', { class: 'gifts-inside' });
        const lid = paperEl('gifts-lid', paper);
        const box = h('div', { class: 'gifts-box drop-target', style: { '--i': i } },
          lid,
          paperEl('gifts-body', paper, h('div', { class: 'gifts-rim' }), inside,
            h('div', { class: 'gifts-ribbon-v' }), h('div', { class: 'gifts-ribbon-h' })),
          h('div', { class: 'gifts-bow' }, '🎀'));
        box.paper = paper;
        box.inside = inside;
        return box;
      });

      const tray = h('div', { class: 'tray' });
      U.shuffle(papers).forEach((paper) => {
        const toy = U.pick(TOYS);
        const g = h('div', { class: 'piece gifts-gift' },
          paperEl('gifts-wrap', paper, h('div', { class: 'gifts-tag' }, emojiEl(toy))));
        g.toy = toy;
        tray.append(g);
        Drag.make(g, {
          targets: () => boxes.filter((b) => !b.classList.contains('wrapped')),
          onDrop: (g, box) => {
            if (box.paper !== paper) return false;
            Drag.moveInto(g, box.inside);
            Drag.lock(g);
            box.classList.add('wrapped');
            box.toy = g.toy;
            Sound.good();
            Voice.say(describe(paper, v));
            // Gift sinks in, then the lid drops on with a bounce and the bow pops on.
            Engine.later(() => { g.classList.add('gifts-sink'); }, 250);
            Engine.later(() => { box.classList.add('closed'); Sound.tone(260, { dur: 0.12, type: 'triangle', vol: 0.18 }); }, 550);
            Engine.later(() => { box.classList.add('bowed'); Fx.sparkle(box); Sound.tone(1200, { dur: 0.1, to: 1800, vol: 0.08 }); }, 950);
            if (--left === 0) Engine.later(finale, 1500);
            return true;
          },
        });
      });

      /* All wrapped: boxes wiggle, lids pop, toys spring out, confetti. */
      const finale = () => {
        boxes.forEach((b, i) => {
          Engine.later(() => b.classList.add('gifts-shake'), i * 120);
          Engine.later(() => {
            b.classList.add('popped');
            Sound.pop();
            const [x, y] = Fx.centerOf(b);
            Fx.burst(x, y - 30, COLORS.map((c) => c.hex), 16);
            b.append(h('div', { class: 'gifts-toy' }, emojiEl(b.toy)));
          }, 700 + i * 180);
        });
        Engine.later(() => Reward.round(round), 1800);
      };

      stage.append(h('div', { class: 'row gifts-row' }, boxes), tray);
      Engine.prompt(v === 0
        ? 'Wrap the presents! Put each one in the box with the same paper.'
        : v === 1 ? 'Look at the patterns! Stripes, dots, checks. Match the paper.' : 'Look at the colors! Match each present to its box.');
    };
    round();
  },
});
