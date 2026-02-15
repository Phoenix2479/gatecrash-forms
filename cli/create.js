#!/usr/bin/env node
// GateCrash Forms - CLI Create Command

const fs = require('fs');
const path = require('path');
const FormGenerator = require('../lib/generator');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
GateCrash Forms - Create

Usage:
  node create.js <form.json> [options]

Options:
  --output, -o <file>    Output file (default: <name>.html)
  --help, -h             Show this help

Example:
  node create.js feedback.json
  node create.js feedback.json --output my-form.html

GateCrash - We crash gates. You keep the keys.
    `);
    process.exit(0);
  }
  
  const inputFile = args[0];
  let outputFile = null;
  
  // Parse options
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      outputFile = args[i + 1];
      i++;
    }
  }
  
  // Read input JSON
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }
  
  let schema;
  try {
    const content = fs.readFileSync(inputFile, 'utf8');
    schema = JSON.parse(content);
  } catch (err) {
    console.error(`Error: Failed to parse JSON: ${err.message}`);
    process.exit(1);
  }
  
  // Generate form
  const generator = new FormGenerator(schema);
  const html = generator.generate();
  
  // Determine output file
  if (!outputFile) {
    const basename = path.basename(inputFile, path.extname(inputFile));
    outputFile = `${basename}.html`;
  }
  
  // Write output
  fs.writeFileSync(outputFile, html, 'utf8');
  
  console.log(`✓ Form generated: ${outputFile}`);
  console.log(`  Size: ${(html.length / 1024).toFixed(2)} KB`);
  console.log(`\nGateCrash - No gates. No keepers. No bullshit.`);
}

main();
