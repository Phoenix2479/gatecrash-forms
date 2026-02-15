#!/usr/bin/env node
// GateCrash Forms - Backend Submission Handler
// BYOK (Bring Your Own Keys) - users control their own infrastructure

const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const Security = require('./security');

class FormBackend {
  constructor(schema, config = {}) {
    this.schema = schema;
    this.config = config;
    this.rateLimiter = Security.createRateLimiter(10, 60000); // 10 requests per minute
  }

  /**
   * Handle form submission
   */
  async handleSubmission(formData, metadata = {}) {
    const { ip, userAgent } = metadata;
    const identifier = ip || 'unknown';

    // Rate limiting
    if (!this.rateLimiter(identifier)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Honeypot check
    if (formData._gotcha) {
      throw new Error('Spam detected');
    }

    // Validate form data
    const errors = Security.validateFormData(formData, this.schema);
    if (errors.length > 0) {
      throw new Error('Validation failed: ' + errors.join(', '));
    }

    // Prepare response object
    const response = {
      timestamp: new Date().toISOString(),
      formId: this.schema.id || this.schema.title,
      formTitle: this.schema.title,
      data: this.cleanFormData(formData),
      metadata: {
        ip,
        userAgent,
        submittedAt: new Date().toISOString()
      }
    };

    // Store response
    if (this.schema.submit?.storage) {
      await this.storeResponse(response);
    }

    // Send email notification
    if (this.schema.submit?.email) {
      await this.sendEmailNotification(response);
    }

    return response;
  }

  /**
   * Clean form data (remove internal fields)
   */
  cleanFormData(formData) {
    const cleaned = { ...formData };
    delete cleaned._gotcha;
    delete cleaned._csrf;
    return cleaned;
  }

  /**
   * Store response to file (JSON or CSV)
   */
  async storeResponse(response) {
    const storagePath = this.schema.submit.storage;
    const ext = path.extname(storagePath).toLowerCase();

    // Ensure directory exists
    await fs.mkdir(path.dirname(storagePath), { recursive: true });

    if (ext === '.json') {
      await this.storeJSON(storagePath, response);
    } else if (ext === '.csv') {
      await this.storeCSV(storagePath, response);
    } else {
      throw new Error('Unsupported storage format. Use .json or .csv');
    }
  }

  /**
   * Store as JSON (append to array)
   */
  async storeJSON(filePath, response) {
    let responses = [];
    
    try {
      const existing = await fs.readFile(filePath, 'utf8');
      responses = JSON.parse(existing);
    } catch (err) {
      // File doesn't exist or is empty, start fresh
    }

    responses.push(response);
    await fs.writeFile(filePath, JSON.stringify(responses, null, 2));
  }

  /**
   * Store as CSV (append row)
   */
  async storeCSV(filePath, response) {
    const headers = ['timestamp', ...Object.keys(response.data)];
    const row = [
      response.timestamp,
      ...Object.values(response.data).map(v => {
        if (Array.isArray(v)) return v.join('; ');
        return String(v).replace(/"/g, '""'); // Escape quotes
      })
    ];

    const csvRow = row.map(v => `"${v}"`).join(',');

    try {
      await fs.access(filePath);
      // File exists, append
      await fs.appendFile(filePath, csvRow + '\n');
    } catch {
      // File doesn't exist, create with headers
      const csvHeaders = headers.join(',');
      await fs.writeFile(filePath, csvHeaders + '\n' + csvRow + '\n');
    }
  }

  /**
   * Send email notification using BYOK SMTP
   */
  async sendEmailNotification(response) {
    const emailConfig = this.schema.submit.email;
    
    // Support both string (email address) and object (full config)
    const to = typeof emailConfig === 'string' ? emailConfig : emailConfig.to;
    const smtpConfig = emailConfig.smtp || this.config.smtp;

    if (!smtpConfig) {
      console.warn('⚠️ No SMTP config found. Email notification skipped.');
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig);

    // Build email content
    const subject = `New submission: ${this.schema.title}`;
    const text = this.formatEmailText(response);
    const html = this.formatEmailHTML(response);

    // Send email
    try {
      await transporter.sendMail({
        from: smtpConfig.auth.user,
        to,
        subject,
        text,
        html
      });
      console.log('✓ Email notification sent to', to);
    } catch (err) {
      console.error('✗ Failed to send email:', err.message);
      throw new Error('Email notification failed: ' + err.message);
    }
  }

  /**
   * Format email as plain text
   */
  formatEmailText(response) {
    let text = `New form submission: ${response.formTitle}\n`;
    text += `Submitted: ${response.timestamp}\n\n`;
    
    Object.entries(response.data).forEach(([key, value]) => {
      const field = this.schema.fields.find(f => f.name === key);
      const label = field?.label || key;
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      text += `${label}: ${displayValue}\n`;
    });

    return text;
  }

  /**
   * Format email as HTML
   */
  formatEmailHTML(response) {
    let html = `<h2>New form submission: ${Security.escapeHTML(response.formTitle)}</h2>`;
    html += `<p><strong>Submitted:</strong> ${response.timestamp}</p>`;
    html += '<table style="border-collapse: collapse; width: 100%;">';
    
    Object.entries(response.data).forEach(([key, value]) => {
      const field = this.schema.fields.find(f => f.name === key);
      const label = field?.label || key;
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      
      html += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${Security.escapeHTML(label)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${Security.escapeHTML(String(displayValue))}</td>
        </tr>
      `;
    });
    
    html += '</table>';
    return html;
  }
}

module.exports = FormBackend;
