// GateCrash Forms - Security Utilities
// XSS prevention, input validation, sanitization

class Security {
  /**
   * Escape HTML to prevent XSS attacks
   */
  static escapeHTML(str) {
    if (typeof str !== 'string') return str;
    
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    
    return str.replace(/[&<>"'/]/g, char => escapeMap[char]);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize filename to prevent path traversal
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .replace(/\.\.+/g, '.')
      .substring(0, 255);
  }

  /**
   * Rate limiting check (simple in-memory)
   */
  static createRateLimiter(maxRequests = 10, windowMs = 60000) {
    const requests = new Map();
    
    return (identifier) => {
      const now = Date.now();
      const userRequests = requests.get(identifier) || [];
      
      // Clean old requests
      const recentRequests = userRequests.filter(time => now - time < windowMs);
      
      if (recentRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      recentRequests.push(now);
      requests.set(identifier, recentRequests);
      return true;
    };
  }

  /**
   * Generate random token for CSRF protection
   */
  static generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Validate form data against schema
   */
  static validateFormData(data, schema) {
    const errors = [];
    
    schema.fields.forEach(field => {
      const fieldName = field.name || `field_${schema.fields.indexOf(field)}`;
      const value = data[fieldName];
      
      // Required validation
      if (field.required && !value) {
        errors.push(`${field.label || fieldName} is required`);
        return;
      }
      
      if (!value) return; // Skip optional empty fields
      
      // Type-specific validation
      switch (field.type) {
        case 'email':
          if (!this.isValidEmail(value)) {
            errors.push(`${field.label || fieldName} must be a valid email`);
          }
          break;
          
        case 'url':
          if (!this.isValidURL(value)) {
            errors.push(`${field.label || fieldName} must be a valid URL`);
          }
          break;
          
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${field.label || fieldName} must be a number`);
          }
          if (field.min !== undefined && Number(value) < field.min) {
            errors.push(`${field.label || fieldName} must be at least ${field.min}`);
          }
          if (field.max !== undefined && Number(value) > field.max) {
            errors.push(`${field.label || fieldName} must be at most ${field.max}`);
          }
          break;
      }
      
      // Length validation
      if (field.maxLength && value.length > field.maxLength) {
        errors.push(`${field.label || fieldName} exceeds maximum length of ${field.maxLength}`);
      }
    });
    
    return errors;
  }
}

module.exports = Security;
