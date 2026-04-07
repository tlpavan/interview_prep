// 🌟 Auto-Creative - Automatically enhance any page with creative design
// Just add this script to any page to make it look amazing!

(function() {
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhancePage);
  } else {
    enhancePage();
  }

  function enhancePage() {
    console.log('🎨 Auto-creative enhancement starting...');

    // 1. Load creative CSS if not already loaded
    if (!document.getElementById('creative-css')) {
      const link = document.createElement('link');
      link.id = 'creative-css';
      link.rel = 'stylesheet';
      link.href = '/css/style-creative.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('creative-overrides')) {
      const link = document.createElement('link');
      link.id = 'creative-overrides';
      link.rel = 'stylesheet';
      link.href = '/css/creative-overrides.css';
      document.head.appendChild(link);
    }

    // 2. Load creative enhancements JS
    if (!document.getElementById('creative-js')) {
      const script = document.createElement('script');
      script.id = 'creative-js';
      script.src = '/js/creative-enhancements.js';
      script.defer = true;
      document.body.appendChild(script);
    }

    // 3. Apply creative classes to existing elements
    enhanceNavigation();
    enhanceCards();
    enhanceButtons();
    enhanceForms();
    enhanceHero();

    // 4. Add floating particles to body
    addParticles();

    // 5. Add page entrance animation
    document.body.classList.add('page-transition');

    console.log('✨ Creative enhancements applied!');
  }

  function enhanceNavigation() {
    const nav = document.querySelector('header, nav, .top-nav, .dashboard-nav');
    if (nav && !nav.classList.contains('creative-nav-applied')) {
      nav.classList.add('creative-nav', 'glass-card');
      nav.classList.remove('top-nav--bossed'); // Remove old styling
      nav.style.padding = '0 2rem';
      nav.style.display = 'flex';
      nav.style.alignItems = 'center';
      nav.style.justifyContent = 'space-between';
      nav.style.position = 'sticky';
      nav.style.top = '0';
      nav.style.zIndex = '1000';
      nav.classList.add('creative-nav-applied');
    }
  }

  function enhanceCards() {
    const cards = document.querySelectorAll('.glass-card, .module-card, .stack-card, .preview-card, .stat-card, .insight-panel, .workspace-panel');
    cards.forEach((card, i) => {
      if (!card.classList.contains('creative-enhanced')) {
        card.classList.add('creative-card', 'animate-in');
        card.style.animationDelay = `${i * 0.1}s`;
        card.classList.add('creative-enhanced');
      }
    });
  }

  function enhanceButtons() {
    const buttons = document.querySelectorAll('.primary-btn, .ghost-btn, .btn, button:not([type="submit"]), .dashboard-action, .module-card');
    buttons.forEach(btn => {
      if (!btn.classList.contains('creative-btn-applied')) {
        btn.classList.add('creative-btn');
        if (btn.classList.contains('secondary') || btn.classList.contains('ghost-btn')) {
          btn.classList.add('creative-btn-secondary');
        } else {
          btn.classList.remove('secondary', 'ghost-btn');
        }
        btn.classList.add('creative-btn-applied');
      }
    });
  }

  function enhanceForms() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, select');
    inputs.forEach(input => {
      if (!input.classList.contains('creative-input-applied')) {
        input.classList.add('creative-input');
        input.classList.add('creative-input-applied');
      }
    });

    // Enhance form containers
    const fields = document.querySelectorAll('.field, .input-group');
    fields.forEach(field => {
      if (!field.classList.contains('creative-field-applied')) {
        const label = field.querySelector('label, span');
        if (label) {
          label.classList.add('creative-label');
        }
        field.classList.add('creative-field-applied');
      }
    });
  }

  function enhanceHero() {
    const heroes = document.querySelectorAll('.hero-title, h1, .library-hero__title');
    heroes.forEach(hero => {
      if (!hero.classList.contains('creative-hero-applied')) {
        hero.classList.add('creative-gradient-text', 'animate-float');
        hero.classList.add('creative-hero-applied');
      }
    });
  }

  function addParticles() {
    const existing = document.getElementById('creative-particles');
    if (existing) return;

    const container = document.createElement('div');
    container.id = 'creative-particles';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;

    const colors = [
      'rgba(102, 126, 234, 0.4)',
      'rgba(118, 75, 162, 0.4)',
      'rgba(240, 147, 251, 0.4)',
      'rgba(77, 171, 247, 0.4)'
    ];

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 80 + 20;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]} 0%, transparent 70%);
        border-radius: 50%;
        animation: creativeFloat ${15 + Math.random() * 10}s infinite ease-in-out;
        animation-delay: ${Math.random() * 5}s;
        opacity: 0.3;
      `;
      container.appendChild(particle);
    }

    document.body.appendChild(container);

    // Add CSS for float animation
    if (!document.getElementById('creative-particles-style')) {
      const style = document.createElement('style');
      style.id = 'creative-particles-style';
      style.textContent = `
        @keyframes creativeFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(50px, -80px) rotate(120deg); }
          66% { transform: translate(-30px, 40px) rotate(240deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Also enhance dynamically added content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Re-run enhancement on new content
          const newCards = node.querySelectorAll ? node.querySelectorAll('.glass-card, .module-card') : [];
          newCards.forEach((card, i) => {
            if (!card.classList.contains('creative-enhanced')) {
              card.classList.add('creative-card', 'animate-in');
              card.style.animationDelay = `${i * 0.1}s`;
              card.classList.add('creative-enhanced');
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
