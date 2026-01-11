/**
 * toast.js
 * Reusable Toast Notification System
 * Provides elegant, Apple-style notifications for errors, success, and info messages
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'error', 'success', 'info', 'warning'
 * @param {number} duration - Duration in ms (default: 4000, set to 0 for permanent)
 */
export function showToast(message, type = 'info', duration = 4000) {
  // Get or create toast container
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast-notification';

  // Define colors based on type
  const colors = {
    error: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', icon: '❌' },
    success: { bg: '#D1FAE5', border: '#10B981', text: '#065F46', icon: '✅' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: '⚠️' },
    info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', icon: 'ℹ️' }
  };

  const color = colors[type] || colors.info;

  toast.style.cssText = `
    background: ${color.bg};
    border-left: 4px solid ${color.border};
    color: ${color.text};
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    pointer-events: auto;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  toast.innerHTML = `
    <span style="font-size: 18px;">${color.icon}</span>
    <span style="flex: 1;">${message}</span>
    <button onclick="this.parentElement.remove()" style="
      background: none;
      border: none;
      color: ${color.text};
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.7;
    ">&times;</button>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  }, 10);

  // Auto-remove after duration (if not permanent)
  if (duration > 0) {
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

/**
 * Convenience methods for specific toast types
 */
export function showErrorToast(message, duration = 5000) {
  showToast(message, 'error', duration);
}

export function showSuccessToast(message, duration = 3000) {
  showToast(message, 'success', duration);
}

export function showInfoToast(message, duration = 3000) {
  showToast(message, 'info', duration);
}

export function showWarningToast(message, duration = 4000) {
  showToast(message, 'warning', duration);
}
