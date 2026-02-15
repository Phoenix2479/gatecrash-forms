#!/usr/bin/env node
// GateCrash Forms - HTTP Server
// Serves forms and handles submissions

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const FormGenerator = require('./lib/generator');
const FormBackend = require('./lib/backend');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Global config (can be overridden per form)
let globalConfig = {};
try {
  const configPath = path.join(process.env.HOME, '.gatecrash', 'config.json');
  globalConfig = require(configPath);
} catch {
  // No global config found
}

// Store active forms in memory
const activeForms = new Map();

/**
 * Load form schema from file
 */
async function loadFormSchema(formId) {
  if (activeForms.has(formId)) {
    return activeForms.get(formId);
  }

  // Try to load from examples or custom path
  const formPath = path.join(__dirname, 'examples', `${formId}.json`);
  
  try {
    const schemaContent = await fs.readFile(formPath, 'utf8');
    const schema = JSON.parse(schemaContent);
    schema.id = formId;
    activeForms.set(formId, schema);
    return schema;
  } catch (err) {
    throw new Error(`Form not found: ${formId}`);
  }
}

/**
 * GET /:formId - Render form
 */
app.get('/:formId', async (req, res) => {
  try {
    const schema = await loadFormSchema(req.params.formId);
    const generator = new FormGenerator(schema);
    const html = generator.generate();
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(404).send(`
      <h1>Form Not Found</h1>
      <p>${err.message}</p>
    `);
  }
});

/**
 * POST /:formId/submit - Handle form submission
 */
app.post('/:formId/submit', async (req, res) => {
  try {
    const schema = await loadFormSchema(req.params.formId);
    const backend = new FormBackend(schema, globalConfig);
    
    const metadata = {
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    const response = await backend.handleSubmission(req.body, metadata);
    
    res.json({
      success: true,
      message: 'Form submitted successfully',
      responseId: response.timestamp
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET / - List available forms
 */
app.get('/', async (req, res) => {
  try {
    const examplesDir = path.join(__dirname, 'examples');
    const files = await fs.readdir(examplesDir);
    const forms = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
    
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GateCrash Forms</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 60px auto;
            padding: 20px;
          }
          h1 { color: #667eea; }
          ul { list-style: none; padding: 0; }
          li { margin: 10px 0; }
          a {
            color: #667eea;
            text-decoration: none;
            font-size: 18px;
          }
          a:hover { text-decoration: underline; }
          .tagline {
            color: #718096;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <h1>🚀 GateCrash Forms</h1>
        <p class="tagline">We crash gates. We don't build new ones.</p>
        <h2>Available Forms:</h2>
        <ul>
          ${forms.map(f => `<li><a href="/${f}">${f}</a></li>`).join('\n')}
        </ul>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error loading forms: ' + err.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GateCrash Forms server running at http://localhost:${PORT}`);
  console.log(`📋 Available forms: http://localhost:${PORT}`);
});

module.exports = app;
