/* ── GLOBE CANVAS ── */
(function() {
  const canvas = document.getElementById('globe-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy, radius, nodes = [], arcs = [], frame = 0;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cx = W * 0.55;
    cy = H * 0.5;
    radius = Math.min(W, H) * 0.38;
    buildGlobe();
  }

  function buildGlobe() {
    nodes = [];
    // lat/lon grid points
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon < 180; lon += 20) {
        const phi   = (90 - lat) * Math.PI / 180;
        const theta = (lon + 180) * Math.PI / 180;
        nodes.push({ lat, lon, phi, theta, pulse: Math.random() * Math.PI * 2 });
      }
    }

    // hotspot cities
    const cities = [
      { lat: 40.7, lon: -74.0 }, // New York
      { lat: 51.5, lon: -0.1 },  // London
      { lat: 25.2, lon: 55.3 },  // Dubai
      { lat: 1.35, lon: 103.8 }, // Singapore
      { lat: 48.9, lon:  2.3 },  // Paris
      { lat: 35.7, lon: 139.7 }, // Tokyo
      { lat:-33.9, lon: 18.4 },  // Cape Town
      { lat:-23.5, lon:-46.6 },  // São Paulo
    ];

    arcs = [];
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        if (Math.random() < 0.45) {
          arcs.push({ from: cities[i], to: cities[j], progress: Math.random(), speed: 0.002 + Math.random() * 0.003 });
        }
      }
    }
  }

  function project(phi, theta, tilt) {
    // simple spherical projection with Y-axis rotation
    const x0 = Math.sin(phi) * Math.cos(theta);
    const y0 = -Math.cos(phi);
    const z0 = Math.sin(phi) * Math.sin(theta);
    // rotate around Y
    const sinR = Math.sin(tilt), cosR = Math.cos(tilt);
    const x1 = x0 * cosR + z0 * sinR;
    const y1 = y0;
    const z1 = -x0 * sinR + z0 * cosR;
    return { x: cx + x1 * radius, y: cy + y1 * radius, z: z1 };
  }

  function cityProject(lat, lon, tilt) {
    const phi   = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return project(phi, theta, tilt);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const tilt = frame * 0.0015;

    // outer glow
    const grd = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.2);
    grd.addColorStop(0, 'rgba(201,168,76,0.04)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // globe circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // grid dots
    nodes.forEach(n => {
      const p = project(n.phi, n.theta, tilt);
      if (p.z < -0.1) return; // back face cull
      const alpha = 0.15 + p.z * 0.45;
      const pulsed = 0.5 + 0.5 * Math.sin(n.pulse + frame * 0.02);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1 + pulsed * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${alpha * 0.7})`;
      ctx.fill();
    });

    // latitude lines (dashed)
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let first = true;
      for (let lon = -180; lon <= 180; lon += 4) {
        const phi   = (90 - lat) * Math.PI / 180;
        const theta = (lon + 180) * Math.PI / 180;
        const p = project(phi, theta, tilt);
        if (p.z < 0) { first = true; continue; }
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = 'rgba(201,168,76,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // arcs between cities
    arcs.forEach(arc => {
      arc.progress += arc.speed;
      if (arc.progress > 1.4) arc.progress = -0.2;

      const from = cityProject(arc.from.lat, arc.from.lon, tilt);
      const to   = cityProject(arc.to.lat,   arc.to.lon,   tilt);
      if (from.z < 0 || to.z < 0) return;

      // draw moving particle along great circle approximation
      const t = Math.max(0, Math.min(1, arc.progress));
      const px = lerp(from.x, to.x, t);
      const py = lerp(from.y, to.y, t) - Math.sin(t * Math.PI) * 30;

      // trail
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - 30 };
      ctx.quadraticCurveTo(mid.x, mid.y, px, py);
      ctx.strokeStyle = `rgba(201,168,76,0.18)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // particle
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,76,0.85)';
      ctx.fill();

      // city dots
      [from, to].forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,168,76,0.5)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5 + Math.sin(frame * 0.04) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(201,168,76,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    frame++;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* ── FORM SUBMISSION ── */
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const fname   = document.getElementById('fname').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!fname || !email || !message) {
    // simple shake on empty required fields
    [document.getElementById('fname'), document.getElementById('email'), document.getElementById('message')]
      .forEach(el => {
        if (!el.value.trim()) {
          el.style.borderColor = '#c9584c';
          el.addEventListener('input', () => el.style.borderColor = '', { once: true });
        }
      });
    return;
  }

  const btn = this.querySelector('.submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    this.querySelector('.form-grid').style.display = 'none';
    this.querySelector('.submit-row').style.display = 'none';
    const msg = document.getElementById('success-msg');
    msg.classList.add('show');
  }, 1400);
});
