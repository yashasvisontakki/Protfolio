/**
 * Master Portfolio Logic
 * Yashasvi Sontakki Portfolio
 * Handles Navigation, Audio Synthesizer, Typewriter, Tilt, Themes, and Form Submission
 */

// ==========================================================================
// 1. Procedural Web Audio Engine (Pure Synth, Zero External Files)
// ==========================================================================
window.AudioEngine = {
  ctx: null,
  enabled: false,

  init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    } catch (e) {
      console.warn('AudioContext not supported:', e);
    }
  },

  toggle() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = !this.enabled;
    localStorage.setItem('portfolio_audio', this.enabled ? 'true' : 'false');
    this.updateUI();
    if (this.enabled) {
      this.playSuccessChime();
    }
    return this.enabled;
  },

  updateUI() {
    const btn = document.getElementById('btn-sound-toggle');
    if (!btn) return;
    if (this.enabled) {
      btn.classList.add('sound-active');
      btn.title = "Sound Effects: ON (Click to Mute)";
    } else {
      btn.classList.remove('sound-active');
      btn.title = "Sound Effects: OFF (Click to Enable)";
    }
  },

  playBeep(freq = 440, duration = 0.08, type = 'sine') {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },

  playTypingClick() {
    this.playBeep(800 + Math.random() * 400, 0.02, 'triangle');
  },

  playHover() {
    this.playBeep(520, 0.03, 'sine');
  },

  playSuccessChime() {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.05, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch (e) {}
  }
};

// ==========================================================================
// 2. DOM Initialization & Event Handlers
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Audio state restore
  const savedAudio = localStorage.getItem('portfolio_audio');
  if (savedAudio === 'true') {
    window.AudioEngine.enabled = true;
    window.AudioEngine.updateUI();
  }

  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      window.AudioEngine.toggle();
    });
  }

  // Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Theme Switcher (Pistachio Green variations)
  const themeBtn = document.getElementById('btn-theme-toggle');
  const themes = ['pista', 'pista-soft', 'pista-deep'];
  let currentThemeIdx = themes.indexOf(document.body.getAttribute('data-theme'));
  if (currentThemeIdx < 0) currentThemeIdx = 0;

  const savedTheme = localStorage.getItem('portfolio_theme');
  if (savedTheme && themes.includes(savedTheme)) {
    document.body.setAttribute('data-theme', savedTheme);
    currentThemeIdx = themes.indexOf(savedTheme);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      currentThemeIdx = (currentThemeIdx + 1) % themes.length;
      const nextTheme = themes[currentThemeIdx];
      document.body.setAttribute('data-theme', nextTheme);
      localStorage.setItem('portfolio_theme', nextTheme);
      if (window.AudioEngine) window.AudioEngine.playBeep(700, 0.08);
    });
  }

  // Typewriter Loop
  initTypewriter();

  // Custom Cursor
  initCustomCursor();

  // 3D Card Tilt
  init3DTilt();

  // Scroll Animations & Counters
  initScrollObservers();

  // Skills Filtering Tabs
  initSkillsFilter();

  // Hero Code Execution Demo
  initHeroCodeRunner();

  // Contact Form Handling
  initContactForm();

  // Resume Modal Handling
  initResumeModal();

  // Interactive Hover Sounds
  document.querySelectorAll('a, button, .interactive-el').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.AudioEngine) window.AudioEngine.playHover();
    });
  });
});

// ==========================================================================
// 3. Typewriter Effect
// ==========================================================================
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const roles = [
    "Python Full Stack Developer",
    "Django REST API Architect",
    "Machine Learning Integrator",
    "React.js Frontend Engineer",
    "MySQL & Database Specialist"
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let speed = 90;

  function typeStep() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      el.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      speed = 45;
    } else {
      el.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      speed = 90;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      isDeleting = true;
      speed = 1800; // Pause at end of word
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      speed = 400; // Pause before next word
    }

    setTimeout(typeStep, speed);
  }

  typeStep();
}

// ==========================================================================
// 4. Custom Cursor Follower
// ==========================================================================
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(renderFollower);
  }
  renderFollower();

  // Hover expansion on interactive items
  const interactives = document.querySelectorAll('a, button, input, textarea, .term-chip, .tilt-card, .metric-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
}

// ==========================================================================
// 5. 3D Tilt Hover Effect
// ==========================================================================
function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
}

// ==========================================================================
// 6. Scroll Observers (Reveal & Animated Counters)
// ==========================================================================
function initScrollObservers() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');

        // If it's a metric counter, animate numbers
        if (entry.target.classList.contains('metric-card')) {
          animateCounter(entry.target);
        }

        // If it's a skill card, fill progress bar
        if (entry.target.classList.contains('skill-card')) {
          const fill = entry.target.querySelector('.skill-meter-fill');
          if (fill) {
            const targetWidth = fill.getAttribute('data-width') || '85%';
            fill.style.width = targetWidth;
          }
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-on-scroll, .metric-card, .skill-card').forEach(el => {
    observer.observe(el);
  });
}

function animateCounter(card) {
  const numEl = card.querySelector('.metric-num');
  if (!numEl || numEl.dataset.animated) return;
  numEl.dataset.animated = "true";

  const rawVal = numEl.textContent.trim();
  const target = parseFloat(rawVal);
  if (isNaN(target)) return;

  const isDecimal = rawVal.includes('.');
  let count = 0;
  const duration = 1400;
  const steps = 40;
  const increment = target / steps;
  const interval = duration / steps;

  const timer = setInterval(() => {
    count += increment;
    if (count >= target) {
      count = target;
      clearInterval(timer);
    }
    numEl.textContent = isDecimal ? count.toFixed(2) : Math.floor(count);
  }, interval);
}

// ==========================================================================
// 7. Skills Categorization Filter
// ==========================================================================
function initSkillsFilter() {
  const tabBtns = document.querySelectorAll('.skill-tab-btn');
  const cards = document.querySelectorAll('.skill-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || filter === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });

      if (window.AudioEngine) window.AudioEngine.playBeep(560, 0.05);
    });
  });
}

// ==========================================================================
// 8. Hero Code Card Interactive Runner
// ==========================================================================
function initHeroCodeRunner() {
  const runBtn = document.getElementById('btn-run-hero-code');
  const badge = document.getElementById('hero-run-badge');
  if (!runBtn) return;

  runBtn.addEventListener('click', () => {
    if (badge) {
      badge.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Executing Python 3.14...';
      badge.style.color = '#fbbf24';
    }

    if (window.AudioEngine) window.AudioEngine.playTypingClick();

    setTimeout(() => {
      if (badge) {
        badge.innerHTML = '<i class="fas fa-check-circle"></i> Output: 200 OK | Full Stack Ready';
        badge.style.color = '#c5dea8';
      }
      if (window.AudioEngine) window.AudioEngine.playSuccessChime();
    }, 600);
  });
}

// ==========================================================================
// 9. Contact Form AJAX Submission
// ==========================================================================
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('form-status-alert');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-send');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending Message...';

    const payload = {
      name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      subject: document.getElementById('contact-subject').value.trim(),
      message: document.getElementById('contact-message').value.trim()
    };

    try {
      const res = await ApiClient.sendContactMessage(payload);
      if (alertBox) {
        alertBox.className = 'form-status-alert success';
        alertBox.textContent = res.message || 'Message sent successfully! Thank you for connecting.';
      }
      if (!res.needsUserSend) {
        form.reset();
        if (window.AudioEngine) window.AudioEngine.playSuccessChime();
      }
    } catch (err) {
      if (alertBox) {
        alertBox.className = 'form-status-alert error';
        alertBox.textContent = `${err.message || 'Failed to submit message.'} If needed, email directly: yashasvisontakki@gmail.com`;
      }
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

// ==========================================================================
// 10. Resume Modal Viewer
// ==========================================================================
function initResumeModal() {
  const openBtns = document.querySelectorAll('.btn-open-resume');
  const modal = document.getElementById('resume-modal');
  const closeBtn = document.getElementById('btn-close-resume');

  openBtns.forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) {
        modal.classList.add('open');
        if (window.AudioEngine) window.AudioEngine.playBeep(650, 0.06);
      }
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }
}
