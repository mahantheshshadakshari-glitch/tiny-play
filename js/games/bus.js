'use strict';
/* Color Bus — sort friends onto the bus of the same color. */
Games.register({
  id: 'bus',
  title: 'Color Bus',
  icon: '🚌',
  bg: '#bfe9ff',
  start(stage) {
    const PER_BUS = 2;
    const round = () => {
      stage.replaceChildren();
      const colors = U.pick(COLORS, 3);
      const buses = colors.map((c) => {
        const seats = h('div', { class: 'bus-seats' });
        const bus = h('div', { class: 'bus drop-target', style: { '--c': c.hex } },
          seats, h('div', { class: 'bus-door' }), h('div', { class: 'wheel w1' }), h('div', { class: 'wheel w2' }));
        bus.dataset.color = c.name;
        bus.seats = seats;
        return bus;
      });
      const tray = h('div', { class: 'tray' });
      let left = colors.length * PER_BUS;

      U.shuffle(colors.flatMap((c) => Array(PER_BUS).fill(c))).forEach((c) => {
        const p = h('div', { class: 'piece', html: Art.buddy(c.hex) });
        tray.append(p);
        Drag.make(p, {
          targets: () => buses,
          onDrop: (p, bus) => {
            if (bus.dataset.color !== c.name || bus.seats.children.length >= PER_BUS) return false;
            Drag.moveInto(p, bus.seats);
            Drag.lock(p);
            Sound.good();
            Voice.say(c.name);
            Fx.sparkle(bus);
            if (--left === 0) {
              Engine.later(() => { Sound.honk(); buses.forEach((b) => b.classList.add('drive')); }, 500);
              Engine.later(() => Reward.round(round), 1700);
            }
            return true;
          },
        });
      });

      stage.append(h('div', { class: 'bus-lane' }, buses), tray);
      Engine.prompt('Put each friend on the bus with the same color!');
    };
    round();
  },
});
