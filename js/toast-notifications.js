/**
 * Toast Notification System
 * Provides user-friendly feedback for success, error, warning, and info messages
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.maxToasts = 5;
    this.defaultDuration = 5000; // 5 seconds
    this.initialize();
  }

  initialize() {
    // Create container if it doesn't exist
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'info', duration = this.defaultDuration, closable = true) {
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create toast element
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      pointer-events: auto;
      min-width: 300px;
      max-width: 450px;
      font-family: inherit;
      animation: slideIn 0.3s ease-out;
    `;

    // Set border color based on type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    toast.style.borderLeftColor = colors[type] || colors.info;

    // Icon based on type
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    // Message content
    toast.innerHTML = `
      <span class="toast-icon" style="font-size: 1.25rem; color: ${colors[type]}; flex-shrink: 0;">
        ${icons[type] || icons.info}
      </span>
      <div class="toast-content" style="flex: 1; color: #374151; font-size: 0.9rem; line-height: 1.4;">
        ${this.escapeHtml(message)}
      </div>
      ${closable ? `
        <button class="toast-close" style="background: none; border: none; cursor: pointer; padding: 0; margin-left: 8px; flex-shrink: 0; color: #9ca3af; font-size: 1.25rem; line-height: 1;">
          ×
        </button>
      ` : ''}
    `;

    // Add close button handler
    if (closable) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => this.dismiss(toastId));
    }

    // Add to container
    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Remove if too many toasts
    if (this.toasts.length > this.maxToasts) {
      const oldest = this.toasts.shift();
      this.dismissElement(oldest);
    }

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toastId);
      }, duration);
    }

    return toastId;
  }

  success(message, duration = this.defaultDuration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = this.defaultDuration * 2) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = this.defaultDuration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = this.defaultDuration) {
    return this.show(message, 'info', duration);
  }

  dismiss(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
      this.dismissElement(toast);
      const index = this.toasts.findIndex(t => t.id === toastId);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }
  }

  dismissElement(toast) {
    toast.style.animation = 'slideOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  clearAll() {
    const toasts = [...this.toasts];
    toasts.forEach(toast => this.dismissElement(toast));
    this.toasts = [];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Inject animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .toast {
    animation: slideIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);

// Global instance
const toast = new ToastManager();
export default toast;

/**
 * Loading Spinner Utility
 */
const LoadingSpinner = {
  create(options = {}) {
    const {
      size = 'medium',
      text = '',
      container = document.body,
      overlay = false
    } = options;

    const sizes = {
      small: '24px',
      medium: '48px',
      large: '64px'
    };

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      ${overlay ? `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        z-index: 9999;
      ` : 'padding: 20px;'}
    `;

    spinner.innerHTML = `
      <div class="spinner" style="
        width: ${sizes[size]};
        height: ${sizes[size]};
        border: 4px solid #e5e7eb;
        border-top: 4px solid #6366f1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      ${text ? `<div class="spinner-text" style="color: #6b7280; font-size: 0.9rem;">${text}</div>` : ''}
    `;

    // Add spinner animation if not already present
    if (!document.getElementById('spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'spinner-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(spinner);
    return spinner;
  },

  remove(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },

  show(options) {
    return this.create({ ...options, overlay: true });
  },

  hide(element) {
    this.remove(element);
  }
};

export { LoadingSpinner };