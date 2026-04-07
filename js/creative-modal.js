// 🎪 Creative Modals & Pop-ups
// Beautiful animated modals for achievements, milestones, etc.

class CreativeModal {
  constructor() {
    this.createModalStyles();
    this.setupEventListeners();
  }

  createModalStyles() {
    if (document.getElementById('modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .modal-content {
        background: linear-gradient(135deg, rgba(26, 31, 53, 0.95), rgba(10, 15, 26, 0.98));
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 32px;
        padding: 3rem;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.8) translateY(50px);
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(102, 126, 234, 0.2);
        position: relative;
      }

      .modal-overlay.active .modal-content {
        transform: scale(1) translateY(0);
      }

      .modal-close {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: rotate(90deg);
      }

      .modal-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin: 0 auto 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        background: linear-gradient(135deg, #667eea, #764ba2);
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      }

      .modal-title {
        font-size: 1.8rem;
        font-weight: 800;
        text-align: center;
        margin-bottom: 1rem;
        background: linear-gradient(135deg, #fff, #a8b2d1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .modal-message {
        text-align: center;
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      .modal-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin: 2rem 0;
      }

      .modal-stat {
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
      }

      .modal-stat-value {
        display: block;
        font-size: 2rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }

      .modal-stat-label {
        font-size: 0.8rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }

      /* Celebration particles */
      .celebration-particle {
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        pointer-events: none;
        animation: celebrate 1s ease-out forwards;
        z-index: 10001;
      }

      @keyframes celebrate {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--tx), var(--ty)) scale(0);
          opacity: 0;
        }
      }

      /* Modal slide from different directions */
      .modal-overlay.modal-left .modal-content {
        transform: translateX(-100px) scale(0.9);
      }

      .modal-overlay.modal-right .modal-content {
        transform: translateX(100px) scale(0.9);
      }

      .modal-overlay.modal-bottom .modal-content {
        transform: translateY(100px) scale(0.9);
      }

      .modal-overlay.modal-left.active .modal-content,
      .modal-overlay.modal-right.active .modal-content,
      .modal-overlay.modal-bottom.active .modal-content {
        transform: translate(0) scale(1);
      }

      /* Confetti */
      .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        pointer-events: none;
        z-index: 10002;
        animation: confettiFall 3s ease-out forwards;
      }

      @keyframes confettiFall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Close modal on overlay click
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeAll();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAll();
      }
    });
  }

  show(options = {}) {
    const {
      title = 'Notice',
      message = '',
      icon = '🎉',
      type = 'achievement',
      stats = null,
      confirmText = 'Awesome!',
      cancelText = null,
      onConfirm = null,
      onCancel = null,
      direction = 'center'
    } = options;

    // Create modal
    const overlay = document.createElement('div');
    overlay.className = `modal-overlay modal-${direction}`;

    let statsHtml = '';
    if (stats) {
      statsHtml = `
        <div class="modal-stats">
          ${stats.map(stat => `
            <div class="modal-stat">
              <div class="modal-stat-value" style="background: linear-gradient(135deg, ${stat.color1 || '#667eea'}, ${stat.color2 || '#764ba2'}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                ${stat.value}
              </div>
              <div class="modal-stat-label">${stat.label}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    let actionsHtml = `
      <div class="modal-actions">
        <button class="btn btn-primary modal-confirm">${confirmText}</button>
        ${cancelText ? `<button class="btn btn-secondary modal-cancel">${cancelText}</button>` : ''}
      </div>
    `;

    overlay.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">×</button>
        <div class="modal-icon">${icon}</div>
        <h3 class="modal-title">${title}</h3>
        <p class="modal-message">${message}</p>
        ${statsHtml}
        ${actionsHtml}
      </div>
    `;

    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => overlay.classList.add('active'), 10);

    // Event listeners
    const confirmBtn = overlay.querySelector('.modal-confirm');
    const cancelBtn = overlay.querySelector('.modal-cancel');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.close(overlay);
        if (onConfirm) onConfirm();
        this.createConfetti();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.close(overlay);
        if (onCancel) onCancel();
      });
    }

    // Add confetti for achievements
    if (type === 'achievement' || type === 'milestone') {
      setTimeout(() => this.createConfetti(), 300);
    }

    return overlay;
  }

  showAchievement(data) {
    return this.show({
      title: data.title || 'Achievement Unlocked! 🏆',
      message: data.message || 'You\'ve reached a new milestone!',
      icon: data.icon || '🏆',
      type: 'achievement',
      stats: data.stats || [
        { label: 'Score', value: data.score || '100', color1: '#667eea', color2: '#764ba2' },
        { label: ' Sessions', value: data.sessions || '10', color1: '#f093fb', color2: '#f5576c' }
      ],
      confirmText: data.confirmText || 'Awesome!',
      direction: 'bottom'
    });
  }

  showFeedback(data) {
    return this.show({
      title: data.title || 'Interview Complete! 📊',
      message: data.message || 'Great job! Check your detailed feedback.',
      icon: data.icon || '📈',
      type: 'feedback',
      stats: data.stats || [
        { label: 'Confidence', value: data.confidence || '85', color1: '#667eea', color2: '#764ba2' },
        { label: 'Technical', value: data.technical || '78', color1: '#00b894', color2: '#00cec9' },
        { label: 'Communication', value: data.communication || '82', color1: '#f093fb', color2: '#f5576c' }
      ],
      confirmText: 'View Details',
      cancelText: 'Close',
      onConfirm: () => {
        if (data.onViewDetails) data.onViewDetails();
      }
    });
  }

  showMotivation(data) {
    return this.show({
      title: data.title || 'Keep Going! 💪',
      message: data.message || 'You\'re making great progress. Stay consistent!',
      icon: data.icon || '🚀',
      type: 'motivation',
      confirmText: 'Continue Practicing',
      direction: 'bottom'
    });
  }

  close(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }

  closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });
  }

  createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#00b894', '#e17055'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = centerX + 'px';
      confetti.style.top = centerY + 'px';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.setProperty('--tx', (Math.random() - 0.5) * 400 + 'px');
      confetti.style.setProperty('--ty', (Math.random() - 0.5) * 400 + 'px');
      confetti.style.transitionDelay = Math.random() * 0.5 + 's';

      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }
  }

  createParticles(x, y, count = 12) {
    const colors = ['rgba(102, 126, 234, 0.6)', 'rgba(118, 75, 162, 0.6)', 'rgba(240, 147, 251, 0.6)'];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.width = Math.random() * 20 + 10 + 'px';
      particle.style.height = particle.style.width;
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.PI * 2 / count) * i;
      const distance = Math.random() * 100 + 50;
      particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
      particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }
}

// Initialize
const creativeModal = new CreativeModal();
window.creativeModal = creativeModal;

// Auto-show achievement after first session (demo)
window.showAchievementIfReady = () => {
  const sessions = JSON.parse(localStorage.getItem('interview_sessions') || '[]');
  if (sessions.length === 3) {
    creativeModal.showAchievement({
      title: '3 Sessions Complete! 🎉',
      message: 'You\'ve completed 3 practice interviews. Keep building that momentum!',
      score: Math.round(sessions.reduce((acc, s) => acc + (s.feedback?.technical || 0), 0) / 3),
      sessions: 3
    });
  }

  if (sessions.length === 10) {
    creativeModal.showAchievement({
      title: 'Interview Pro! 🌟',
      message: 'You\'ve completed 10 interviews. You\'re ready for the real thing!',
      icon: '⭐',
      score: Math.round(sessions.reduce((acc, s) => acc + (s.feedback?.technical || 0), 0) / 10),
      sessions: 10
    });
  }

  if (sessions.length >= 1 && sessions[sessions.length - 1].feedback?.technical >= 80) {
    creativeModal.showMotivation({
      title: 'Outstanding Score! 🚀',
      message: 'You scored 80+ on technical. That\'s interview-ready level!'
    });
  }
};

// Check on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(showAchievementIfReady, 2000);
});

console.log('🎪 Creative modal system loaded');
