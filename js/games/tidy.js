'use strict';
/* Tidy Up — sort things into the right box (toys/clothes, fruit/veggies…). */
Games.register({
  id: 'tidy',
  title: 'Tidy Up',
  icon: '🧸',
  bg: '#ffe0cc',
  start(stage) {
    const SETS = [
      [{ name: 'toys', icon: '🧸', color: '#ffb3c7', items: ['⚽', '🪀', '🚗', '🪁', '🎲', '🧩'] },
       { name: 'clothes', icon: '👕', color: '#a8d8ff', items: ['👖', '🧦', '🧢', '👗', '👟', '🧤'] }],
      [{ name: 'fruits', icon: '🍎', color: '#ffc9a8', items: ['🍌', '🍇', '🍓', '🍊', '🍉', '🍐'] },
       { name: 'vegetables', icon: '🥕', color: '#b9ecb0', items: ['🥦', '🌽', '🍆', '🥒', '🫑', '🧅'] }],
      [{ name: 'sea animals', icon: '🌊', color: '#9fdcff', items: ['🐟', '🐙', '🐬', '🦀', '🐳', '🦈'] },
       { name: 'farm animals', icon: '🌳', color: '#c8ec9a', items: ['🐶', '🐮', '🐷', '🐴', '🐑', '🐔'] }],
      [{ name: 'things that fly', icon: '☁️', color: '#d6e9ff', items: ['✈️', '🚁', '🎈', '🚀', '🪂', '🦋'] },
       { name: 'things that drive', icon: '🛣️', color: '#e5dccb', items: ['🚗', '🚌', '🚲', '🚜', '🚓', '🚒'] }],
    ];
    let lastSet = -1;

    const round = () => {
      stage.replaceChildren();
      let si;
      do { si = U.randInt(0, SETS.length - 1); } while (si === lastSet);
      lastSet = si;
      const groups = SETS[si];

      const bins = groups.map((g) => {
        const content = h('div', { class: 'bin-content' });
        const bin = h('div', { class: 'bin drop-target', style: { '--c': g.color } },
          h('div', { class: 'bin-label' }, emojiEl(g.icon)), content);
        bin.dataset.group = g.name;
        bin.content = content;
        return bin;
      });

      const things = U.shuffle(groups.flatMap((g) => U.pick(g.items, 3).map((it) => ({ it, g }))));
      const tray = h('div', { class: 'tray' });
      let left = things.length;

      things.forEach(({ it, g }) => {
        const p = h('div', { class: 'piece' }, emojiEl(it));
        tray.append(p);
        Drag.make(p, {
          targets: () => bins,
          onDrop: (p, bin) => {
            if (bin.dataset.group !== g.name) return false;
            Drag.moveInto(p, bin.content);
            Drag.lock(p);
            Sound.good();
            Voice.say(g.name);
            Fx.bounce(bin);
            if (--left === 0) Engine.later(() => Reward.round(round), 600);
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'row' }, bins), tray);
      Engine.prompt(`Tidy up! ${groups[0].name} in one box, ${groups[1].name} in the other.`);
    };
    round();
  },
});
