// <tent-scout> — blue tent; click/tap/Enter on the door and a Cub Scout pops out and fires a slingshot pebble at the viewer.
// Zero dependencies. Usage: import once (client side), then <tent-scout></tent-scout>. Size with CSS: tent-scout{--tent-width:190px}
(() => {
  if (typeof window === 'undefined' || customElements.get('tent-scout')) return;
  const clamp = v => Math.max(0, Math.min(1, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const eo = x => 1 - Math.pow(1 - x, 3), ei = x => x * x * x;
  const eio = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const back = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const NAVY = '#15214a', SKIN = '#f2c69b', WOOD = '#7a4e2a';
  const DOOR = 'M100 5L71 131h58z';
  const TPL = `
<style>
:host{display:inline-block;width:var(--tent-width,190px);line-height:0;-webkit-tap-highlight-color:transparent}
svg{width:100%;height:auto;display:block;overflow:visible}
#door{cursor:pointer;outline:none}
#door:hover #flapL,#door:hover #flapR{fill:#ecb93a}
#door:focus-visible #hit{stroke:#fff;stroke-width:2.5}
:host([busy]) #door{cursor:default}
</style>
<svg viewBox="0 0 200 136" role="img" aria-label="Blue tent">
<defs><clipPath id="ground"><rect x="0" y="-80" width="200" height="211"></rect></clipPath></defs>
<path d="M5 131L100 5l95 126z" fill="#1f3a80"></path>
<path d="${DOOR}" fill="#0c1638"></path>
<g clip-path="url(#ground)"><g id="scout">
  <rect x="91" y="117" width="7.5" height="15" rx="2" fill="#1a2b5c" stroke="${NAVY}" stroke-width="1.5"></rect>
  <rect x="101.5" y="117" width="7.5" height="15" rx="2" fill="#1a2b5c" stroke="${NAVY}" stroke-width="1.5"></rect>
  <path d="M86 121V104a10 10 0 0 1 10-10h8a10 10 0 0 1 10 10v17z" fill="#3b5aa6" stroke="${NAVY}" stroke-width="2"></path>
  <rect x="86" y="116.5" width="28" height="4" fill="${NAVY}"></rect><rect x="98" y="116" width="4" height="5" rx="1" fill="#f5b919"></rect>
  <path d="M91.5 94h17L100 109z" fill="#f5b919" stroke="${NAVY}" stroke-width="1.5" stroke-linejoin="round"></path>
  <circle cx="100" cy="98.5" r="2.2" fill="#c62232"></circle>
  <circle cx="100" cy="84" r="10" fill="${SKIN}" stroke="${NAVY}" stroke-width="2"></circle>
  <circle cx="94" cy="89" r="1.8" fill="#f09a8a" opacity=".6"></circle><circle cx="106" cy="89" r="1.8" fill="#f09a8a" opacity=".6"></circle>
  <path d="M89.5 81.5a10.5 10.5 0 0 1 21 0z" fill="#1a2b5c" stroke="${NAVY}" stroke-width="2" stroke-linejoin="round"></path>
  <rect x="87" y="80" width="26" height="3.6" rx="1.8" fill="#f5b919" stroke="${NAVY}" stroke-width="1.5"></rect>
  <ellipse id="eyeL" cx="96" cy="86.5" rx="1.3" ry="1.4" fill="${NAVY}"></ellipse>
  <ellipse id="eyeR" cx="104" cy="86.5" rx="1.3" ry="1.4" fill="${NAVY}"></ellipse>
  <path id="mouth" d="" fill="none" stroke="${NAVY}" stroke-width="1.4" stroke-linecap="round"></path>
  <line id="armL" stroke="#3b5aa6" stroke-width="5.5" stroke-linecap="round"></line>
  <line id="armR" stroke="#3b5aa6" stroke-width="5.5" stroke-linecap="round"></line>
  <path id="fork" fill="none" stroke="${WOOD}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"></path>
  <path id="bands" fill="none" stroke="#c62232" stroke-width="1.1"></path>
  <circle id="pebble" r="2.3" fill="#8a857c" stroke="#5d584f" stroke-width=".8"></circle>
  <circle id="handL" r="2.8" fill="${SKIN}" stroke="${NAVY}" stroke-width="1.2"></circle>
  <circle id="handR" r="2.8" fill="${SKIN}" stroke="${NAVY}" stroke-width="1.2"></circle>
</g></g>
<g id="door" tabindex="0" role="button" aria-label="Knock on the tent door">
  <title>Knock knock</title>
  <path id="hit" d="${DOOR}" fill="transparent"></path>
  <path id="flapL" d="M100 5L71 131h29z" fill="#e0aa28"></path>
  <path id="flapR" d="M100 5v126h29z" fill="#d49e20"></path>
</g>
<path d="M5 131L100 5l95 126z" fill="none" stroke="${NAVY}" stroke-width="4" stroke-linejoin="round"></path>
</svg>`;

  let overlay;
  const getOverlay = () => {
    if (overlay && overlay.isConnected) return overlay;
    overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden';
    document.body.appendChild(overlay);
    return overlay;
  };
  const burstSVG = () => {
    const pts = [];
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 62 : 108 + (i % 4 ? 0 : 14); pts.push(`${150 + Math.cos(a) * r},${150 + Math.sin(a) * r}`); }
    const cracks = [[150, 150, 18, 40], [150, 150, 286, 112], [150, 150, 230, 290], [150, 150, 40, 250], [150, 150, 110, 6], [150, 150, 296, 214]]
      .map(([x1, y1, x2, y2]) => { const mx = (x1 + x2) / 2 + (y2 - y1) * .12, my = (y1 + y2) / 2 - (x2 - x1) * .12; return `M${x1} ${y1}L${mx} ${my}L${x2} ${y2}`; }).join('');
    return `<svg width="300" height="300" viewBox="0 0 300 300" style="overflow:visible">
<path d="${cracks}" fill="none" stroke="rgba(21,33,74,.45)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
<path d="${cracks}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
<polygon points="${pts.join(' ')}" fill="#f5b919" stroke="${NAVY}" stroke-width="7" stroke-linejoin="round"></polygon>
<text x="150" y="166" text-anchor="middle" style="font-family:var(--font-heading),'Arial Black',system-ui,sans-serif" font-weight="800" font-size="46" font-stretch="125%" fill="#c62232" stroke="${NAVY}" stroke-width="2" paint-order="stroke" transform="rotate(-8 150 150)">BONK!</text>
</svg>`;
  };

  class TentScout extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = TPL;
      this.svg = root.querySelector('svg');
      this.$ = id => root.getElementById(id);
      this.door = this.$('door');
      this.run = this.run.bind(this);
      this.door.addEventListener('click', this.run);
      this.door.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.run(); } });
      this.draw(0, true);
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); }
    run() {
      if (this.busy) return;
      this.busy = true; this.setAttribute('busy', '');
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.fired = false;
      const t0 = performance.now(), END = this.reduced ? 1800 : 3300;
      const tick = now => {
        const t = now - t0;
        this.draw(Math.min(t, END));
        if (t < END) this.raf = requestAnimationFrame(tick);
        else { this.busy = false; this.removeAttribute('busy'); }
      };
      this.raf = requestAnimationFrame(tick);
    }
    draw(t, idle) {
      const $ = this.$;
      let flap, rise, aim = 0, pull = 0, snap = 0, hop = 0, grin = 0, loaded = false;
      if (idle) { flap = 0; rise = 0; }
      else if (this.reduced) { flap = t < 1600 ? 1 : 0; rise = flap; grin = 1; }
      else {
        flap = eo(seg(t, 0, 280)) * (1 - eio(seg(t, 2950, 3250)));
        rise = back(seg(t, 220, 720)) * (1 - ei(seg(t, 2650, 3000)));
        aim = eio(seg(t, 780, 1120)) * (1 - eio(seg(t, 2250, 2550)));
        pull = t < 1560 ? eio(seg(t, 1150, 1520)) : 0;
        const r = seg(t, 1560, 1780);
        snap = t >= 1560 ? (r >= 1 ? 1 : 1 - Math.cos(r * Math.PI * 2.5) * Math.pow(1 - r, 2)) : 0;
        loaded = aim > .4 && t < 1560;
        grin = t > 1700 ? 1 : 0;
        const h = seg(t, 1950, 2450); hop = Math.abs(Math.sin(h * Math.PI * 2)) * 3.5 * (1 - h);
      }
      // flaps tie back toward the door edges
      const fk = 1 - .86 * flap;
      $('flapL').setAttribute('transform', `translate(71 131) scale(${fk} 1) translate(-71 -131)`);
      $('flapR').setAttribute('transform', `translate(129 131) scale(${fk} 1) translate(-129 -131)`);
      $('scout').setAttribute('transform', `translate(0 ${80 * (1 - rise) - hop}) translate(100 131) scale(1.25) translate(-100 -131)`);
      // slingshot geometry
      const oy = 16 * (1 - aim);
      const S = [112, 103 + oy], C = [112, 95 + oy], L = [107.5, 86 + oy], R = [116.5, 86 + oy];
      const P0 = [112, 89 + oy], P1 = [104.5, 91];
      let P;
      if (pull > 0) P = [lerp(P0[0], P1[0], pull), lerp(P0[1], P1[1], pull)];
      else if (snap > 0) P = [lerp(P1[0], P0[0], snap), lerp(P1[1], P0[1], snap)];
      else P = P0;
      $('fork').setAttribute('d', `M${S[0]} ${S[1]}L${C[0]} ${C[1]}L${L[0]} ${L[1]}M${C[0]} ${C[1]}L${R[0]} ${R[1]}`);
      $('bands').setAttribute('d', `M${L[0]} ${L[1]}L${P[0]} ${P[1]}L${R[0]} ${R[1]}`);
      const hangL = [88, 113], hL = [lerp(hangL[0], P[0], aim), lerp(hangL[1], P[1], aim)];
      const hR = [S[0], S[1] - 3];
      $('armL').setAttribute('x1', 90); $('armL').setAttribute('y1', 99); $('armL').setAttribute('x2', hL[0]); $('armL').setAttribute('y2', hL[1]);
      $('armR').setAttribute('x1', 110); $('armR').setAttribute('y1', 99); $('armR').setAttribute('x2', hR[0]); $('armR').setAttribute('y2', hR[1]);
      $('handL').setAttribute('cx', hL[0]); $('handL').setAttribute('cy', hL[1]);
      $('handR').setAttribute('cx', hR[0]); $('handR').setAttribute('cy', hR[1]);
      const sling = this.reduced ? 0 : 1;
      ['fork', 'bands', 'handR', 'armR'].forEach(id => $(id).style.opacity = sling);
      $('pebble').setAttribute('cx', P[0]); $('pebble').setAttribute('cy', P[1]);
      $('pebble').style.opacity = loaded ? 1 : 0;
      $('eyeR').setAttribute('ry', lerp(1.4, .25, pull));
      $('mouth').setAttribute('d', grin ? 'M95 89.5q5 5 10 0z' : pull > .3 ? 'M97 91.5h5' : 'M96.5 90.5q3.5 2.6 7 0');
      $('mouth').setAttribute('fill', grin ? '#fff' : 'none');
      if (!idle && !this.reduced && t >= 1560 && !this.fired) { this.fired = true; this.launch(P1); }
    }
    launch([px, py]) {
      const ctm = this.$('scout').getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(px, py).matrixTransform(ctm);
      const ov = getOverlay();
      const cx = innerWidth / 2, cy = innerHeight / 2;
      const peb = document.createElement('div');
      peb.style.cssText = 'position:absolute;left:0;top:0;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e2ddd2,#8a857c 55%,#4f4a42);box-shadow:0 3px 8px rgba(0,0,0,.35)';
      ov.appendChild(peb);
      const fly = peb.animate([
        { transform: `translate(${p.x}px,${p.y}px) scale(1)` },
        { transform: `translate(${lerp(p.x, cx, .5)}px,${Math.min(p.y, cy) - 80}px) scale(3.5) rotate(200deg)`, offset: .5 },
        { transform: `translate(${cx}px,${cy}px) scale(15) rotate(400deg)` }
      ], { duration: 520, easing: 'cubic-bezier(.4,0,.95,.55)', fill: 'forwards' });
      fly.onfinish = () => { peb.remove(); this.bonk(ov, cx, cy); };
    }
    bonk(ov, cx, cy) {
      const b = document.createElement('div');
      b.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:300px;height:300px;margin:-150px 0 0 -150px`;
      b.innerHTML = burstSVG();
      ov.appendChild(b);
      b.animate([
        { transform: 'scale(.2) rotate(-14deg)', opacity: 0 },
        { transform: 'scale(1.18) rotate(5deg)', opacity: 1, offset: .14 },
        { transform: 'scale(.96) rotate(-3deg) translateX(-6px)', offset: .24 },
        { transform: 'scale(1.02) rotate(1deg) translateX(5px)', offset: .32 },
        { transform: 'scale(1) rotate(0)', opacity: 1, offset: .75 },
        { transform: 'scale(.92)', opacity: 0 }
      ], { duration: 1400, easing: 'ease-out', fill: 'forwards' }).onfinish = () => b.remove();
    }
  }
  customElements.define('tent-scout', TentScout);
})();
