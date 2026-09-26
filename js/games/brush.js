'use strict';
/* Brush Teeth — scrub the dirt off a friendly animal's teeth with a toothbrush. */
Games.register({
  id: 'brush',
  title: 'Brush Teeth',
  icon: '🪥',
  bg: '#d9f6ff',
  start(stage) {
    const CHARS = [
      { name: 'hippo', color: '#b9a3e3', dark: '#9a82cc', kind: 'hippo' },
      { name: 'crocodile', color: '#62c46f', dark: '#46a653', kind: 'croc' },
      { name: 'shark', color: '#8fb3d9', dark: '#6d93bd', kind: 'shark' },
    ];
    const VB_W = 400, VB_H = 320;
    const TOOTH_W = 44, TOOTH_H = 46, UP_Y = 130, LOW_Y = 224;
    const toothX = (i) => 100 + i * (TOOTH_W + 8);
    let ci = U.randInt(0, CHARS.length - 1);
    let uid = 0;
    let st = null; // current round state

    /* ---- brushing "swish": short band-passed noise burst ---- */
    let noiseBuf = null;
    const swish = () => {
      if (Sound.muted) return;
      const ac = Sound.ac();
      if (!ac) return;
      if (!noiseBuf) {
        noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.2), ac.sampleRate);
        const d = noiseBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      const t = ac.currentTime;
      const src = ac.createBufferSource();
      src.buffer = noiseBuf;
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = U.rand(2500, 4500);
      f.Q.value = 1.2;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      src.connect(f).connect(g).connect(ac.destination);
      src.start(t);
      src.stop(t + 0.2);
    };

    const tooth = (kind, x, upper) => {
      const y = upper ? UP_Y : LOW_Y;
      if (kind === 'hippo') return `<rect class="brush-tooth" x="${x}" y="${y}" width="${TOOTH_W}" height="${TOOTH_H}" rx="12"/>`;
      const pts = upper
        ? `${x},${y} ${x + TOOTH_W},${y} ${x + TOOTH_W / 2},${y + TOOTH_H}`
        : `${x},${y + TOOTH_H} ${x + TOOTH_W},${y + TOOTH_H} ${x + TOOTH_W / 2},${y}`;
      return `<polygon class="brush-tooth" points="${pts}" stroke-linejoin="round"/>`;
    };

    const dirt = (cx, cy, i) => `<g class="brush-dirt" data-i="${i}" style="transform-origin:${cx}px ${cy}px">
        <circle cx="${cx - 7}" cy="${cy - 2}" r="${U.randInt(10, 13)}" fill="#a38b3a"/>
        <circle cx="${cx + 8}" cy="${cy + 4}" r="${U.randInt(8, 11)}" fill="#8c9a35"/>
        <circle cx="${cx + 2}" cy="${cy - 9}" r="${U.randInt(6, 9)}" fill="#b59a45"/>
        <circle cx="${cx - 4}" cy="${cy + 6}" r="2.5" fill="#5e5020"/><circle cx="${cx + 9}" cy="${cy - 5}" r="2" fill="#5e5020"/>
      </g>`;

    const charSVG = (c, dirty) => {
      const id = `brushMouth${++uid}`;
      const k = c.kind;
      let top = '', eyes = '', extra = '';
      if (k === 'hippo') {
        top = `<ellipse cx="95" cy="52" rx="24" ry="19" fill="${c.dark}"/><ellipse cx="305" cy="52" rx="24" ry="19" fill="${c.dark}"/>
               <circle cx="140" cy="78" r="44" fill="${c.color}"/><circle cx="260" cy="78" r="44" fill="${c.color}"/>`;
        eyes = `<circle cx="140" cy="74" r="22" fill="#fff"/><circle cx="260" cy="74" r="22" fill="#fff"/>
                <circle cx="143" cy="77" r="11" fill="#222"/><circle cx="263" cy="77" r="11" fill="#222"/>
                <circle cx="147" cy="72" r="4" fill="#fff"/><circle cx="267" cy="72" r="4" fill="#fff"/>`;
        extra = `<ellipse cx="170" cy="112" rx="8" ry="5" fill="${c.dark}"/><ellipse cx="230" cy="112" rx="8" ry="5" fill="${c.dark}"/>`;
      } else if (k === 'croc') {
        top = `<circle cx="140" cy="68" r="40" fill="${c.color}"/><circle cx="260" cy="68" r="40" fill="${c.color}"/>
               ${[60, 100, 300, 340].map((x) => `<circle cx="${x}" cy="${x < 200 ? 118 : 118}" r="9" fill="${c.dark}"/>`).join('')}`;
        eyes = `<circle cx="140" cy="64" r="22" fill="#fff7a8"/><circle cx="260" cy="64" r="22" fill="#fff7a8"/>
                <ellipse cx="141" cy="66" rx="5" ry="13" fill="#222"/><ellipse cx="261" cy="66" rx="5" ry="13" fill="#222"/>`;
        extra = `<circle cx="182" cy="116" r="5" fill="${c.dark}"/><circle cx="218" cy="116" r="5" fill="${c.dark}"/>`;
      } else {
        top = `<polygon points="165,80 205,4 245,80" fill="${c.dark}" stroke-linejoin="round"/>`;
        eyes = `<circle cx="112" cy="104" r="17" fill="#fff"/><circle cx="288" cy="104" r="17" fill="#fff"/>
                <circle cx="115" cy="106" r="9" fill="#222"/><circle cx="291" cy="106" r="9" fill="#222"/>
                <circle cx="118" cy="102" r="3" fill="#fff"/><circle cx="294" cy="102" r="3" fill="#fff"/>`;
        extra = [30, 45, 60].map((d) => `<path d="M${d} 170 q8 20 0 40" stroke="${c.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>
                  <path d="M${400 - d} 170 q-8 20 0 40" stroke="${c.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('');
      }
      const teeth = [];
      const dirts = [];
      for (let i = 0; i < 8; i++) {
        const upper = i < 4;
        const x = toothX(i % 4);
        teeth.push(tooth(k, x, upper));
        if (dirty.includes(i)) dirts.push(dirt(x + TOOTH_W / 2, upper ? UP_Y + 22 : LOW_Y + 26, i));
      }
      return `<svg viewBox="0 0 ${VB_W} ${VB_H}" class="shape-svg brush-svg"><g class="brush-body">
        ${top}
        <ellipse cx="200" cy="190" rx="188" ry="126" fill="${c.color}"/>
        <ellipse cx="200" cy="300" rx="120" ry="16" fill="${c.dark}" opacity=".35"/>
        ${extra}
        <circle cx="62" cy="215" r="17" fill="#ff8fab" opacity=".55"/><circle cx="338" cy="215" r="17" fill="#ff8fab" opacity=".55"/>
        <g class="eyes">${eyes}</g>
        <g class="brush-happy-eyes">
          <path d="M${k === 'shark' ? '98 106 Q112 90 126 106' : '120 76 Q140 54 160 76'}" stroke="#222" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path d="M${k === 'shark' ? '274 106 Q288 90 302 106' : '240 76 Q260 54 280 76'}" stroke="#222" stroke-width="7" fill="none" stroke-linecap="round"/>
        </g>
        <clipPath id="${id}"><rect x="85" y="130" width="230" height="140" rx="55"/></clipPath>
        <rect class="brush-mouth" x="85" y="130" width="230" height="140" rx="55" fill="#7a1f3d"/>
        <g clip-path="url(#${id})">
          <ellipse cx="200" cy="262" rx="88" ry="26" fill="#ff7f9a"/>
          <g class="brush-teeth" fill="#fff" stroke="#e8e0d8" stroke-width="3">${teeth.join('')}</g>
          ${dirts.join('')}
        </g>
      </g></svg>`;
    };

    const toolSVG = `<svg viewBox="0 0 220 70" class="shape-svg">
      <rect x="62" y="27" width="156" height="20" rx="10" fill="#ff6fb5"/>
      <rect x="160" y="31" width="44" height="12" rx="6" fill="#fff" opacity=".45"/>
      <rect x="34" y="31" width="40" height="12" rx="5" fill="#ff6fb5"/>
      <rect x="4" y="28" width="60" height="18" rx="8" fill="#fff" stroke="#e0d6ee" stroke-width="3"/>
      <g class="brush-bristles"><rect x="8" y="6" width="52" height="24" rx="4" fill="#7fd8ff"/>
        ${[16, 26, 36, 46].map((x) => `<line x1="${x}" y1="8" x2="${x}" y2="28" stroke="#4fb8e8" stroke-width="3"/>`).join('')}</g>
      <path d="M12 7 q10 -9 20 -2 q10 -9 22 -1 q4 3 0 6 l-40 0 q-5 -1 -2 -3z" fill="#fff" stroke="#bfe8ff" stroke-width="2"/>
    </svg>`;

    /* ---- the brush follows the finger anywhere on the stage (forgiving for little hands) ---- */
    const tool = h('div', { class: 'brush-tool', html: toolSVG });
    let active = null; // { id, lastX, lastY, dist, foamDist, swishAt }

    const placeTool = (x, y, rot) => {
      const sr = stage.getBoundingClientRect();
      const bx = tool.offsetWidth * (34 / 220);
      const by = tool.offsetHeight * (18 / 70);
      tool.style.transformOrigin = `${bx}px ${by}px`;
      tool.style.transform = `translate(${x - sr.left - bx}px, ${y - sr.top - by}px) rotate(${rot}deg)`;
    };
    const restTool = (animate = true) => {
      tool.classList.remove('active');
      const vmin = Math.min(innerWidth, innerHeight) / 100;
      const x = stage.clientWidth - tool.offsetWidth - 4 * vmin;
      const y = stage.clientHeight - tool.offsetHeight - 5 * vmin;
      tool.style.transition = animate ? 'transform .5s cubic-bezier(.34,1.56,.64,1)' : 'none';
      tool.style.transformOrigin = '';
      tool.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onResize = () => { if (!active) restTool(false); };
    addEventListener('resize', onResize);
    Engine.onExit(() => removeEventListener('resize', onResize));

    const foam = (x, y) => {
      const s = U.rand(10, 26);
      const b = h('div', { class: 'brush-foam', style: { left: x + U.rand(-18, 18) + 'px', top: y + U.rand(-14, 14) + 'px', width: s + 'px', height: s + 'px' } });
      Fx.layer.append(b);
      b.animate(
        [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 },
         { transform: `translate(calc(-50% + ${U.rand(-20, 20)}px), calc(-50% - ${U.rand(20, 60)}px)) scale(1)`, opacity: 0.9, offset: 0.7 },
         { transform: `translate(calc(-50% + ${U.rand(-25, 25)}px), calc(-50% - ${U.rand(50, 80)}px)) scale(1.3)`, opacity: 0 }],
        { duration: U.rand(700, 1100), easing: 'ease-out' },
      ).onfinish = () => b.remove();
    };

    const inRect = (x, y, r, pad = 0) => x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;

    const scrubAt = (x, y, moved) => {
      if (!st || st.done) return;
      const mouthR = st.mouth.getBoundingClientRect();
      const overMouth = inRect(x, y, mouthR, 20);
      if (!overMouth) return;
      active.foamDist += moved;
      if (active.foamDist > 22) { active.foamDist = 0; foam(x, y); }
      const now = performance.now();
      if (now - active.swishAt > 140 && moved > 2) { active.swishAt = now; swish(); }
      let scrubbing = false;
      for (const d of st.dirts) {
        if (d.v <= 0) continue;
        const r = d.el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const rad = Math.max(r.width, r.height) / 2 + 22;
        if (Math.hypot(x - cx, y - cy) > rad) continue;
        scrubbing = true;
        d.v -= moved * 0.008;
        d.el.style.opacity = Math.max(0, d.v).toFixed(2);
        d.el.style.transform = `scale(${(0.55 + 0.45 * Math.max(0, d.v)).toFixed(2)}) rotate(${U.randInt(-8, 8)}deg)`;
        if (d.v <= 0) {
          d.el.remove();
          Fx.burst(cx, cy, ['#ffffff', '#bfefff', '#fff3a8'], 12);
          Sound.good();
          if (--st.left === 0) finish();
        }
      }
      if (scrubbing) {
        st.char.classList.add('giggle');
        clearTimeout(st.giggleT);
        st.giggleT = setTimeout(() => st?.char.classList.remove('giggle'), 260);
      }
    };

    stage.addEventListener('pointerdown', (e) => {
      if (!st || st.done || active || e.target.closest('button')) return;
      e.preventDefault();
      stage.setPointerCapture?.(e.pointerId);
      active = { id: e.pointerId, lastX: e.clientX, lastY: e.clientY, foamDist: 0, swishAt: 0 };
      tool.classList.add('active');
      tool.style.transition = 'transform .12s ease-out';
      placeTool(e.clientX, e.clientY, 18);
      Sound.pick();
    });
    stage.addEventListener('pointermove', (e) => {
      if (!active || e.pointerId !== active.id) return;
      const dx = e.clientX - active.lastX, dy = e.clientY - active.lastY;
      const moved = Math.hypot(dx, dy);
      tool.style.transition = 'none';
      placeTool(e.clientX, e.clientY, 18 + Math.max(-14, Math.min(14, dx * 1.5)));
      active.lastX = e.clientX;
      active.lastY = e.clientY;
      if (moved > 0) scrubAt(e.clientX, e.clientY, moved);
    });
    const end = (e) => {
      if (!active || e.pointerId !== active.id) return;
      active = null;
      restTool();
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);

    const finish = () => {
      st.done = true;
      const c = st.c;
      st.char.classList.remove('giggle');
      st.char.classList.add('clean');
      active = null;
      restTool();
      // twinkles over every tooth
      for (let i = 0; i < 8; i++) {
        const x = (toothX(i % 4) + TOOTH_W / 2) / VB_W * 100;
        const y = (i < 4 ? UP_Y + 20 : LOW_Y + 26) / VB_H * 100;
        st.char.append(h('div', { class: 'brush-twinkle', style: { left: x + '%', top: y + '%', 'animation-delay': i * 90 + 'ms' } }, '✨'));
      }
      Sound.tada();
      Voice.say(`Sparkly clean! The ${c.name} loves it!`);
      Engine.later(() => Reward.round(round), 2000);
    };

    const round = () => {
      stage.replaceChildren();
      ci = (ci + 1) % CHARS.length;
      const c = CHARS[ci];
      const dirty = U.pick([0, 1, 2, 3, 4, 5, 6, 7], U.randInt(6, 7));
      const char = h('div', { class: `brush-char brush-${c.kind}`, html: charSVG(c, dirty) });
      stage.append(char, tool);
      restTool(false);
      st = {
        c, char, done: false, giggleT: 0,
        mouth: char.querySelector('.brush-mouth'),
        dirts: [...char.querySelectorAll('.brush-dirt')].map((el) => ({ el, v: 1 })),
      };
      st.left = st.dirts.length;
      Engine.prompt(`Oh no! The ${c.name} has dirty teeth. Let's brush them!`);
    };

    Engine.onExit(() => { if (st) clearTimeout(st.giggleT); st = null; });
    round();
  },
});
