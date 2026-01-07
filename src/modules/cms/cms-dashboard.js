/**
 * cms-dashboard.js
 * CMS Dashboard for managing content, styles, and email templates
 */

import { getStore } from '../../utils/store.js';
import {
  loadCMSContent,
  updateCMSContent,
  loadCMSStyles,
  updateCMSStyles,
  loadEmailTemplates,
  updateEmailTemplate,
  getCurrentLanguage,
  applyGlobalStyles
} from '../../services/cms-service.js';

/**
 * Check if current user is admin
 * @returns {boolean}
 */
export function isAdmin() {
  const userData = getStore('currentUserData');
  if (!userData) return false;

  return userData.role === 'admin' || userData.isAdmin === true;
}

/**
 * Show CMS Dashboard
 */
export async function showCMSDashboard() {
  // Check admin access
  if (!isAdmin()) {
    alert('Access denied. Admin privileges required.');
    window.location.hash = '#dashboard';
    return;
  }

  const appContent = document.getElementById('app-content');

  // Show loading
  appContent.innerHTML = `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center py-20">
          <p class="text-gray-600">Loading CMS Dashboard...</p>
        </div>
      </div>
    </div>
  `;

  try {
    // Load all CMS data
    const [content_nl, content_en, styles, emailTemplates] = await Promise.all([
      loadCMSContent('nl'),
      loadCMSContent('en'),
      loadCMSStyles(),
      loadEmailTemplates()
    ]);

    // Render dashboard
    renderCMSDashboard(content_nl, content_en, styles, emailTemplates);

  } catch (error) {
    console.error('[CMS] Error loading dashboard:', error);
    appContent.innerHTML = `
      <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-7xl mx-auto px-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 class="text-xl font-bold text-red-800 mb-2">Error Loading CMS</h2>
            <p class="text-red-600">${error.message}</p>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Render CMS Dashboard
 */
function renderCMSDashboard(content_nl, content_en, styles, emailTemplates) {
  const appContent = document.getElementById('app-content');

  appContent.innerHTML = `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">CMS Dashboard</h1>
          <p class="text-gray-600 mt-2">Manage content, styling, and email templates</p>
        </div>

        <!-- Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button id="tab-content" class="cms-tab active border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600">
                Content
              </button>
              <button id="tab-styling" class="cms-tab border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Styling
              </button>
              <button id="tab-emails" class="cms-tab border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Email Templates
              </button>
            </nav>
          </div>
        </div>

        <!-- Tab Content: Content Editor -->
        <div id="content-tab-panel" class="tab-panel">
          <div class="bg-white rounded-lg shadow p-6">
            <!-- Language Selector -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select id="content-language-selector" class="border border-gray-300 rounded-lg px-4 py-2">
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
            </div>

            <!-- Section Navigation -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select id="content-section-selector" class="border border-gray-300 rounded-lg px-4 py-2 w-full">
                <option value="home">Home</option>
                <option value="auth">Authentication</option>
                <option value="search">Search</option>
                <option value="profile">Profile</option>
                <option value="messages">Messages</option>
                <option value="common">Common</option>
              </select>
            </div>

            <!-- Content Editor -->
            <div id="content-editor" class="space-y-4">
              <!-- Will be populated dynamically -->
            </div>

            <!-- Save Button -->
            <div class="mt-6 flex justify-end">
              <button id="save-content-btn" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                Save Content
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Content: Styling Editor -->
        <div id="styling-tab-panel" class="tab-panel hidden">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Global Styles</h2>

            <!-- Gradient Colors -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Gradient</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">From Color</label>
                  <div class="flex items-center gap-3">
                    <input type="color" id="gradient-from" value="${styles.gradient?.from || '#667eea'}" class="h-10 w-20 border border-gray-300 rounded">
                    <input type="text" id="gradient-from-text" value="${styles.gradient?.from || '#667eea'}" class="border border-gray-300 rounded-lg px-3 py-2 flex-1">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">To Color</label>
                  <div class="flex items-center gap-3">
                    <input type="color" id="gradient-to" value="${styles.gradient?.to || '#764ba2'}" class="h-10 w-20 border border-gray-300 rounded">
                    <input type="text" id="gradient-to-text" value="${styles.gradient?.to || '#764ba2'}" class="border border-gray-300 rounded-lg px-3 py-2 flex-1">
                  </div>
                </div>
              </div>

              <!-- Gradient Preview -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div id="gradient-preview" class="h-24 rounded-lg" style="background: linear-gradient(135deg, ${styles.gradient?.from || '#667eea'} 0%, ${styles.gradient?.to || '#764ba2'} 100%);"></div>
              </div>
            </div>

            <!-- Theme Colors -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Theme Colors</h3>
              <div class="grid grid-cols-3 gap-4">
                ${renderColorInput('primary', 'Primary', styles.colors?.primary || '#667eea')}
                ${renderColorInput('secondary', 'Secondary', styles.colors?.secondary || '#764ba2')}
                ${renderColorInput('accent', 'Accent', styles.colors?.accent || '#f59e0b')}
                ${renderColorInput('success', 'Success', styles.colors?.success || '#10b981')}
                ${renderColorInput('error', 'Error', styles.colors?.error || '#ef4444')}
                ${renderColorInput('warning', 'Warning', styles.colors?.warning || '#f59e0b')}
              </div>
            </div>

            <!-- Save Button -->
            <div class="mt-6 flex justify-end">
              <button id="save-styles-btn" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                Save Styles
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Content: Email Templates -->
        <div id="emails-tab-panel" class="tab-panel hidden">
          <div class="bg-white rounded-lg shadow p-6">
            <!-- Template Selector -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Template</label>
              <select id="email-template-selector" class="border border-gray-300 rounded-lg px-4 py-2 w-full">
                <option value="welcome_artist">Welcome Artist</option>
                <option value="welcome_programmer">Welcome Programmer</option>
                <option value="booking_request">Booking Request</option>
                <option value="booking_confirmed">Booking Confirmed</option>
                <option value="message_notification">Message Notification</option>
                <option value="password_reset">Password Reset</option>
              </select>
            </div>

            <!-- Subject Editor -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input type="text" id="email-subject" class="border border-gray-300 rounded-lg px-4 py-2 w-full">
            </div>

            <!-- Body Editor -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Body</label>
              <textarea id="email-body" rows="12" class="border border-gray-300 rounded-lg px-4 py-2 w-full font-mono text-sm"></textarea>
            </div>

            <!-- Variables Help -->
            <div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-semibold text-blue-900 mb-2">Available Variables</h4>
              <div id="email-variables-help" class="text-sm text-blue-800">
                <!-- Will be populated based on selected template -->
              </div>
            </div>

            <!-- Save Button -->
            <div class="mt-6 flex justify-end">
              <button id="save-email-btn" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                Save Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup event handlers
  setupCMSEventHandlers(content_nl, content_en, styles, emailTemplates);
}

/**
 * Render color input field
 */
function renderColorInput(id, label, value) {
  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">${label}</label>
      <div class="flex items-center gap-3">
        <input type="color" id="color-${id}" value="${value}" class="h-10 w-20 border border-gray-300 rounded">
        <input type="text" id="color-${id}-text" value="${value}" class="border border-gray-300 rounded-lg px-3 py-2 flex-1">
      </div>
    </div>
  `;
}

/**
 * Setup CMS Event Handlers
 */
function setupCMSEventHandlers(content_nl, content_en, styles, emailTemplates) {
  let currentContentData = { nl: content_nl, en: content_en };
  let currentStylesData = styles;
  let currentEmailTemplates = emailTemplates;
  let currentLang = 'nl';
  let currentSection = 'home';
  let currentTemplate = 'welcome_artist';

  // Tab switching
  document.querySelectorAll('.cms-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      document.querySelectorAll('.cms-tab').forEach(t => {
        t.classList.remove('active', 'border-indigo-500', 'text-indigo-600');
        t.classList.add('border-transparent', 'text-gray-500');
      });
      tab.classList.add('active', 'border-indigo-500', 'text-indigo-600');
      tab.classList.remove('border-transparent', 'text-gray-500');

      // Show corresponding panel
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
      const panelId = tab.id.replace('tab-', '') + '-tab-panel';
      document.getElementById(panelId)?.classList.remove('hidden');
    });
  });

  // Content language selector
  const langSelector = document.getElementById('content-language-selector');
  langSelector.addEventListener('change', () => {
    currentLang = langSelector.value;
    renderContentEditor(currentContentData[currentLang], currentSection);
  });

  // Content section selector
  const sectionSelector = document.getElementById('content-section-selector');
  sectionSelector.addEventListener('change', () => {
    currentSection = sectionSelector.value;
    renderContentEditor(currentContentData[currentLang], currentSection);
  });

  // Initial content editor render
  renderContentEditor(currentContentData[currentLang], currentSection);

  // Save content button
  document.getElementById('save-content-btn').addEventListener('click', async () => {
    try {
      const btn = document.getElementById('save-content-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';

      // Collect all edited values
      const editor = document.getElementById('content-editor');
      const inputs = editor.querySelectorAll('input, textarea');

      inputs.forEach(input => {
        const path = input.dataset.path.split('.');
        let obj = currentContentData[currentLang];

        for (let i = 0; i < path.length - 1; i++) {
          obj = obj[path[i]];
        }

        obj[path[path.length - 1]] = input.value;
      });

      // Save to Firestore
      await updateCMSContent(currentLang, currentContentData[currentLang]);

      btn.textContent = 'Saved!';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Save Content';
      }, 2000);

    } catch (error) {
      console.error('[CMS] Error saving content:', error);
      alert('Error saving content: ' + error.message);
      const btn = document.getElementById('save-content-btn');
      btn.disabled = false;
      btn.textContent = 'Save Content';
    }
  });

  // Gradient color pickers
  setupColorSync('gradient-from');
  setupColorSync('gradient-to');

  // Theme color pickers
  ['primary', 'secondary', 'accent', 'success', 'error', 'warning'].forEach(color => {
    setupColorSync(`color-${color}`);
  });

  // Gradient preview update
  const updateGradientPreview = () => {
    const from = document.getElementById('gradient-from').value;
    const to = document.getElementById('gradient-to').value;
    const preview = document.getElementById('gradient-preview');
    preview.style.background = `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
  };

  document.getElementById('gradient-from').addEventListener('input', updateGradientPreview);
  document.getElementById('gradient-to').addEventListener('input', updateGradientPreview);

  // Save styles button
  document.getElementById('save-styles-btn').addEventListener('click', async () => {
    try {
      const btn = document.getElementById('save-styles-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';

      const newStyles = {
        gradient: {
          from: document.getElementById('gradient-from').value,
          to: document.getElementById('gradient-to').value
        },
        colors: {
          primary: document.getElementById('color-primary').value,
          secondary: document.getElementById('color-secondary').value,
          accent: document.getElementById('color-accent').value,
          success: document.getElementById('color-success').value,
          error: document.getElementById('color-error').value,
          warning: document.getElementById('color-warning').value
        }
      };

      await updateCMSStyles(newStyles);
      currentStylesData = newStyles;

      btn.textContent = 'Saved!';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Save Styles';
      }, 2000);

    } catch (error) {
      console.error('[CMS] Error saving styles:', error);
      alert('Error saving styles: ' + error.message);
      const btn = document.getElementById('save-styles-btn');
      btn.disabled = false;
      btn.textContent = 'Save Styles';
    }
  });

  // Email template selector
  const templateSelector = document.getElementById('email-template-selector');
  templateSelector.addEventListener('change', () => {
    currentTemplate = templateSelector.value;
    loadEmailTemplateEditor(currentEmailTemplates, currentTemplate);
  });

  // Initial email template load
  loadEmailTemplateEditor(currentEmailTemplates, currentTemplate);

  // Save email button
  document.getElementById('save-email-btn').addEventListener('click', async () => {
    try {
      const btn = document.getElementById('save-email-btn');
      btn.disabled = true;
      btn.textContent = 'Saving...';

      const template = {
        subject: document.getElementById('email-subject').value,
        body: document.getElementById('email-body').value
      };

      await updateEmailTemplate(currentTemplate, template);
      currentEmailTemplates[currentTemplate] = template;

      btn.textContent = 'Saved!';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Save Template';
      }, 2000);

    } catch (error) {
      console.error('[CMS] Error saving email template:', error);
      alert('Error saving template: ' + error.message);
      const btn = document.getElementById('save-email-btn');
      btn.disabled = false;
      btn.textContent = 'Save Template';
    }
  });
}

/**
 * Render content editor for a section
 */
function renderContentEditor(content, section) {
  const editor = document.getElementById('content-editor');
  const sectionData = content[section];

  if (!sectionData) {
    editor.innerHTML = '<p class="text-gray-500">No content found for this section</p>';
    return;
  }

  const fields = [];

  function renderFields(obj, path = []) {
    for (const key in obj) {
      const value = obj[key];
      const currentPath = [...path, key];
      const pathStr = currentPath.join('.');

      if (typeof value === 'object' && value !== null) {
        // Nested object - add heading
        fields.push(`
          <div class="mt-4 mb-2">
            <h4 class="font-semibold text-gray-700">${key.charAt(0).toUpperCase() + key.slice(1)}</h4>
          </div>
        `);
        renderFields(value, currentPath);
      } else {
        // Leaf node - add input
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        const isLong = typeof value === 'string' && value.length > 50;

        fields.push(`
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
            ${isLong ?
              `<textarea data-path="${section}.${pathStr}" rows="3" class="border border-gray-300 rounded-lg px-3 py-2 w-full">${value}</textarea>` :
              `<input type="text" data-path="${section}.${pathStr}" value="${value}" class="border border-gray-300 rounded-lg px-3 py-2 w-full">`
            }
          </div>
        `);
      }
    }
  }

  renderFields(sectionData);
  editor.innerHTML = fields.join('');
}

/**
 * Setup color picker sync (color input <-> text input)
 */
function setupColorSync(id) {
  const colorInput = document.getElementById(id);
  const textInput = document.getElementById(id + '-text');

  if (!colorInput || !textInput) return;

  colorInput.addEventListener('input', () => {
    textInput.value = colorInput.value;
  });

  textInput.addEventListener('input', () => {
    if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
      colorInput.value = textInput.value;
    }
  });
}

/**
 * Load email template into editor
 */
function loadEmailTemplateEditor(templates, templateId) {
  const template = templates[templateId];

  if (!template) {
    console.warn('[CMS] Template not found:', templateId);
    return;
  }

  document.getElementById('email-subject').value = template.subject || '';
  document.getElementById('email-body').value = template.body || '';

  // Update variables help
  const variablesHelp = document.getElementById('email-variables-help');
  const variables = getTemplateVariables(templateId);

  variablesHelp.innerHTML = variables.map(v =>
    `<code class="bg-blue-100 px-2 py-1 rounded">{${v}}</code>`
  ).join(' ');
}

/**
 * Get available variables for template
 */
function getTemplateVariables(templateId) {
  const variableMap = {
    welcome_artist: ['firstName', 'lastName'],
    welcome_programmer: ['firstName', 'lastName', 'organizationName'],
    booking_request: ['artistName', 'programmerName', 'organizationName', 'message'],
    booking_confirmed: ['artistName', 'eventTitle', 'eventDate', 'eventLocation', 'programmerName'],
    message_notification: ['recipientName', 'senderName', 'messagePreview'],
    password_reset: ['firstName', 'resetLink']
  };

  return variableMap[templateId] || [];
}
