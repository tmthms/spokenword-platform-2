/**
 * email-utils.js
 * Email template processing utilities
 */

import { loadEmailTemplates } from './cms-service.js';

/**
 * Available variables per template
 */
export const templateVariables = {
  welcome_artist: ['firstName', 'lastName'],
  welcome_programmer: ['firstName', 'lastName', 'organizationName'],
  booking_request: ['artistName', 'programmerName', 'organizationName', 'message'],
  booking_confirmed: ['artistName', 'eventTitle', 'eventDate', 'eventLocation', 'programmerName'],
  message_notification: ['recipientName', 'senderName', 'messagePreview'],
  password_reset: ['firstName', 'resetLink']
};

/**
 * Get processed email template with variables replaced
 * @param {string} templateId - Template ID
 * @param {object} variables - Variables to replace
 * @returns {Promise<{subject: string, body: string}>}
 */
export async function getProcessedEmail(templateId, variables = {}) {
  try {
    // Load templates from Firestore
    const templates = await loadEmailTemplates();

    // Get the specific template
    const template = templates[templateId];

    if (!template) {
      console.error(`[EMAIL] Template not found: ${templateId}`);
      return {
        subject: 'Notification',
        body: 'You have received a notification from Community.'
      };
    }

    // Replace variables in subject and body
    let subject = template.subject || '';
    let body = template.body || '';

    // Replace all {variable} placeholders
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      subject = subject.replace(regex, value || '');
      body = body.replace(regex, value || '');
    }

    return { subject, body };

  } catch (error) {
    console.error('[EMAIL] Error processing template:', error);
    return {
      subject: 'Notification',
      body: 'You have received a notification from Community.'
    };
  }
}

/**
 * Validate template variables
 * @param {string} templateId - Template ID
 * @param {object} variables - Variables to check
 * @returns {boolean}
 */
export function validateTemplateVariables(templateId, variables) {
  const requiredVars = templateVariables[templateId] || [];

  for (const varName of requiredVars) {
    if (!(varName in variables) || !variables[varName]) {
      console.warn(`[EMAIL] Missing required variable: ${varName} for template ${templateId}`);
      return false;
    }
  }

  return true;
}

/**
 * Get example variables for a template (for testing)
 * @param {string} templateId - Template ID
 * @returns {object}
 */
export function getExampleVariables(templateId) {
  const examples = {
    welcome_artist: {
      firstName: 'John',
      lastName: 'Doe'
    },
    welcome_programmer: {
      firstName: 'Jane',
      lastName: 'Smith',
      organizationName: 'Example Venue'
    },
    booking_request: {
      artistName: 'John Doe',
      programmerName: 'Jane Smith',
      organizationName: 'Example Venue',
      message: 'We would love to book you for our event!'
    },
    booking_confirmed: {
      artistName: 'John Doe',
      eventTitle: 'Summer Festival',
      eventDate: '2024-07-15',
      eventLocation: 'Amsterdam',
      programmerName: 'Jane Smith'
    },
    message_notification: {
      recipientName: 'John Doe',
      senderName: 'Jane Smith',
      messagePreview: 'Hi, I wanted to discuss...'
    },
    password_reset: {
      firstName: 'John',
      resetLink: 'https://example.com/reset?token=abc123'
    }
  };

  return examples[templateId] || {};
}
