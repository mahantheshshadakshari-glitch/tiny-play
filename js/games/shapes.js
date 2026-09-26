'use strict';
/* Shape Sorter — fit each shape into its matching hole. */
Games.register({
  id: 'shapes',
  title: 'Shape Sorter',
  icon: '🔺',
  bg: '#ffe3b3',
  start(stage) {
    const round = () => {
      stage.replaceChildren();
      const kinds = U.pick(SHAPES, 4);
      const holes = kinds.map((k) => {
        const hole = h('div', { class: 'hole drop-target', html: Art.shape(k, '', { hole: true }) });
        hole.dataset.kind = k;
        return hole;
      });
      const tray = h('div', { class: 'tray' });
      let left = kinds.length;
      const colors = U.pick(COLORS, kinds.length);

      U.shuffle(kinds).forEach((k, i) => {
        const p = h('div', { class: 'piece', html: Art.shape(k, colors[i].hex) });
        tray.append(p);
        Drag.make(p, {
          targets: () => holes.filter((hl) => !hl.querySelector('.piece')),
          onDrop: (p, hole) => {
            if (hole.dataset.kind !== k) return false;
            Drag.moveInto(p, hole);
            Drag.lock(p);
            Sound.good();
            Voice.say(k);
            Fx.sparkle(hole);
            if (--left === 0) Engine.later(() => Reward.round(round), 600);
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'board' }, holes), tray);
      Engine.prompt('Put each shape in its hole!');
    };
    round();
  },
});
