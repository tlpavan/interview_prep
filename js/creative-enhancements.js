// 🎨 Creative Website Enhancements
// Adds animations, micro-interactions, and polish across all pages

document.addEventListener('DOMContentLoaded', () => {
  // Add loading animation
  document.body.classList.add('loaded');

  // Smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Animate elements on scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });

  // Button ripple effect
  document.querySelectorAll('.btn, button').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple CSS dynamically
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Card hover effects
  document.querySelectorAll('.glass-card, .action-card, .module-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.01)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Stats counter animation
  function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = end;
      }
    };
    requestAnimationFrame(update);
  }

  // Apply to stat values when they come into view
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        const value = parseInt(entry.target.textContent) || 0;
        entry.target.dataset.animated = 'true';
        animateValue(entry.target, 0, value, 1500);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-value, .stat-card-mini > div:first-child').forEach(el => {
    el.dataset.original = el.textContent;
    statObserver.observe(el);
  });

  // Magnetic button effect
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0, 0)';
    });
  });

  // Add dynamic shadow on mouse move
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.glass-card, .action-card');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardX = rect.left + rect.width / 2;
      const cardY = rect.top + rect.height / 2;
      const angleX = (e.clientY - cardY) * 0.01;
      const angleY = (cardX - e.clientX) * 0.01;

      card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(${card.classList.contains('hover') ? '-8px' : '0'})`;
    });
  });

  // Typing animation for hero text
  const heroTitle = document.querySelector('.hero-title, .title-typing');
  if (heroTitle && heroTitle.dataset.typing) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    let i = 0;

    const typeWriter = () => {
      if (i < text.length) {
        heroTitle.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      }
    };

    setTimeout(typeWriter, 500);
  }

  // Form input animations
  document.querySelectorAll('.input-field').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
      this.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.2)';
    });

    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
      this.style.boxShadow = '';
    });
  });

  // Pulse animation for important elements
  const pulseElements = document.querySelectorAll('.pulse');
  pulseElements.forEach(el => {
    el.style.animation = 'pulse 2s infinite';
  });

  // Add pulse CSS if not present
  if (!document.getElementById('pulse-style')) {
    const style = document.createElement('style');
    style.id = 'pulse-style';
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }

  // Loading states for async actions
  window.showLoading = (element = null) => {
    const el = element || document.body;
    el.classList.add('loading');
    el.innerHTML += '<div class="loading-overlay"><div class="spinner"></div></div>';
  };

  window.hideLoading = (element = null) => {
    const el = element || document.body;
    el.classList.remove('loading');
    const overlay = el.querySelector('.loading-overlay');
    if (overlay) overlay.remove();
  };

  // Toast notifications
  window.showToast = (message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#00b894' : type === 'error' ? '#ff8e8e' : '#667eea'};
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      font-weight: 600;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Add toast animations
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  console.log('✨ Creative enhancements loaded!');
});

// Export for use in other modules
window.creativeEnhancements = {
  showToast: (msg, type, duration) => window.showToast(msg, type, duration),
  animateValue: (el, start, end, duration) => {
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
};
