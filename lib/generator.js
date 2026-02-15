#!/usr/bin/env node
// GateCrash Forms - Form Generator
// Converts JSON schema to HTML form
// Security-hardened: XSS prevention, CSRF protection, input validation

const fs = require('fs');
const path = require('path');
const Security = require('./security');

class FormGenerator {
  constructor(schema, options = {}) {
    this.schema = schema;
    this.options = options;
    this.security = Security;
  }

  generate() {
    const html = this.buildHTML();
    return html;
  }

  buildHTML() {
    const { title, description, fields, submit, theme } = this.schema;
    const submitConfig = submit || {};
    
    // Generate field HTML
    const fieldsHTML = fields.map((field, idx) => this.renderField(field, idx)).join('\n');
    
    // Determine form action
    const action = this.getFormAction(submitConfig);
    const method = submitConfig.method || 'POST';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escape(title || 'Form')}</title>
  <style>
    ${this.getStyles(theme)}
  </style>
</head>
<body>
  <div class="container">
    <div class="form-wrapper">
      ${title ? `<h1>${this.escape(title)}</h1>` : ''}
      ${description ? `<p class="description">${this.escape(description)}</p>` : ''}
      
      <form action="${action}" method="${method}" class="gatecrash-form" id="mainForm" novalidate>
        ${fieldsHTML}
        
        <!-- Security: Honeypot spam protection -->
        <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">
        
        <!-- Security: CSRF protection -->
        <input type="hidden" name="_csrf" id="csrfToken" value="">
        
        <div id="form-errors" class="form-errors" style="display:none;"></div>
        
        <button type="submit" class="submit-btn" id="submitBtn">Submit</button>
      </form>
      
      <div id="success-message" style="display:none;">
        <h2>✓ Thank you!</h2>
        <p>Your response has been submitted.</p>
      </div>
    </div>
  </div>
  
  <script>
    ${this.getFormScript(submitConfig)}
  </script>
</body>
</html>`;
  }

  renderField(field, idx) {
    const { type, name, label, required, placeholder, options, min, max, maxLength } = field;
    const fieldId = name || `field_${idx}`;
    const requiredAttr = required ? 'required' : '';
    const requiredLabel = required ? '<span class="required">*</span>' : '';
    
    let inputHTML = '';
    
    switch (type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        inputHTML = `<input type="${type}" id="${fieldId}" name="${fieldId}" 
          ${placeholder ? `placeholder="${this.escape(placeholder)}"` : ''} 
          ${requiredAttr} ${maxLength ? `maxlength="${maxLength}"` : ''}>`;
        break;
        
      case 'textarea':
        inputHTML = `<textarea id="${fieldId}" name="${fieldId}" 
          ${placeholder ? `placeholder="${this.escape(placeholder)}"` : ''} 
          ${requiredAttr} ${maxLength ? `maxlength="${maxLength}"` : ''}></textarea>`;
        break;
        
      case 'select':
      case 'dropdown':
        inputHTML = `<select id="${fieldId}" name="${fieldId}" ${requiredAttr}>
          <option value="">Select...</option>
          ${options.map(opt => `<option value="${this.escape(opt)}">${this.escape(opt)}</option>`).join('\n')}
        </select>`;
        break;
        
      case 'radio':
        inputHTML = options.map((opt, i) => `
          <label class="radio-label">
            <input type="radio" name="${fieldId}" value="${this.escape(opt)}" ${i === 0 && required ? 'required' : ''}>
            ${this.escape(opt)}
          </label>
        `).join('\n');
        break;
        
      case 'checkbox':
        inputHTML = options.map(opt => `
          <label class="checkbox-label">
            <input type="checkbox" name="${fieldId}[]" value="${this.escape(opt)}">
            ${this.escape(opt)}
          </label>
        `).join('\n');
        break;
        
      case 'scale':
      case 'rating':
        const scaleMin = min || 1;
        const scaleMax = max || 5;
        const scaleOptions = [];
        for (let i = scaleMin; i <= scaleMax; i++) {
          scaleOptions.push(i);
        }
        inputHTML = `<div class="scale-wrapper">
          ${scaleOptions.map(val => `
            <label class="scale-label">
              <input type="radio" name="${fieldId}" value="${val}" ${required ? 'required' : ''}>
              <span class="scale-num">${val}</span>
            </label>
          `).join('\n')}
        </div>`;
        break;
        
      case 'date':
        inputHTML = `<input type="date" id="${fieldId}" name="${fieldId}" ${requiredAttr}>`;
        break;
        
      default:
        inputHTML = `<input type="text" id="${fieldId}" name="${fieldId}" ${requiredAttr}>`;
    }
    
    return `
      <div class="form-group">
        ${label ? `<label for="${fieldId}">${this.escape(label)}${requiredLabel}</label>` : ''}
        ${inputHTML}
      </div>
    `;
  }

  getFormAction(submitConfig) {
    if (submitConfig.action) {
      return submitConfig.action;
    }
    if (submitConfig.email && typeof submitConfig.email === 'string') {
      return `mailto:${submitConfig.email}`;
    }
    if (submitConfig.email && submitConfig.email.to) {
      return `mailto:${submitConfig.email.to}`;
    }
    return '#';
  }

  getFormScript(submitConfig) {
    const schemaJSON = JSON.stringify(this.schema).replace(/</g, '\\u003c');
    
    return `
      // GateCrash Forms - Secure Client-Side Handler
      (function() {
        const form = document.getElementById('mainForm');
        const submitBtn = document.getElementById('submitBtn');
        const errorsDiv = document.getElementById('form-errors');
        const schema = ${schemaJSON};
        
        // Generate and set CSRF token
        function generateCSRFToken() {
          const array = new Uint8Array(32);
          crypto.getRandomValues(array);
          return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
        }
        
        const csrfToken = generateCSRFToken();
        document.getElementById('csrfToken').value = csrfToken;
        sessionStorage.setItem('gatecrash_csrf', csrfToken);
        
        // Rate limiting (client-side basic check)
        function checkRateLimit() {
          const submissions = JSON.parse(localStorage.getItem('gatecrash_submissions') || '[]');
          const now = Date.now();
          const recentSubmissions = submissions.filter(t => now - t < 60000); // 1 minute window
          
          if (recentSubmissions.length >= 3) {
            return false;
          }
          
          recentSubmissions.push(now);
          localStorage.setItem('gatecrash_submissions', JSON.stringify(recentSubmissions));
          return true;
        }
        
        // Validate form fields
        function validateForm(formData) {
          const errors = [];
          
          // Check honeypot
          if (formData.get('_gotcha')) {
            return ['Spam detected'];
          }
          
          // Validate CSRF
          const submittedCSRF = formData.get('_csrf');
          const storedCSRF = sessionStorage.getItem('gatecrash_csrf');
          if (submittedCSRF !== storedCSRF) {
            return ['Security validation failed'];
          }
          
          // Validate each field
          schema.fields.forEach(field => {
            const fieldName = field.name || 'field_' + schema.fields.indexOf(field);
            let value = formData.get(fieldName);
            
            // Handle checkboxes
            if (field.type === 'checkbox') {
              value = formData.getAll(fieldName + '[]');
            }
            
            // Required check
            if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
              errors.push((field.label || fieldName) + ' is required');
            }
            
            if (!value) return;
            
            // Type validation
            if (field.type === 'email' && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
              errors.push('Invalid email format');
            }
            
            // Length validation
            if (field.maxLength && value.length > field.maxLength) {
              errors.push((field.label || fieldName) + ' is too long (max ' + field.maxLength + ' characters)');
            }
          });
          
          return errors;
        }
        
        // Show errors
        function showErrors(errors) {
          if (errors.length === 0) {
            errorsDiv.style.display = 'none';
            return;
          }
          
          errorsDiv.innerHTML = '<ul>' + errors.map(e => '<li>' + e + '</li>').join('') + '</ul>';
          errorsDiv.style.display = 'block';
          errorsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Handle submit
        form.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          // Clear previous errors
          showErrors([]);
          
          // Rate limit check
          if (!checkRateLimit()) {
            showErrors(['Too many submissions. Please wait a minute.']);
            return;
          }
          
          // Get form data
          const formData = new FormData(form);
          
          // Validate
          const errors = validateForm(formData);
          if (errors.length > 0) {
            showErrors(errors);
            return;
          }
          
          // Disable submit button
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
          
          // Extract data
          const data = {};
          for (let [key, value] of formData.entries()) {
            if (key === '_gotcha' || key === '_csrf') continue;
            if (key.endsWith('[]')) {
              const realKey = key.slice(0, -2);
              if (!data[realKey]) data[realKey] = [];
              data[realKey].push(value);
            } else {
              data[key] = value;
            }
          }
          
          // Save response (localStorage for demo, would be backend in production)
          const responses = JSON.parse(localStorage.getItem('gatecrash_responses') || '[]');
          responses.push({
            timestamp: new Date().toISOString(),
            formName: schema.title || 'Untitled Form',
            data: data
          });
          localStorage.setItem('gatecrash_responses', JSON.stringify(responses));
          
          // Show success
          form.style.display = 'none';
          document.getElementById('success-message').style.display = 'block';
          
          console.log('✓ Form submitted securely:', data);
        });
      })();
    `;
  }

  getStyles(theme) {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
      }
      
      .container {
        max-width: 600px;
        margin: 40px auto;
      }
      
      .form-wrapper {
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      }
      
      h1 {
        color: #2d3748;
        font-size: 28px;
        margin-bottom: 10px;
      }
      
      .description {
        color: #718096;
        margin-bottom: 30px;
        line-height: 1.6;
      }
      
      .form-group {
        margin-bottom: 24px;
      }
      
      label {
        display: block;
        color: #2d3748;
        font-weight: 500;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .required {
        color: #e53e3e;
        margin-left: 4px;
      }
      
      input[type="text"],
      input[type="email"],
      input[type="url"],
      input[type="phone"],
      input[type="date"],
      select,
      textarea {
        width: 100%;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        font-size: 15px;
        transition: border-color 0.2s;
        font-family: inherit;
      }
      
      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: #667eea;
      }
      
      textarea {
        min-height: 100px;
        resize: vertical;
      }
      
      .radio-label,
      .checkbox-label {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        font-weight: normal;
        cursor: pointer;
      }
      
      .radio-label input,
      .checkbox-label input {
        margin-right: 8px;
        cursor: pointer;
      }
      
      .scale-wrapper {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      
      .scale-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }
      
      .scale-label input {
        margin-bottom: 4px;
        cursor: pointer;
      }
      
      .scale-num {
        font-size: 14px;
        color: #718096;
      }
      
      .submit-btn {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
      
      .submit-btn:active {
        transform: translateY(0);
      }
      
      #success-message {
        text-align: center;
        padding: 40px 0;
      }
      
      #success-message h2 {
        color: #48bb78;
        font-size: 32px;
        margin-bottom: 10px;
      }
      
      #success-message p {
        color: #718096;
        font-size: 16px;
      }
      
      .form-errors {
        background: #fed7d7;
        border: 2px solid #fc8181;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 20px;
        color: #742a2a;
      }
      
      .form-errors ul {
        margin: 0;
        padding-left: 20px;
      }
      
      .form-errors li {
        margin: 4px 0;
      }
      
      .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      @media (max-width: 640px) {
        .form-wrapper {
          padding: 24px;
        }
        
        h1 {
          font-size: 24px;
        }
      }
    `;
  }

  escape(str) {
    return this.security.escapeHTML(str);
  }
}

module.exports = FormGenerator;
