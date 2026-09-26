'use strict';
/* Balloon Pop — tap floating balloons and count along. */
Games.register({
  id: 'balloons',
  title: 'Balloon Pop',
  icon: '🎈',
  bg: '#c9e8ff',
  start(stage) {
    const GOAL = 10;
    const WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

    const round = () => {
      stage.replaceChildren();
      let popped = 0;
      let spawner = null;
      const dots = Array.from({ length: GOAL }, () => h('div', { class: 'pop-dot' }));
      const counter = h('div', { class: 'pop-count' }, '0');
      const sky = h('div', { class: 'sky' },
        h('div', { class: 'cloud c1' }, '☁️'), h('div', { class: 'cloud c2' }, '☁️'), h('div', { class: 'cloud c3' }, '☁️'));
      stage.append(sky, h('div', { class: 'pop-hud' }, counter, h('div', { class: 'pop-dots' }, dots)));

      const spawn = () => {
        const c = U.pick(COLORS);
        const b = h('div', { class: 'balloon', html: Art.balloon(c.hex), style: { left: U.rand(4, 82) + '%' } });
        sky.append(b);
        const rise = b.animate(
          [{ transform: 'translateY(0) rotate(-4deg)' }, { transform: 'translateY(-50%) rotate(4deg)', offset: 0.5 },
           { transform: `translateY(-${stage.clientHeight + b.offsetHeight * 1.5}px) rotate(-4deg)` }],
          { duration: U.rand(5500, 8500), easing: 'linear' },
        );
        rise.onfinish = () => b.remove();
        b.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          if (b.dataset.popped) return;
          b.dataset.popped = '1';
          rise.pause();
          Sound.pop();
          const r = b.getBoundingClientRect();
          Fx.burst(r.left + r.width / 2, r.top + r.width / 2, [c.hex, '#fff'], 14);
          b.classList.add('popping');
          Engine.later(() => b.remove(), 250);
          if (popped >= GOAL) return;
          dots[popped].classList.add('on');
          popped++;
          counter.textContent = popped;
          Fx.bounce(counter);
          Voice.say(WORDS[popped - 1]);
          if (popped === GOAL) {
            clearInterval(spawner);
            Engine.later(() => Reward.round(round), 900);
          }
        });
      };
      spawn();
      spawner = Engine.every(spawn, 900);
      Engine.prompt('Pop the balloons! Let’s count to ten.');
    };
    round();
  },
});
