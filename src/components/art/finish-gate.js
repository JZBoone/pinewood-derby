// <finish-gate> — 3D-printed black finish-gate bridge spanning the full track width, one gate + light per lane,
// drawn in the track's own perspective (lanes recede front→back across the track's top surface).
// Zero-size anchor: position the element where the finish line meets the track's FRONT top edge.
//   <finish-gate lanes="3" dy="-16" slope="0.1" lit="2,3"></finish-gate>
//   dy    = screen offset (px) from the track's front top edge to its back top edge (negative = up). Match the track's top-surface depth.
//   dx    = horizontal part of that offset (0 when the track's ends are drawn vertical, as in production).
//   slope = track drop per px to the right. tall = gate height px. wide = gate depth along the track px. scale = multiplies everything.
// Lane 1 is the front lane (nearest the viewer). API: el.trigger(n), el.reset(), 'lane-finish' event. hold="ms" auto-dims (0 = stay lit).
(() => {
  if (typeof window === 'undefined' || customElements.get('finish-gate')) return;
  const CSS = `
:host{display:block;position:absolute;width:0;height:0;line-height:0;overflow:visible;pointer-events:none}
svg{position:absolute;overflow:visible;display:block}
.glow,.beam,.pool{opacity:0;transition:opacity .6s ease-out}
.bulb{fill:#2a2d33;transition:fill .5s ease-out}
.on .glow,.on .beam,.on .pool{opacity:1;transition:opacity .05s}
.on .bulb{fill:#fff;transition:fill .05s}
.glow{transform-box:fill-box;transform-origin:50% 50%}
.pop{animation:pop .45s cubic-bezier(.2,.8,.3,1)}
@keyframes pop{0%{transform:scale(1.9)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}`;
  const f = v => v.toFixed(2);
  const build = o => {
    const { n, dx, dy, slope, H, hh, t, s } = o;
    const pts = [];
    // a = along the track (px), u = across the track 0 (front edge) .. 1 (back edge), z = height above the track surface
    const P = (a, u, z) => { const X = a + u * dx; const p = [X * s, (-z + u * dy + slope * X) * s]; pts.push(p); return p; };
    const poly = (ps, attr) => `<polygon points="${ps.map(p => f(p[0]) + ',' + f(p[1])).join(' ')}" ${attr}></polygon>`;
    const STROKE = 'stroke="#34373e" stroke-width=".7" stroke-linejoin="round"';
    const C = ['#17181b', '#0e0f11', '#2a2c31'];
    // visible faces: front (u=u0), top (z=z1), and the +a side only when dx > 0
    const box = (a0, a1, u0, u1, z0, z1, c = C) =>
      (dx > 0 ? poly([P(a1, u0, z0), P(a1, u1, z0), P(a1, u1, z1), P(a1, u0, z1)], `fill="${c[1]}" ${STROKE}`) : '') +
      poly([P(a0, u0, z0), P(a1, u0, z0), P(a1, u0, z1), P(a0, u0, z1)], `fill="${c[0]}" ${STROKE}`) +
      poly([P(a0, u0, z1), P(a1, u0, z1), P(a1, u1, z1), P(a0, u1, z1)], `fill="${c[2]}" ${STROKE}`);
    const half = .03, leg = 6;
    const lane = i => ({ uc: (i + .5) / n });
    let out = '';
    for (let i = n - 1; i >= 0; i--) {
      const { uc } = lane(i), w = .16 / n * 3 / 3;
      out += `<g class="lane" data-lane="${i + 1}">${poly([P(-8, uc - w, 0), P(t + 8, uc - w, 0), P(t + 8, uc + w, 0), P(-8, uc + w, 0)], 'class="pool" fill="url(#pool)"')}</g>`;
    }
    for (let k = n; k >= 0; k--) {
      const c = k / n, u0 = Math.max(0, c - half), u1 = Math.min(1, c + half);
      out += box(0, leg, u0, u1, 0, H) + box(t - leg, t, u0, u1, 0, H);
      out += box(-2, leg + 2, u0, u1, 0, 2.2, ['#0f1012', '#0a0b0c', '#1c1d21']) + box(t - leg - 2, t + 2, u0, u1, 0, 2.2, ['#0f1012', '#0a0b0c', '#1c1d21']);
      if (k > 0) {
        const { uc } = lane(k - 1);
        out += `<g class="lane" data-lane="${k}">${poly([P(t / 2 - 3, uc, H), P(t / 2 + 3, uc, H), P(t - leg - 1, uc, 0), P(leg + 1, uc, 0)], 'class="beam" fill="url(#beam)"')}</g>`;
      }
    }
    out += box(-2, t + 2, -half, 1 + half, H, H + hh);
    let layers = '';
    for (let z = H + 1.4; z < H + hh; z += 1.6) { const a = P(-2, -half, z), b = P(t + 2, -half, z); layers += `<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}"></path>`; }
    out += `<g fill="none" stroke="rgba(255,255,255,.055)" stroke-width=".55">${layers}</g>`;
    const fl = P(-2, -half, H + hh), fr = P(t + 2, -half, H + hh);
    out += `<line x1="${f(fl[0] + 2)}" y1="${f(fl[1] + .7)}" x2="${f(fr[0] - 2)}" y2="${f(fr[1] + .7)}" stroke="rgba(255,255,255,.16)" stroke-width=".7" stroke-linecap="round"></line>`;
    const r = Math.min(3.4, Math.abs(dy) / n * .62) * s;
    for (let i = n - 1; i >= 0; i--) {
      const { uc } = lane(i);
      const [cx, cy] = P(t / 2, uc, H + hh);
      out += `<g class="lane" data-lane="${i + 1}">
<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r * 1.45)}" ry="${f(r * .55)}" fill="#111214" stroke="#3b3f47" stroke-width=".6"></ellipse>
<circle class="glow" cx="${f(cx)}" cy="${f(cy - r * .6)}" r="${f(r * 3.4)}" fill="url(#glow)"></circle>
<path class="bulb" d="M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r * 1.05)} 0 0 1 ${f(2 * r)} 0z" stroke="#3b3f47" stroke-width=".5"></path>
<path d="M${f(cx - r * .5)} ${f(cy - r * .4)}a${f(r * .55)} ${f(r * .55)} 0 0 1 ${f(r * .45)} ${f(-r * .45)}" fill="none" stroke="rgba(255,255,255,.45)" stroke-width=".6" stroke-linecap="round"></path></g>`;
    }
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), m = 22 * s;
    const x0 = Math.min(...xs) - m, y0 = Math.min(...ys) - m, w = Math.max(...xs) + m - x0, h = Math.max(...ys) + m - y0;
    return `<svg viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" width="${f(w)}" height="${f(h)}" style="left:${f(x0)}px;top:${f(y0)}px" role="img" aria-label="Finish gates, ${n} lanes">
<defs>
<radialGradient id="glow"><stop offset="0" stop-color="#fff"></stop><stop offset=".28" stop-color="#eef4ff" stop-opacity=".75"></stop><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"></stop></radialGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"></stop><stop offset="1" stop-color="#fff" stop-opacity=".03"></stop></linearGradient>
<radialGradient id="pool"><stop offset="0" stop-color="#fff" stop-opacity=".85"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop></radialGradient>
</defs>${out}</svg>`;
  };
  const num = (el, k, d) => { const v = parseFloat(el.getAttribute(k)); return isFinite(v) ? v : d; };
  class FinishGate extends HTMLElement {
    static get observedAttributes() { return ['lanes', 'lit', 'dx', 'dy', 'slope', 'tall', 'wide', 'scale']; }
    constructor() { super(); this.attachShadow({ mode: 'open' }); this.timers = {}; }
    connectedCallback() { if (!this.rendered) this.render(); }
    attributeChangedCallback(name) { if (!this.isConnected) return; if (name === 'lit' && this.rendered) this.applyLit(); else this.render(); }
    get lanes() { return Math.max(1, Math.min(8, Math.round(num(this, 'lanes', 3)))); }
    render() {
      const o = { n: this.lanes, dx: num(this, 'dx', 0), dy: num(this, 'dy', -16), slope: num(this, 'slope', 0), H: num(this, 'tall', 64), hh: 12, t: num(this, 'wide', 34), s: num(this, 'scale', 1) };
      this.shadowRoot.innerHTML = `<style>${CSS}</style>${build(o)}`;
      this.rendered = true; this.prevLit = []; this.applyLit();
    }
    set(n, on, pop) {
      this.shadowRoot.querySelectorAll(`.lane[data-lane="${n}"]`).forEach(g => {
        g.classList.toggle('on', on);
        const glow = g.querySelector('.glow');
        if (on && pop && glow) { glow.classList.remove('pop'); void glow.getBoundingClientRect(); glow.classList.add('pop'); }
      });
    }
    applyLit() {
      const lit = (this.getAttribute('lit') || '').split(',').map(v => parseInt(v, 10)).filter(Boolean);
      const prev = this.prevLit || [];
      for (let n = 1; n <= this.lanes; n++) this.set(n, lit.includes(n), lit.includes(n) && !prev.includes(n));
      this.prevLit = lit;
    }
    trigger(n) {
      this.set(n, true, true);
      this.dispatchEvent(new CustomEvent('lane-finish', { detail: { lane: n }, bubbles: true }));
      const hold = num(this, 'hold', 0);
      clearTimeout(this.timers[n]);
      if (hold > 0) this.timers[n] = setTimeout(() => this.set(n, false), hold);
    }
    reset() { for (let n = 1; n <= this.lanes; n++) this.set(n, false); this.prevLit = []; }
  }
  customElements.define('finish-gate', FinishGate);
})();

// Marks this file as a module so it can be loaded with import().
export {};
