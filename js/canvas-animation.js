/**
 * Interactive Particle Constellation & Neural Mesh Canvas
 * Yashasvi Sontakki Portfolio
 */

(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let shockwaves = [];
  let mouse = { x: null, y: null, radius: 150 };

  // Keep the animated background within the pistachio theme.
  function getThemeColors() {
    return {
      particle: 'rgba(197, 222, 168, 0.75)',
      line: '197, 222, 168',
      pulse: 'rgba(220, 239, 195, 0.9)'
    };
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    initParticles();
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1.2;
      this.baseRadius = this.radius;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce at boundary
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse interaction (gentle attraction / swell)
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (1 - dist / mouse.radius) * 1.5;
          this.x += (dx / dist) * force;
          this.y += (dy / dist) * force;
          this.radius = this.baseRadius * 1.6;
        } else {
          this.radius = this.baseRadius;
        }
      }
    }

    draw(colors) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.particle;
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors.particle;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  class Shockwave {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 5;
      this.maxRadius = 180;
      this.opacity = 0.8;
      this.done = false;
    }

    update() {
      this.radius += 5.5;
      this.opacity -= 0.025;
      if (this.opacity <= 0 || this.radius >= this.maxRadius) {
        this.done = true;
      }
    }

    draw(colors) {
      if (this.done) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${colors.line}, ${Math.max(0, this.opacity)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(100, Math.floor((width * height) / 14000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const colors = getThemeColors();

    // Draw connection lines between nearby particles
    const maxDist = 130;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.28;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${colors.line}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Connect to mouse if nearby
    if (mouse.x !== null && mouse.y !== null) {
      for (let i = 0; i < particles.length; i++) {
        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(particles[i].x, particles[i].y);
          ctx.strokeStyle = `rgba(${colors.line}, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw(colors);
    });

    // Update and draw shockwaves
    shockwaves = shockwaves.filter(sw => !sw.done);
    shockwaves.forEach(sw => {
      sw.update();
      sw.draw(colors);
    });

    requestAnimationFrame(animate);
  }

  // Event Listeners
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  window.addEventListener('click', (e) => {
    shockwaves.push(new Shockwave(e.clientX, e.clientY));
  });

  // Initial Launch
  resize();
  animate();
})();
