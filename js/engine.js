'use strict';
/* Core engine: helpers, art, sound, voice, drag & drop, effects, app shell. */

const U = {
  shuffle(a) {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  pick(a, n) {
    return n === undefined ? a[Math.floor(Math.random() * a.length)] : U.shuffle(a).slice(0, n);
  },
  rand: (min, max) => min + Math.random() * (max - min),
  randInt: (min, max) => Math.floor(min + Math.random() * (max - min + 1)),
  plural: (n, word) => (n === 1 ? word : word + 's'),
};

/* Tiny DOM builder: h('div', {class: 'x', style: {'--c': 'red'}, onclick}, ...children) */
function h(tag, props = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style') {
      if (typeof v === 'string') e.style.cssText = v;
      else for (const [p, val] of Object.entries(v)) e.style.setProperty(p, val);
    } else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) e.append(c);
  return e;
}

const Store = {
  get(k, d) {
    try { const v = localStorage.getItem('tg.' + k); return v === null ? d : JSON.parse(v); } catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem('tg.' + k, JSON.stringify(v)); } catch { /* storage blocked */ }
  },
};

const COLORS = [
  { name: 'red', hex: '#ff4d4d' },
  { name: 'blue', hex: '#3d8bff' },
  { name: 'yellow', hex: '#ffd23d' },
  { name: 'green', hex: '#3ecf5a' },
  { name: 'orange', hex: '#ff9a2e' },
  { name: 'purple', hex: '#a45cff' },
  { name: 'pink', hex: '#ff6fb5' },
];

const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];

const PRAISE = ['Great job!', 'Well done!', 'Awesome!', 'You did it!', 'Super!', 'Hooray!', 'Fantastic!', 'Yay!'];

/* ---------- SVG art ---------- */
const Art = {
  starPoints(cx = 50, cy = 54, R = 46, r = 20) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = ((-90 + i * 36) * Math.PI) / 180;
      const rad = i % 2 ? r : R;
      pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(' ');
  },
  shapePath(kind) {
    switch (kind) {
      case 'circle': return '<circle cx="50" cy="50" r="44"/>';
      case 'square': return '<rect x="8" y="8" width="84" height="84" rx="10"/>';
      case 'triangle': return '<polygon points="50,6 95,90 5,90"/>';
      case 'star': return `<polygon points="${Art.starPoints()}"/>`;
      case 'heart': return '<path d="M50 90 C20 66 4 47 4 29 C4 14 16 5 29 5 C39 5 46 11 50 19 C54 11 61 5 71 5 C84 5 96 14 96 29 C96 47 80 66 50 90 Z"/>';
      case 'diamond': return '<polygon points="50,4 94,50 50,96 6,50"/>';
    }
  },
  faceY: { circle: 50, square: 50, triangle: 64, star: 56, heart: 40, diamond: 50 },
  face(cy, scale = 1) {
    const s = scale;
    // Eyes blink and the mouth opens into a grin via CSS (.eyes / .mouth classes).
    return `<g class="face">
      <g class="eyes" style="animation-delay:${U.rand(0, 3).toFixed(2)}s">
        <circle cx="${50 - 12 * s}" cy="${cy - 4}" r="${6 * s}" fill="#fff"/><circle cx="${50 + 12 * s}" cy="${cy - 4}" r="${6 * s}" fill="#fff"/>
        <circle cx="${51 - 12 * s}" cy="${cy - 3}" r="${3.5 * s}" fill="#222"/><circle cx="${51 + 12 * s}" cy="${cy - 3}" r="${3.5 * s}" fill="#222"/>
      </g>
      <path class="mouth" d="M${50 - 9 * s} ${cy + 7} Q50 ${cy + 7 + 9 * s} ${50 + 9 * s} ${cy + 7}" stroke="#222" stroke-width="${3.5 * s}" fill="none" stroke-linecap="round"/>
      <path class="grin" d="M${50 - 10 * s} ${cy + 6} Q50 ${cy + 6 + 16 * s} ${50 + 10 * s} ${cy + 6} Z" fill="#c2334d" stroke="#222" stroke-width="${3 * s}" stroke-linejoin="round"/>
    </g>`;
  },
  shape(kind, fill, { hole = false, face = true } = {}) {
    const style = hole
      ? 'fill="rgba(70,35,0,.28)" stroke="rgba(70,35,0,.35)" stroke-width="3"'
      : `fill="${fill}" stroke="rgba(0,0,0,.18)" stroke-width="4"`;
    return `<svg viewBox="0 0 100 100" class="shape-svg"><g ${style} stroke-linejoin="round">${Art.shapePath(kind)}</g>${!hole && face ? Art.face(Art.faceY[kind], kind === 'triangle' ? 0.8 : 1) : ''}</svg>`;
  },
  buddy(hex) {
    return `<svg viewBox="0 0 100 100" class="shape-svg">
      <ellipse cx="34" cy="92" rx="10" ry="6" fill="${hex}" stroke="rgba(0,0,0,.18)" stroke-width="3"/>
      <ellipse cx="66" cy="92" rx="10" ry="6" fill="${hex}" stroke="rgba(0,0,0,.18)" stroke-width="3"/>
      <circle cx="50" cy="52" r="40" fill="${hex}" stroke="rgba(0,0,0,.18)" stroke-width="4"/>
      <circle cx="28" cy="62" r="6" fill="#ff8fab" opacity=".6"/><circle cx="72" cy="62" r="6" fill="#ff8fab" opacity=".6"/>
      ${Art.face(50)}
    </svg>`;
  },
  balloon(hex) {
    return `<svg viewBox="0 0 100 150" class="shape-svg">
      <path d="M50 108 Q44 125 54 135 Q60 142 50 150" stroke="#777" stroke-width="2" fill="none"/>
      <ellipse cx="50" cy="52" rx="40" ry="48" fill="${hex}"/>
      <polygon points="44,106 56,106 50,98" fill="${hex}"/>
      <ellipse cx="36" cy="34" rx="8" ry="14" fill="#fff" opacity=".45" transform="rotate(-20 36 34)"/>
    </svg>`;
  },
};

/* ---------- Sound (synthesized, no audio files) ---------- */
const Sound = {
  muted: Store.get('muted', false),
  ctx: null,
  ac() {
    try {
      this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    } catch { return null; }
  },
  tone(freq, { dur = 0.15, type = 'sine', vol = 0.2, at = 0, to = null } = {}) {
    if (this.muted) return;
    const ac = this.ac();
    if (!ac) return;
    const t = ac.currentTime + at;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  },
  pick() { this.tone(500, { dur: 0.08, to: 800, vol: 0.12 }); },
  tap() { this.tone(800, { dur: 0.05, vol: 0.1 }); },
  good() { [660, 880, 1175].forEach((f, i) => this.tone(f, { dur: 0.18, at: i * 0.07, vol: 0.15, type: 'triangle' })); },
  /* Wrong answers get a silly sound — toddlers love these, so keep them playful, never harsh. */
  bad() {
    const silly = [
      () => { this.tone(400, { dur: 0.35, to: 120, type: 'sine', vol: 0.25 }); }, // slide whistle down
      () => { [0, 0.12, 0.24].forEach((at) => this.tone(180, { dur: 0.1, at, to: 320, type: 'triangle', vol: 0.2 })); }, // boing-boing
      () => { this.tone(150, { dur: 0.3, to: 90, type: 'sawtooth', vol: 0.08 }); this.tone(155, { dur: 0.3, to: 92, type: 'sawtooth', vol: 0.08 }); }, // raspberry
    ];
    U.pick(silly)();
  },
  pop() { this.tone(900, { dur: 0.09, to: 120, type: 'square', vol: 0.1 }); this.tone(1500, { dur: 0.04, type: 'triangle', vol: 0.08 }); },
  flip() { this.tone(700, { dur: 0.06, to: 1000, vol: 0.08 }); },
  chomp() { [0, 0.14].forEach((at) => this.tone(220, { dur: 0.08, at, to: 120, type: 'square', vol: 0.08 })); },
  honk() { this.tone(330, { dur: 0.18, type: 'square', vol: 0.07 }); this.tone(330, { dur: 0.25, at: 0.25, type: 'square', vol: 0.07 }); },
  tada() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, { dur: 0.22, at: i * 0.1, vol: 0.16, type: 'triangle' })); },
};

/* ---------- Voice (built-in speech synthesis) ---------- */
const Voice = {
  voice: null,
  choose() {
    const en = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
    this.voice = en.find((v) => /samantha|karen|moira|tessa|google us english|female/i.test(v.name)) || en[0] || null;
  },
  say(text) {
    if (Sound.muted || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      if (!this.voice) this.choose();
      const u = new SpeechSynthesisUtterance(text);
      if (this.voice) u.voice = this.voice;
      u.lang = this.voice?.lang || 'en-US';
      u.rate = 0.9;
      u.pitch = 1.25;
      speechSynthesis.speak(u);
    } catch { /* speech unavailable */ }
  },
};
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => Voice.choose();

/* ---------- Engine: per-game timers & prompts, cleared on exit ---------- */
const Engine = {
  timers: new Set(),
  cleanups: [],
  promptText: '',
  later(fn, ms) {
    const id = setTimeout(() => { this.timers.delete(id); fn(); }, ms);
    this.timers.add(id);
    return id;
  },
  every(fn, ms) {
    const id = setInterval(fn, ms);
    this.timers.add(id);
    return id;
  },
  onExit(fn) { this.cleanups.push(fn); },
  reset() {
    this.timers.forEach((id) => { clearTimeout(id); clearInterval(id); });
    this.timers.clear();
    this.cleanups.splice(0).forEach((f) => { try { f(); } catch { /* ignore */ } });
    this.promptText = '';
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  },
  prompt(text) {
    this.promptText = text;
    Voice.say(text);
  },
};

/* ---------- Drag & drop (pointer events: mouse, touch, pen) ---------- */
const Drag = {
  PAD: 24, // forgiving hit area for small fingers

  make(el, { targets, onDrop }) {
    el.classList.add('draggable');
    // Stagger the pop-in entrance / idle bob by position in the tray.
    if (el.parentElement) el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
    el.addEventListener('pointerdown', (e) => {
      if (el.dataset.locked || el.classList.contains('dragging')) return;
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      const sx = e.clientX, sy = e.clientY;
      el.classList.add('dragging');
      el.style.transition = 'none';
      Sound.pick();
      let over = null;

      const hit = (x, y) =>
        targets().find((t) => {
          const r = t.getBoundingClientRect();
          return x >= r.left - Drag.PAD && x <= r.right + Drag.PAD && y >= r.top - Drag.PAD && y <= r.bottom + Drag.PAD;
        }) || null;

      const move = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        el.style.transform = `translate(${ev.clientX - sx}px, ${ev.clientY - sy}px) scale(1.12)`;
        const t = hit(ev.clientX, ev.clientY);
        if (t !== over) {
          over?.classList.remove('drop-hover');
          over = t;
          over?.classList.add('drop-hover');
        }
      };
      const up = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        over?.classList.remove('drop-hover');
        el.classList.remove('dragging');
        const t = ev.type === 'pointercancel' ? null : hit(ev.clientX, ev.clientY);
        const ok = t ? onDrop(el, t) : false;
        if (!ok) {
          Drag.returnHome(el);
          if (t) { Sound.bad(); Fx.wiggle(t); Fx.wiggle(el.firstElementChild || el); }
        }
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  },

  returnHome(el) {
    el.style.transition = 'transform .4s cubic-bezier(.3,1.6,.5,1)';
    el.style.transform = '';
  },

  /* Move el into container, animating from where it was dropped (FLIP). */
  moveInto(el, container) {
    const r1 = el.getBoundingClientRect();
    container.append(el);
    el.style.transition = 'none';
    el.style.transform = '';
    const r2 = el.getBoundingClientRect();
    const dx = r1.left + r1.width / 2 - (r2.left + r2.width / 2);
    const dy = r1.top + r1.height / 2 - (r2.top + r2.height / 2);
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    void el.offsetWidth;
    el.style.transition = 'transform .3s ease-out';
    el.style.transform = '';
  },

  lock(el) {
    el.dataset.locked = '1';
    el.classList.add('placed');
  },
};

/* ---------- Visual effects ---------- */
const Fx = {
  layer: null,
  wiggle(el) {
    el.classList.remove('wiggle');
    void el.offsetWidth;
    el.classList.add('wiggle');
    el.addEventListener('animationend', () => el.classList.remove('wiggle'), { once: true });
  },
  bounce(el) {
    el.classList.remove('bounce');
    void el.offsetWidth;
    el.classList.add('bounce');
    el.addEventListener('animationend', () => el.classList.remove('bounce'), { once: true });
  },
  centerOf(el) {
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  },
  burst(x, y, colors = COLORS.map((c) => c.hex), n = 12) {
    for (let i = 0; i < n; i++) {
      const d = h('div', { class: 'particle', style: { background: U.pick(colors), left: x + 'px', top: y + 'px' } });
      this.layer.append(d);
      const a = (i / n) * Math.PI * 2;
      const dist = U.rand(40, 110);
      d.animate(
        [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
         { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist}px)) scale(.3)`, opacity: 0 }],
        { duration: 600, easing: 'cubic-bezier(.2,.8,.4,1)' },
      ).onfinish = () => d.remove();
    }
  },
  sparkle(el) {
    const [x, y] = this.centerOf(el);
    this.burst(x, y, ['#ffd23d', '#fff3a8', '#ffffff', '#ffb84d'], 10);
  },
  confetti() {
    const w = innerWidth, hgt = innerHeight;
    for (let i = 0; i < 70; i++) {
      const d = h('div', {
        class: 'confetti',
        style: { background: U.pick(COLORS).hex, left: U.rand(0, w) + 'px', width: U.rand(8, 16) + 'px', height: U.rand(10, 22) + 'px' },
      });
      this.layer.append(d);
      d.animate(
        [{ transform: `translate(0, -40px) rotate(0deg)` },
         { transform: `translate(${U.rand(-120, 120)}px, ${hgt + 60}px) rotate(${U.rand(360, 1080)}deg)` }],
        { duration: U.rand(1600, 2800), delay: U.rand(0, 400), easing: 'cubic-bezier(.25,.6,.5,1)', fill: 'backwards' },
      ).onfinish = () => d.remove();
    }
  },
};

/* ---------- Rewards ---------- */
const Reward = {
  /* Call when a round is finished; runs the celebration then next(). */
  round(next) {
    Sound.tada();
    Voice.say(U.pick(PRAISE));
    Fx.confetti();
    App.addStar();
    App.stage?.append(h('div', { class: 'celebrate' }, h('div', { class: 'big-star' }, '⭐')));
    Engine.later(next, 2400);
  },
};

/* ---------- Game registry & app shell ---------- */
const Games = {
  list: [],
  register(game) { this.list.push(game); },
};

const App = {
  root: null,
  stage: null,
  stars: Store.get('stars', 0),

  init() {
    this.root = document.getElementById('app');
    Fx.layer = document.getElementById('fx');
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    addEventListener('popstate', () => this.home(false));
    this.home(false);
  },

  addStar() {
    this.stars++;
    Store.set('stars', this.stars);
    document.querySelectorAll('.star-count').forEach((s) => { s.textContent = this.stars; Fx.bounce(s.parentElement); });
  },

  starBadge() {
    return h('div', { class: 'stars' }, '⭐ ', h('span', { class: 'star-count' }, String(this.stars)));
  },

  muteButton() {
    const btn = h('button', { class: 'icon-btn', 'aria-label': 'Sound on or off' }, Sound.muted ? '🔇' : '🔊');
    btn.addEventListener('click', () => {
      Sound.muted = !Sound.muted;
      Store.set('muted', Sound.muted);
      btn.textContent = Sound.muted ? '🔇' : '🔊';
      if (Sound.muted && 'speechSynthesis' in window) speechSynthesis.cancel();
    });
    return btn;
  },

  home(fromGame = true) {
    Engine.reset();
    this.stage = null;
    if (fromGame && history.state?.game) history.back();
    const tiles = Games.list.map((g, i) =>
      h('button', {
        class: 'tile',
        style: { '--bg': g.bg, 'animation-delay': i * 40 + 'ms' },
        onclick: () => this.play(g),
      }, h('span', { class: 'tile-icon' }, g.icon), h('span', { class: 'tile-title' }, g.title)),
    );
    this.root.replaceChildren(
      h('div', { class: 'screen home' },
        h('header', { class: 'home-bar' },
          h('h1', {}, h('span', {}, 'Tiny'), h('span', {}, 'Play')),
          h('div', { class: 'bar-right' }, this.starBadge(), this.muteButton())),
        h('main', { class: 'tiles' }, tiles)),
    );
  },

  play(game) {
    Engine.reset();
    Sound.ac(); // unlock audio inside the tap gesture
    Sound.tap();
    history.pushState({ game: game.id }, '');
    const stage = h('main', { class: `stage game-${game.id}`, style: { '--bg': game.bg } });
    this.stage = stage;
    this.root.replaceChildren(
      h('div', { class: 'screen game' },
        h('header', { class: 'game-bar', style: { '--bg': game.bg } },
          h('button', { class: 'icon-btn home-btn', 'aria-label': 'Home', onclick: () => this.home() }, '🏠'),
          h('div', { class: 'game-title' }, game.icon + ' ' + game.title),
          h('div', { class: 'bar-right' },
            h('button', { class: 'icon-btn', 'aria-label': 'Say it again', onclick: () => Voice.say(Engine.promptText) }, '💬'),
            this.starBadge())),
        stage),
    );
    game.start(stage);
  },
};

/* Shared building blocks for games */
function emojiEl(char, cls = '') {
  return h('div', { class: `emoji ${cls}` }, char);
}
