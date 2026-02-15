#!/usr/bin/env node
// GateCrash Forms - CLI
// Command-line interface for form generation and management

const fs = require('fs').promises;
const path = require('path');
const FormGenerator = require('../lib/generator');
const FormBackend = require('../lib/backend');

const USAGE = `
🚀 GateCrash Forms - CLI-first form builder

USAGE:
  gatecrash-forms generate <schema.json> [output.html]
  gatecrash-forms serve [port]
  gatecrash-forms config <key> <value>
  gatecrash-forms init
  gatecrash-forms help

COMMANDS:
  generate   Generate HTML form from JSON schema
  serve      Start HTTP server for forms
  config     Set global configuration
  init       Initialize GateCrash in current directory
  help       Show this help message

EXAMPLES:
  # Generate form from schema
  gatecrash-forms generate feedback.json feedback.html

  # Start server (serves all forms in examples/)
  gatecrash-forms serve 3000

  # Configure SMTP
  gatecrash-forms config smtp.host smtp.zoho.in
  gatecrash-forms config smtp.port 465

BYOK Philosophy:
  GateCrash uses YOUR infrastructure. Configure your own:
  - SMTP server (email notifications)
  - Storage path (form responses)
  - Deployment (host anywhere)

Learn more: https://github.com/yourusername/gatecrash-forms
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'generate':
        await generateForm(args[1], args[2]);
        break;

      case 'serve':
        await serveServer(args[1]);
        break;

      case 'config':
        await setConfig(args[1], args[2]);
        break;

      case 'init':
        await initProject();
        break;

      case 'help':
      case '--help':
      case '-h':
      case undefined:
        console.log(USAGE);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log(USAGE);
        process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

/**
 * Generate HTML form from JSON schema
 */
async function generateForm(schemaPath, outputPath) {
  if (!schemaPath) {
    throw new Error('Schema file required. Usage: gatecrash-forms generate <schema.json> [output.html]');
  }

  // Read schema
  const schemaContent = await fs.readFile(schemaPath, 'utf8');
  const schema = JSON.parse(schemaContent);

  // Generate form
  const generator = new FormGenerator(schema);
  const html = generator.generate();

  // Determine output path
  const output = outputPath || schemaPath.replace('.json', '.html');

  // Write HTML
  await fs.writeFile(output, html);

  console.log(`✓ Form generated: ${output}`);
  console.log(`  Open in browser: file://${path.resolve(output)}`);
}

/**
 * Start HTTP server
 */
async function serveServer(port = 3000) {
  const serverPath = path.join(__dirname, '../server.js');
  
  // Set port via environment variable
  process.env.PORT = port;
  
  console.log(`🚀 Starting GateCrash Forms server on port ${port}...`);
  require(serverPath);
}

/**
 * Set global configuration
 */
async function setConfig(key, value) {
  if (!key || !value) {
    throw new Error('Usage: gatecrash-forms config <key> <value>');
  }

  const configDir = path.join(process.env.HOME, '.gatecrash');
  const configPath = path.join(configDir, 'config.json');

  // Ensure directory exists
  await fs.mkdir(configDir, { recursive: true });

  // Load existing config
  let config = {};
  try {
    const existing = await fs.readFile(configPath, 'utf8');
    config = JSON.parse(existing);
  } catch {
    // No config exists yet
  }

  // Set nested key (e.g., smtp.host)
  const keys = key.split('.');
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;

  // Save config
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));

  console.log(`✓ Config saved: ${key} = ${value}`);
  console.log(`  Config file: ${configPath}`);
}

/**
 * Initialize GateCrash in current directory
 */
async function initProject() {
  const cwd = process.cwd();
  
  console.log('Initializing GateCrash Forms...');

  // Create directories
  await fs.mkdir(path.join(cwd, 'forms'), { recursive: true });
  await fs.mkdir(path.join(cwd, 'responses'), { recursive: true });

  // Create example form
  const exampleForm = {
    title: 'Contact Form',
    description: 'Get in touch with us!',
    fields: [
      { type: 'text', name: 'name', label: 'Your Name', required: true },
      { type: 'email', name: 'email', label: 'Email', required: true },
      { type: 'textarea', name: 'message', label: 'Message', required: true }
    ],
    submit: {
      email: 'your-email@example.com',
      storage: 'responses/contact.json'
    }
  };

  await fs.writeFile(
    path.join(cwd, 'forms', 'contact.json'),
    JSON.stringify(exampleForm, null, 2)
  );

  // Create README
  const readme = `# GateCrash Forms

Your forms are ready to use!

## Quick Start

1. Edit \`forms/contact.json\` with your email and form fields
2. Generate HTML: \`gatecrash-forms generate forms/contact.json\`
3. Or start server: \`gatecrash-forms serve\`

## Configure Email

\`\`\`bash
gatecrash-forms config smtp.host smtp.zoho.in
gatecrash-forms config smtp.port 465
gatecrash-forms config smtp.secure true
gatecrash-forms config smtp.auth.user your-email@example.com
gatecrash-forms config smtp.auth.pass your-password
\`\`\`

## BYOK Philosophy

GateCrash uses YOUR infrastructure:
- Your SMTP server for emails
- Your storage for responses
- Your deployment (host anywhere)

No gatekeepers. No lock-in. You own everything.
`;

  await fs.writeFile(path.join(cwd, 'README.md'), readme);

  console.log('✓ GateCrash Forms initialized!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit forms/contact.json');
  console.log('  2. gatecrash-forms generate forms/contact.json');
  console.log('  3. Open contact.html in browser');
}

// Run CLI
if (require.main === module) {
  main();
}

module.exports = { generateForm, serveServer, setConfig, initProject };
