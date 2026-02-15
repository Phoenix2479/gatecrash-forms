#!/usr/bin/env node
// GateCrash Forms - Email Backend (BYOK)
// Secure SMTP sending with user's own credentials

const nodemailer = require('nodemailer');
const Security = require('./security');

class EmailBackend {
  constructor(config) {
    this.config = config;
  }

  // Create SMTP transporter from config
  createTransporter() {
    const { host, port, secure, auth } = this.config;
    
    return nodemailer.createTransporter({
      host: host,
      port: port || 465,
      secure: secure !== false, // default true
      auth: {
        user: auth.user,
        pass: auth.pass
      }
    });
  }

  // Send form submission via email
  async sendFormSubmission(formTitle, data, recipients) {
    // Sanitize email addresses
    const to = Array.isArray(recipients) ? recipients : [recipients];
    const sanitizedTo = to.map(email => Security.sanitizeEmail(email));
    
    // Validate all email addresses
    for (const email of sanitizedTo) {
      if (!Security.isValidEmail(email)) {
        throw new Error(`Invalid recipient email: ${email}`);
      }
    }
    
    // Build email content
    const subject = `New submission: ${Security.escapeHTML(formTitle)}`;
    const textBody = this.buildTextBody(formTitle, data);
    const htmlBody = this.buildHTMLBody(formTitle, data);
    
    // Create transporter
    const transporter = this.createTransporter();
    
    // Send email
    const info = await transporter.sendMail({
      from: `"GateCrash Forms" <${this.config.auth.user}>`,
      to: sanitizedTo.join(', '),
      subject: subject,
      text: textBody,
      html: htmlBody
    });
    
    return info;
  }

  // Build plain text email body
  buildTextBody(formTitle, data) {
    let body = `New form submission: ${formTitle}\n\n`;
    body += `Submitted: ${new Date().toLocaleString()}\n\n`;
    body += '--- Form Data ---\n\n';
    
    for (const [key, value] of Object.entries(data)) {
      if (key === '_gotcha' || key === '_csrf') continue; // Skip spam/security fields
      
      const cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (Array.isArray(value)) {
        body += `${cleanKey}:\n`;
        value.forEach(v => body += `  - ${v}\n`);
      } else {
        body += `${cleanKey}: ${value}\n`;
      }
      body += '\n';
    }
    
    body += '---\n\n';
    body += 'Powered by GateCrash Forms\n';
    body += 'We crash gates. You keep the keys.\n';
    
    return body;
  }

  // Build HTML email body
  buildHTMLBody(formTitle, data) {
    let rows = '';
    
    for (const [key, value] of Object.entries(data)) {
      if (key === '_gotcha' || key === '_csrf') continue;
      
      const cleanKey = Security.escapeHTML(
        key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      );
      
      let valueHTML;
      if (Array.isArray(value)) {
        valueHTML = '<ul style="margin:0;padding-left:20px;">' +
          value.map(v => `<li>${Security.escapeHTML(v)}</li>`).join('') +
          '</ul>';
      } else {
        valueHTML = Security.escapeHTML(value);
      }
      
      rows += `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#2d3748;">
            ${cleanKey}
          </td>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;color:#4a5568;">
            ${valueHTML}
          </td>
        </tr>
      `;
    }
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;background:#f7fafc;padding:20px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:24px;color:white;">
      <h1 style="margin:0;font-size:24px;">New Form Submission</h1>
      <p style="margin:8px 0 0 0;opacity:0.9;">${Security.escapeHTML(formTitle)}</p>
    </div>
    
    <div style="padding:24px;">
      <p style="color:#718096;margin:0 0 16px 0;">
        Submitted: ${new Date().toLocaleString()}
      </p>
      
      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
    </div>
    
    <div style="padding:16px 24px;background:#f7fafc;border-top:1px solid #e2e8f0;color:#718096;font-size:14px;">
      Powered by <strong>GateCrash Forms</strong><br>
      We crash gates. You keep the keys.
    </div>
  </div>
</body>
</html>
    `;
  }
}

module.exports = EmailBackend;
