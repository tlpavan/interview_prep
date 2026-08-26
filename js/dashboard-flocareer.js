// 🎯 FLOCAREER DASHBOARD - Main Controller
// Handles data loading, UI updates, chatbot, and interactions

import toast from './toast-notifications.js';
import { LoadingSpinner } from './toast-notifications.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing FloCareer Dashboard...');

  // Show initial loading
  const loadingSpinner = LoadingSpinner.show({
    text: 'Loading dashboard...',
    size: 'medium'
  });

  try {
    // Initialize all components
    await initializeUser();
    await loadDashboardData();
    initializeScrollReveal();
    initializeNavigation();
    initializeChatbot();
    initializeModals();
    initializeEventListeners();
    initializeQuickSearch();

    console.log('✅ Dashboard ready!');
    toast.success('Welcome back! Your dashboard is ready.');
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    toast.error('Failed to load dashboard. Please refresh the page.');
  } finally {
    LoadingSpinner.hide(loadingSpinner);
  }
});

// ===== USER INITIALIZATION =====
async function initializeUser() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userData.displayName || userData.email?.split('@')[0] || 'User';
  const userEmail = userData.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  // Update UI
  document.getElementById('userGreeting').textContent = userName;
  document.getElementById('userName').textContent = userName;
  document.getElementById('userEmail').textContent = userEmail;
  document.getElementById('userAvatar').textContent = userInitial;

  return userData;
}

// ===== LOAD DASHBOARD DATA =====
async function loadDashboardData() {
  try {
    // Show loading state for main sections
    const mainContent = document.querySelector('.main-content');
    const sections = mainContent?.querySelectorAll('section');
    if (sections) {
      sections.forEach(section => {
        section.classList.add('loading');
      });
    }

    // Import API functions
    const { apiFetch } = await import('./api-base.js');

    // Fetch user data with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const [sessionsRes, profileRes] = await Promise.all([
      Promise.race([apiFetch('/api/interview/sessions?limit=20'), timeoutPromise]),
      Promise.race([apiFetch('/api/interview/profile-summary'), timeoutPromise])
    ]);

    const [sessionsData, profileData] = await Promise.all([
      sessionsRes?.json?.() || Promise.resolve({}),
      profileRes?.json?.() || Promise.resolve({})
    ]);

    // Remove loading states
    if (sections) {
      sections.forEach(section => {
        section.classList.remove('loading');
      });
    }

    const sessions = Array.isArray(sessionsData?.sessions) ? sessionsData.sessions : [];
    const summary = profileData?.summary || {};

    // Update all dashboard components
    updateOverviewStats(sessions, summary);
    updateModuleProgress(summary);
    updateScoreSection(summary);
    updatePerformanceSection(sessions);
    loadJobOpenings();

    toast.success(`Loaded ${sessions.length} past session${sessions.length !== 1 ? 's' : ''}`);

  } catch (error) {
    console.error('Dashboard data loading error:', error);
    toast.error(`Failed to load dashboard: ${error.message || 'Unknown error'}. Please refresh.`);

    // Show retry button
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 3rem; margin-bottom: 20px;">😟</div>
          <h3>Something went wrong</h3>
          <p style="color: #6b7280; margin: 10px 0 20px;">${error.message || 'Failed to load dashboard data'}</p>
          <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        </div>
      `;
    }
  }
}

// ===== UPDATE OVERVIEW STATS =====
function updateOverviewStats(sessions, summary) {
  // Calculate stats
  const totalSessions = sessions.length;
  const scores = sessions.map(s => {
    const fb = s.feedback || {};
    return clamp(
      ((fb.confidence || 0) +
        (fb.vocabulary || 0) +
        (fb.technical || 0) +
        (fb.communication || 0)) / 4
    );
  });

  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  // Calculate streak
  const streak = calculateStreak(sessions);

  // Animate counters
  animateCounter(document.getElementById('totalSessions'), totalSessions, 1500);
  animateCounter(document.getElementById('currentStreak'), streak, 1500);

  // Update other stats
  document.getElementById('avgScore').textContent = `${avgScore}%`;
  document.getElementById('bestScore').textContent = `${bestScore}%`;

  // Update trends (mock)
  document.getElementById('sessionsTrend').textContent = `+${Math.max(0, totalSessions - 5)} this week`;
  document.getElementById('streakTrend').textContent = streak > 0 ? 'Keep it up! 🔥' : 'Start your streak!';
}

function calculateStreak(sessions) {
  if (!sessions.length) return 0;

  const dates = sessions
    .map(s => s.createdAt?.split('T')[0])
    .filter(Boolean)
    .sort()
    .reverse();

  if (!dates.length) return 0;

  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let current = new Date();

  for (let i = 0; i < dates.length; i++) {
    const dateStr = current.toISOString().split('T')[0];
    if (dates.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ===== UPDATE MODULE PROGRESS =====
function updateModuleProgress(summary) {
  const modules = [
    { key: 'technical', progressId: 'techProgress', textId: 'techProgressText' },
    { key: 'hr', progressId: 'hrProgress', textId: 'hrProgressText' },
    { key: 'dsa', progressId: 'dsaProgress', textId: 'dsaProgressText' },
    { key: 'resume', progressId: 'resumeProgress', textId: 'resumeProgressText' },
    { key: 'career', progressId: 'careerProgress', textId: 'careerProgressText' },
    { key: 'library', progressId: 'libraryProgress', textId: 'libraryProgressText' }
  ];

  modules.forEach(module => {
    const score = clamp(summary[module.key] || 0);
    const progressBar = document.getElementById(module.progressId);
    const progressText = document.getElementById(module.textId);

    if (progressBar) {
      progressBar.setAttribute('data-progress', score);
      setTimeout(() => {
        progressBar.style.width = `${score}%`;
      }, 300);
    }

    if (progressText) {
      animateCounterText(progressText, score, `${score}% Complete`);
    }
  });
}

// ===== UPDATE SCORE SECTION =====
function updateScoreSection(summary) {
  // Calculate overall average
  const moduleScores = ['technical', 'hr', 'resume', 'career']
    .map(m => summary[m] || 0);
  const overallScore = moduleScores.length
    ? Math.round(moduleScores.reduce((a, b) => a + b, 0) / moduleScores.length)
    : 0;

  // Animate overall score ring
  const circumference = 2 * Math.PI * 90; // radius 90
  const offset = circumference - (overallScore / 100) * circumference;
  const ring = document.getElementById('overallScoreRing');

  if (ring) {
    ring.style.strokeDashoffset = circumference;
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
    }, 500);
  }

  // Animate score number
  const scoreEl = document.getElementById('overallScore');
  if (scoreEl) {
    animateCounter(scoreEl, overallScore, 2000);
    setTimeout(() => {
      scoreEl.textContent = overallScore;
    }, 2000);
  }

  // Update individual module scores
  [
    { key: 'technical', valueId: 'techScoreValue', progressId: 'techMiniProgress' },
    { key: 'hr', valueId: 'hrScoreValue', progressId: 'hrMiniProgress' },
    { key: 'resume', valueId: 'resumeScoreValue', progressId: 'resumeMiniProgress' },
    { key: 'career', valueId: 'careerScoreValue', progressId: 'careerMiniProgress' }
  ].forEach((module, index) => {
    const score = clamp(summary[module.key] || 0);
    const valueEl = document.getElementById(module.valueId);
    const miniProgress = document.getElementById(module.progressId);

    if (valueEl) {
      setTimeout(() => {
        animateCounterText(valueEl, score, `${score}%`);
      }, 600 + index * 200);
    }

    if (miniProgress) {
      setTimeout(() => {
        miniProgress.style.width = `${score}%`;
      }, 600 + index * 200);
    }
  });
}

// ===== UPDATE PERFORMANCE SECTION =====
function updatePerformanceSection(sessions) {
  const container = document.getElementById('recentSessionsList');

  if (sessions.length === 0) {
    container.innerHTML = '<div class="empty-message">No sessions yet. Start practicing to see your progress!</div>';
    document.getElementById('skillsChart').innerHTML = '<div class="chart-placeholder">Complete more sessions to see your skill breakdown</div>';
    return;
  }

  // Recent sessions
  container.innerHTML = sessions.slice(0, 5).map(session => {
    const score = clamp(
      (session.feedback?.confidence || 0 +
       session.feedback?.vocabulary || 0 +
       session.feedback?.technical || 0 +
       session.feedback?.communication || 0) / 4
    );
    const date = new Date(session.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="session-item">
        <div class="session-header">
          <div class="session-type">${session.type === 'technical' ? '💻 Technical' : '👔 HR'} Interview</div>
          <div class="session-date">${date}</div>
        </div>
        <div class="session-score">${score}%</div>
      </div>
    `;
  }).join('');

  // Skills chart (simple visualization)
  updateSkillsChart(sessions);
}

function updateSkillsChart(sessions) {
  const chartContainer = document.getElementById('skillsChart');
  const skills = ['technical', 'communication', 'confidence', 'vocabulary'];

  const skillScores = skills.map(skill => {
    const values = sessions.map(s => s.feedback?.[skill] || 0);
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  });

  const maxScore = Math.max(...skillScores, 1);

  chartContainer.innerHTML = `
    <div class="skills-bar-chart">
      ${skills.map((skill, i) => `
        <div class="skill-bar-item">
          <div class="skill-bar-label">
            <span>${skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
            <span>${skillScores[i]}%</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" style="width: ${(skillScores[i] / maxScore) * 100}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Add CSS for skill bars dynamically
  if (!document.getElementById('skill-bar-styles')) {
    const styles = document.createElement('style');
    styles.id = 'skill-bar-styles';
    styles.textContent = `
      .skills-bar-chart {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .skill-bar-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .skill-bar-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        font-weight: 600;
      }
      .skill-bar-track {
        height: 12px;
        background: var(--bg-tertiary);
        border-radius: 999px;
        overflow: hidden;
      }
      .skill-bar-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--primary-light), var(--primary));
        transition: width 1s ease-out;
      }
    `;
    document.head.appendChild(styles);
  }
}

// ===== LOAD JOB OPENINGS (Mock Data) =====
function loadJobOpenings() {
  console.log("🔍 [JOBS] Loading job openings...");

  // Mock job data - in production, this would come from an API
  const mockOpenings = [
    {
      company: 'TechCorp Inc.',
      role: 'Senior Frontend Developer',
      type: 'Full-time',
      location: 'Remote / Bengaluru',
      description: 'Looking for experienced frontend developers with strong React and TypeScript skills. Salary: ₹25-40 LPA',
      badge: 'New'
    },
    {
      company: 'DataFlow Analytics',
      role: 'Full Stack Engineer',
      type: 'Full-time',
      location: 'Hybrid / Mumbai',
      description: 'Build scalable data platforms. Requires Python, React, and cloud experience. Salary: ₹22-35 LPA',
      badge: 'Hot'
    },
    {
      company: 'InnovateTech',
      role: 'Backend Developer',
      type: 'Contract',
      location: 'Remote',
      description: 'Node.js and PostgreSQL experts needed for 6-month project. Rate: ₹1500-2500/hr',
      badge: 'Contract'
    },
    {
      company: 'CloudScale Systems',
      role: 'DevOps Engineer',
      type: 'Full-time',
      location: 'On-site / Pune',
      description: 'AWS, Kubernetes, and Terraform skills required. Salary: ₹20-32 LPA',
      badge: 'Featured'
    },
    {
      company: 'StartupX',
      role: 'Full Stack Developer',
      type: 'Full-time',
      location: 'Remote',
      description: 'Early-stage startup looking for MERN stack developers. Equity + salary. CTC: ₹18-28 LPA',
      badge: 'Startup'
    },
    {
      company: 'GlobalTech',
      role: 'Software Engineer',
      type: 'Full-time',
      location: 'On-site / Delhi NCR',
      description: 'Fresh graduates welcome! Training program for new college pass-outs. Salary: ₹8-12 LPA',
      badge: 'Entry Level'
    }
  ];

  const grid = document.getElementById('openingsGrid');

  if (!grid) {
    console.error("❌ [JOBS] openingsGrid element not found!");
    return;
  }

  console.log(`✅ [JOBS] Found openingsGrid element, loading ${mockOpenings.length} jobs...`);

  // Build HTML
  const jobsHTML = mockOpenings.map(job => `
    <a href="https://www.linkedin.com/jobs/" target="_blank" rel="noopener noreferrer" class="opening-card">
      <div class="opening-header">
        <div>
          <div class="opening-company">${job.company}</div>
          <div class="opening-role">${job.role}</div>
        </div>
        <span class="opening-badge">${job.badge}</span>
      </div>
      <p class="opening-description">${job.description}</p>
      <div class="opening-meta">
        <span class="opening-meta-item">📍 ${job.location}</span>
        <span class="opening-meta-item">💼 ${job.type}</span>
      </div>
    </a>
  `).join('');

  // In production, replace with actual API call
  setTimeout(() => {
    try {
      grid.innerHTML = jobsHTML;
      console.log(`✅ [JOBS] Successfully loaded ${mockOpenings.length} job openings`);
    } catch (error) {
      console.error("❌ [JOBS] Error rendering jobs:", error);
      grid.innerHTML = `<div class="error-message">Failed to load job openings. Please refresh.</div>`;
    }
  }, 500); // Reduced from 1000ms for faster loading
}

// ===== CHATBOT =====
const chatbotFAQ = [
  {
    q: 'How do I start practicing?',
    a: 'Great question! Just click on any module card above (Technical, HR, DSA, etc.) to begin your practice session. Each module will guide you through the setup.'
  },
  {
    q: 'How is my score calculated?',
    a: 'Your score is based on AI feedback from multiple factors: communication clarity, technical accuracy, confidence level, and vocabulary usage. Each session gives you a detailed breakdown.'
  },
  {
    q: 'What modules are available?',
    a: 'We offer 6 modules: Technical Interviews (coding, system design), HR Interviews (behavioral), DSA Practice (coding problems), Resume Analyzer, Career Roadmap, and Prep Library.'
  },
  {
    q: 'How do I track my progress?',
    a: 'Your dashboard shows your overall progress, module-wise scores, and recent sessions. Check the "Performance" section for detailed insights and trends.'
  },
  {
    q: 'Can I practice with voice?',
    a: 'Yes! Our platform supports voice-based interviews. You can answer questions using your microphone, and our AI will transcribe and evaluate your responses.'
  },
  {
    q: 'How is my data stored?',
    a: 'Your data is stored privately for your account through the backend application. Interview sessions, scores, resume insights, and roadmap activity stay tied to your login and are not shared.'
  }
];

function initializeChatbot() {
  const toggleBtn = document.getElementById('chatbotToggle');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatInput = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSend');
  const faqButtons = document.querySelectorAll('.faq-btn');

  // Toggle chatbot
  toggleBtn.addEventListener('click', () => {
    const isHidden = chatbotWindow.classList.contains('hidden');
    if (isHidden) {
      chatbotWindow.classList.remove('hidden');
    } else {
      chatbotWindow.classList.add('hidden');
    }
  });

  // Send message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatInput.value = '';

    // Find answer in FAQ
    const answer = findAnswer(message);
    setTimeout(() => {
      addMessage(answer, 'bot');
    }, 500);
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // FAQ buttons
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.getAttribute('data-question');
      chatInput.value = question;
      sendMessage();
    });
  });
}

function addMessage(text, sender) {
  const container = document.getElementById('chatbotMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chatbot-message ${sender}-message`;
  messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;
}

function findAnswer(question) {
  const lowerQ = question.toLowerCase();

  for (const faq of chatbotFAQ) {
    if (lowerQ.includes(faq.q.toLowerCase().split('?')[0]) ||
        faq.q.toLowerCase().includes(lowerQ.split('?')[0])) {
      return faq.a;
    }
  }

  return "I'm here to help with questions about using InterviewPrep AI! You can ask about: how to start, score calculation, available modules, tracking progress, voice practice, or data storage. For other inquiries, email us at contact@interviewprep.ai 📧";
}

// ===== MODALS =====
function initializeModals() {
  const aboutModal = document.getElementById('aboutModal');
  const contactModal = document.getElementById('contactModal');
  const aboutTriggers = document.querySelectorAll('.about-us-trigger');
  const contactTriggers = document.querySelectorAll('.contact-us-trigger');
  const closeButtons = document.querySelectorAll('.modal-close');
  const overlays = document.querySelectorAll('.modal-overlay');

  aboutTriggers.forEach(trigger => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(aboutModal);
    });
  });

  contactTriggers.forEach(trigger => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(contactModal);
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => closeAllModals());
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', closeAllModals);
  });

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName')?.value?.trim() || '';
      const email = document.getElementById('contactEmail')?.value?.trim() || '';
      const message = document.getElementById('contactMessage')?.value?.trim() || '';

      if (!name || !email || !message) {
        toast.error('Please fill in your name, email, and message.');
        return;
      }

      const subject = `InterviewPrep AI contact from ${name}`;
      const body = [`Name: ${name}`, `Email: ${email}`, '', message].join('\n');
      const mailtoUrl = `mailto:contact@interviewprep.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoUrl;
      toast.success('Your email app is opening with the message ready to send.');
      closeAllModals();
      contactForm.reset();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
}

function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = '';
}

// ===== NAVIGATION =====
function initializeNavigation() {
  const navLinks = document.querySelectorAll('[data-action]');
  const welcomeBtn = document.querySelector('[data-action="start-technical"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const action = link.getAttribute('data-action');
      handleNavigation(action);
    });
  });

  // Module cards
  document.querySelectorAll('[data-module]').forEach(card => {
    card.addEventListener('click', () => {
      const module = card.getAttribute('data-module');
      navigateToModule(module);
    });
  });
}

function handleNavigation(action) {
  const routes = {
    'start-technical': '/technical.html',
    'start-hr': '/hr.html',
    'technical': '/technical.html',
    'hr': '/hr.html',
    'dsa': '/dsa-practice.html',
    'resume': '/resume.html',
    'career': '/career.html',
    'library': '/prep-library.html'
  };

  const path = routes[action];
  if (path) {
    window.location.href = path;
  }
}

function navigateToModule(module) {
  const routes = {
    'technical': '/technical.html',
    'hr': '/hr.html',
    'dsa': '/dsa-practice.html',
    'resume': '/resume.html',
    'career': '/career.html',
    'library': '/prep-library.html'
  };

  const path = routes[module];
  if (path) {
    window.location.href = path;
  }
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      document.getElementById('chatbotWindow')?.classList.remove('hidden');
      document.getElementById('chatbotInput')?.focus();
    });
  }

  const notificationsBtn = document.getElementById('notificationsBtn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', () => {
      toast.info('No new alerts right now. Complete a practice round to generate fresh insights.');
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Sticky navbar on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.top-navbar');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navbar.style.boxShadow = 'var(--shadow-lg)';
    } else {
      navbar.style.boxShadow = 'var(--shadow-sm)';
    }

    lastScroll = currentScroll;
  });

  // Parallax effect for decoration circles
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const circles = document.querySelectorAll('.decoration-circle');
    circles.forEach((circle, index) => {
      const speed = (index + 1) * 0.1;
      circle.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
}

function initializeQuickSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;

  const selectors = ['.module-card', '.opening-card', '.link-card'];
  const emptyStateId = 'dashboardSearchEmptyState';

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(card => {
        const matches = !query || card.textContent.toLowerCase().includes(query);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount += 1;
      });
    });

    let emptyState = document.getElementById(emptyStateId);
    if (!visibleCount && query) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = emptyStateId;
        emptyState.className = 'empty-message';
        searchInput.closest('.nav-search')?.insertAdjacentElement('afterend', emptyState);
      }
      emptyState.textContent = `No dashboard matches for "${searchInput.value.trim()}".`;
    } else if (emptyState) {
      emptyState.remove();
    }
  });
}

// ===== SCROLL REVEAL ANIMATIONS =====
function initializeScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');

        // If element has stagger-children class, observe children
        if (entry.target.classList.contains('stagger-children')) {
          const children = entry.target.children;
          Array.from(children).forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('revealed');
            }, index * 100);
          });
        }
      }
    });
  }, observerOptions);

  // Observe all sections
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });

  // Observe cards with special animations
  document.querySelectorAll('.stat-card, .module-card, .opening-card, .link-card').forEach(card => {
    card.classList.add('scale-in-on-scroll');
    observer.observe(card);
  });

  // Observe performance cards with different animations
  const performanceCards = document.querySelectorAll('.performance-card');
  performanceCards.forEach((card, index) => {
    card.classList.add(index % 2 === 0 ? 'slide-left-on-scroll' : 'slide-right-on-scroll');
    observer.observe(card);
  });

  // Scroll progress bar update
  const progressBar = document.getElementById('scrollProgressBar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${progress}%`;
    });
  }
}

async function handleLogout() {
  try {
    const { apiFetch } = await import('./api-base.js');
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authMode');
    window.location.href = '/';
  }
}

// ===== UTILITY FUNCTIONS =====
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function animateCounter(element, target, duration = 1500) {
  const startTime = performance.now();
  const startValue = parseInt(element.textContent) || 0;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = Math.floor(startValue + (target - startValue) * easedProgress);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

function animateCounterText(element, target, suffix = '') {
  const startTime = performance.now();
  const startValue = parseInt(element.textContent) || 0;
  const duration = 1500;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = Math.floor(startValue + (target - startValue) * easedProgress);

    element.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 16px 24px;
    background: #ef4444;
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}

// Add slide animations
const style = document.createElement('style');
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

console.log('🎯 FloCareer Dashboard Loaded Successfully!');

