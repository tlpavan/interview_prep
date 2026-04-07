// 🌊 Advanced Scroll Animations & Pop-ups
// Creates stunning scroll-triggered reveals and effects

class ScrollEnhancements {
  constructor() {
    this.init();
  }

  init() {
    this.setupProgressBar();
    this.setupParallax();
    this.setupScrollReveal();
    this.setupFloatingElements();
    this.setupSectionObserver();
    this.setupNavigationTransform();
    this.addScrollTriggeredEffects();
    console.log('🌊 Scroll enhancements initialized');
  }

  // 1. Scroll Progress Bar (top of page)
  setupProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
      z-index: 10000;
      transition: width 0.1s ease-out;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  // 2. Parallax Background Elements
  setupParallax() {
    const parallaxElements = document.querySelectorAll('.parallax, .floating-element');
    if (!parallaxElements.length) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    });
  }

  // 3. Scroll Reveal Animations
  setupScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale, .pop-in'
    );

    if (!revealElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
            entry.target.classList.add('animate-visible');
          }, index * 100); // Stagger effect
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      el.classList.add('reveal-element');
      revealObserver.observe(el);
    });

    // Add CSS for reveals
    const style = document.createElement('style');
    style.textContent = `
      .reveal-element {
        opacity: 0;
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .reveal {
        transform: translateY(60px);
      }

      .reveal-left {
        transform: translateX(-80px);
      }

      .reveal-right {
        transform: translateX(80px);
      }

      .reveal-up {
        transform: translateY(100px);
      }

      .reveal-scale {
        transform: scale(0.8);
      }

      .pop-in {
        transform: scale(0.9) translateY(40px);
      }

      .reveal-element.revealed {
        opacity: 1;
        transform: translate(0) scale(1);
      }

      /* Stagger children */
      .stagger-reveal > * {
        opacity: 0;
        transform: translateY(40px);
        transition: all 0.6s ease-out;
      }

      .stagger-reveal.revealed > *:nth-child(1) { transition-delay: 0.1s; opacity: 1; transform: translateY(0); }
      .stagger-reveal.revealed > *:nth-child(2) { transition-delay: 0.2s; opacity: 1; transform: translateY(0); }
      .stagger-reveal.revealed > *:nth-child(3) { transition-delay: 0.3s; opacity: 1; transform: translateY(0); }
      .stagger-reveal.revealed > *:nth-child(4) { transition-delay: 0.4s; opacity: 1; transform: translateY(0); }
      .stagger-reveal.revealed > *:nth-child(5) { transition-delay: 0.5s; opacity: 1; transform: translateY(0); }
      .stagger-reveal.revealed > *:nth-child(6) { transition-delay: 0.6s; opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);
  }

  // 4. Floating Animation Elements
  setupFloatingElements() {
    // Add floating decorative elements
    const floatContainer = document.createElement('div');
    floatContainer.id = 'floating-decorations';
    floatContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    `;

    const shapes = ['circle', 'square', 'triangle'];
    const colors = [
      'rgba(102, 126, 234, 0.15)',
      'rgba(118, 75, 162, 0.15)',
      'rgba(240, 147, 251, 0.15)',
      'rgba(77, 171, 247, 0.15)'
    ];

    for (let i = 0; i < 12; i++) {
      const shape = document.createElement('div');
      const size = Math.random() * 60 + 20;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];

      shape.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: ${color};
        animation: floatShape ${15 + Math.random() * 10}s infinite ease-in-out;
        animation-delay: ${Math.random() * 5}s;
        border-radius: ${shapeType === 'circle' ? '50%' : shapeType === 'square' ? '8px' : '0'};
        opacity: 0.3;
        transform: rotate(${Math.random() * 360}deg);
      `;

      if (shapeType === 'triangle') {
        shape.style.width = '0';
        shape.style.height = '0';
        shape.style.borderLeft = `${size/2}px solid transparent`;
        shape.style.borderRight = `${size/2}px solid transparent`;
        shape.style.borderBottom = `${size}px solid ${color}`;
        shape.style.background = 'none';
      }

      floatContainer.appendChild(shape);
    }

    document.body.appendChild(floatContainer);

    // Add animation CSS
    if (!document.getElementById('float-shapes-style')) {
      const style = document.createElement('style');
      style.id = 'float-shapes-style';
      style.textContent = `
        @keyframes floatShape {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(50px, -80px) rotate(90deg); }
          50% { transform: translate(30px, 40px) rotate(180deg); }
          75% { transform: translate(-40px, -30px) rotate(270deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 5. Section-based Observer for Nav
  setupSectionObserver() {
    const sections = document.querySelectorAll('section, .section, .glass-card');
    const navLinks = document.querySelectorAll('.nav-link, .dashboard-action');

    if (!sections.length) return;

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id || entry.target.dataset.section;
          if (id) {
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}` || link.dataset.target === `${id}.html`);
            });
          }
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(section => sectionObserver.observe(section));
  }

  // 6. Navigation Transform on Scroll
  setupNavigationTransform() {
    const nav = document.querySelector('.dashboard-nav, .top-nav, header');
    if (!nav) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      // Add/remove scrolled class
      if (currentScroll > 50) {
        nav.classList.add('scrolled');
        nav.style.padding = '0 1.5rem';
        nav.style.background = 'rgba(10, 15, 26, 0.95)';
      } else {
        nav.classList.remove('scrolled');
        nav.style.padding = '0 2rem';
        nav.style.background = 'rgba(10, 15, 26, 0.85)';
      }

      // Hide/show on scroll direction
      if (currentScroll > lastScroll && currentScroll > 200) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }

      lastScroll = currentScroll;
    });

    // Add transition
    nav.style.transition = 'transform 0.3s ease, padding 0.3s ease, background 0.3s ease';
  }

  // 7. Scroll-triggered Effects
  addScrollTriggeredEffects() {
    // Stats counter animation
    const statValues = document.querySelectorAll('.stat-value, .stat-card-mini > div:first-child');
    const valueObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          const target = parseInt(entry.target.dataset.value || entry.target.textContent) || 0;
          this.animateValue(entry.target, 0, target, 2000);
          entry.target.dataset.animated = 'true';
        }
      });
    }, { threshold: 0.5 });

    statValues.forEach(el => {
      if (el.dataset.value) {
        valueObserver.observe(el);
      }
    });

    // Module bars animation
    const bars = document.querySelectorAll('.bar-fill');
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const width = entry.target.style.width;
          entry.target.style.width = '0%';
          setTimeout(() => {
            entry.target.style.width = width;
          }, 200);
        }
      });
    }, { threshold: 0.5 });

    bars.forEach(bar => barObserver.observe(bar));

    // Progress rings animation
    const rings = document.querySelectorAll('.progress-ring__progress');
    const ringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const circle = entry.target;
          const radius = circle.r.baseVal.value;
          const circumference = 2 * Math.PI * radius;
          const targetOffset = circumference - (parseFloat(circle.dataset.progress) || 0) / 100 * circumference;
          circle.style.strokeDasharray = `${circumference} ${circumference}`;
          circle.style.strokeDashoffset = circumference;

          setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1.5s ease-out';
            circle.style.strokeDashoffset = targetOffset;
          }, 300);
        }
      });
    }, { threshold: 0.5 });

    rings.forEach(ring => {
      const percentage = parseFloat(ring.dataset.progress) || 0;
      ring.dataset.progress = percentage;
      ringObserver.observe(ring);
    });
  }

  // Utility: Animate number
  animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ScrollEnhancements());
} else {
  new ScrollEnhancements();
}

// Export for manual use
window.scrollEnhancements = {
  animateValue: (el, start, end, duration) => {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
};
