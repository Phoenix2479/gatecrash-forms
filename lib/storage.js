#!/usr/bin/env node
// GateCrash Forms - Response Storage
// Save form submissions to JSON/CSV

const fs = require('fs');
const path = require('path');
const Security = require('./security');

class ResponseStorage {
  constructor(config = {}) {
    this.storageDir = config.path || path.join(process.cwd(), 'responses');
    this.ensureDir(this.storageDir);
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Get safe filename for form
  getFormFilename(formName) {
    return Security.sanitizeFilename(formName);
  }

  // Save response to JSON file
  saveResponse(formName, data) {
    const filename = this.getFormFilename(formName);
    const jsonPath = path.join(this.storageDir, `${filename}.json`);
    
    // Read existing responses
    let responses = [];
    if (fs.existsSync(jsonPath)) {
      try {
        const content = fs.readFileSync(jsonPath, 'utf8');
        responses = JSON.parse(content);
      } catch (err) {
        console.error('Error reading existing responses:', err.message);
        responses = [];
      }
    }
    
    // Add new response
    responses.push({
      timestamp: new Date().toISOString(),
      data: data
    });
    
    // Write back
    fs.writeFileSync(jsonPath, JSON.stringify(responses, null, 2), 'utf8');
    
    return { saved: true, path: jsonPath, count: responses.length };
  }

  // Export responses to CSV
  exportToCSV(formName) {
    const filename = this.getFormFilename(formName);
    const jsonPath = path.join(this.storageDir, `${filename}.json`);
    const csvPath = path.join(this.storageDir, `${filename}.csv`);
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`No responses found for form: ${formName}`);
    }
    
    // Read responses
    const responses = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (responses.length === 0) {
      throw new Error('No responses to export');
    }
    
    // Get all unique field names
    const fields = new Set(['timestamp']);
    responses.forEach(response => {
      Object.keys(response.data).forEach(key => fields.add(key));
    });
    
    const fieldArray = Array.from(fields);
    
    // Build CSV
    let csv = '';
    
    // Header row
    csv += fieldArray.map(f => this.escapeCSV(f)).join(',') + '\n';
    
    // Data rows
    responses.forEach(response => {
      const row = fieldArray.map(field => {
        if (field === 'timestamp') {
          return this.escapeCSV(response.timestamp);
        }
        
        const value = response.data[field];
        if (Array.isArray(value)) {
          return this.escapeCSV(value.join('; '));
        }
        return this.escapeCSV(value || '');
      });
      
      csv += row.join(',') + '\n';
    });
    
    // Write CSV
    fs.writeFileSync(csvPath, csv, 'utf8');
    
    return { exported: true, path: csvPath, rows: responses.length };
  }

  // Escape CSV value
  escapeCSV(value) {
    if (value === null || value === undefined) return '';
    
    const str = String(value);
    
    // If contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    
    return str;
  }

  // Get all responses for a form
  getResponses(formName) {
    const filename = this.getFormFilename(formName);
    const jsonPath = path.join(this.storageDir, `${filename}.json`);
    
    if (!fs.existsSync(jsonPath)) {
      return [];
    }
    
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  // Get response count
  getResponseCount(formName) {
    return this.getResponses(formName).length;
  }

  // Delete all responses for a form
  deleteResponses(formName) {
    const filename = this.getFormFilename(formName);
    const jsonPath = path.join(this.storageDir, `${filename}.json`);
    const csvPath = path.join(this.storageDir, `${filename}.csv`);
    
    let deleted = 0;
    
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
      deleted++;
    }
    
    if (fs.existsSync(csvPath)) {
      fs.unlinkSync(csvPath);
      deleted++;
    }
    
    return { deleted: deleted > 0, filesRemoved: deleted };
  }
}

module.exports = ResponseStorage;
