# 🚀 GateCrash Forms

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![GitHub Stars](https://img.shields.io/github/stars/Phoenix2479/gatecrash-forms?style=social)](https://github.com/Phoenix2479/gatecrash-forms)
[![Kimi Claw](https://img.shields.io/badge/Kimi_Claw-Ready-orange)](https://kimi.com)
[![ClawHub](https://img.shields.io/badge/ClawHub-Available-blue)](https://clawhub.ai/Phoenix2479/gatecrash-forms)

**CLI-first form builder that respects your freedom**

We crash gates. We don't build new ones.

> 🎯 **Status:** MVP Complete | 52KB total | Ready for production
> 
> ✨ **Works with [Kimi Claw](https://kimi.com)** - Install instantly from ClawHub's 5,000+ skill library

## Philosophy: BYOK (Bring Your Own Keys)

GateCrash Forms is NOT a service. It's a **toolmaker**.

You control:
- ✅ Your SMTP server (email notifications)
- ✅ Your storage (form responses)
- ✅ Your deployment (host anywhere)
- ✅ Your data (no external servers)

No GateCrash accounts. No GateCrash servers. No gatekeeping.

## 🔒 Security First

**New to GateCrash Forms? Read this first:**

GateCrash Forms is open source and secure by design. Before using:

1. ✅ **Verify the package:** Source code at https://github.com/Phoenix2479/gatecrash-forms
2. ✅ **Review SECURITY.md:** Full security documentation
3. ✅ **Test safely:** Use test credentials first, not production passwords
4. ✅ **Your data stays yours:** No telemetry, no tracking, no external servers

**IMPORTANT:** Update example form emails (`your-email@example.com`) to your actual email address before using.

See [SECURITY.md](./SECURITY.md) for full security practices and safe installation guide.

## Quick Start

### 🦞 For Kimi Claw Users

**Install from ClawHub marketplace:**

1. Open [Kimi Claw](https://kimi.com) in your browser
2. Search for "gatecrash-forms" in the skill library
3. Click install
4. Start generating forms instantly!

**Or via command line:**
```bash
clawhub install gatecrash-forms
```

### 📦 For npm Users

**Install globally:**

```bash
npm install -g gatecrash-forms
```

### 💻 For Developers

**Install Dependencies

```bash
npm install
```

### Generate a Form

```bash
node cli/gatecrash-forms.js generate examples/feedback.json feedback.html
```

Open `feedback.html` in your browser!

### Start Server

```bash
node cli/gatecrash-forms.js serve 3000
```

Visit http://localhost:3000 to see all available forms.

## Features

### 🤖 AI Agent Ready
- ✅ **Kimi Claw Native** - Works seamlessly with Kimi's 24/7 cloud agents
- ✅ **OpenClaw Compatible** - Install via ClawHub skill marketplace
- ✅ **CLI-First** - Perfect for automation and scripting
- ✅ **Zero Config** - Works out of the box, configure only what you need

### 📋 Form Builder
- ✅ **8+ Field Types** - Text, email, phone, URL, textarea, select, radio, checkbox, scale/rating, date
- ✅ **JSON Schema** - Define forms in simple JSON, generate beautiful HTML
- ✅ **No Code** - Pure form generation, no React/Vue/Angular needed
- ✅ **Instant Preview** - Generate and open in browser with one command

### 🔒 Security Hardened
- ✅ **XSS Protection** - HTML escaping on all inputs
- ✅ **CSRF Tokens** - Protection against cross-site request forgery
- ✅ **Honeypot Traps** - Spam bot detection
- ✅ **Rate Limiting** - Client and server-side protection
- ✅ **Input Validation** - Client + server-side validation
- ✅ **No Telemetry** - Zero tracking, zero data collection

### 📧 BYOK Email
- ✅ **Any SMTP Server** - Zoho, Gmail, Resend, agentmail.to, SendGrid, or your own
- ✅ **Agent-Friendly** - Recommended providers that don't ban bots
- ✅ **Email Templates** - Beautiful HTML + plain text emails
- ✅ **Multi-Recipient** - Send to multiple emails (coming in v0.2.0)

### 💾 Flexible Storage
- ✅ **JSON Storage** - Structured response data
- ✅ **CSV Export** - Spreadsheet-compatible format
- ✅ **Local First** - Your filesystem, your control
- ✅ **No Database** - Simple file-based storage

### 🎨 Beautiful by Default
- ✅ **Gradient Purple Theme** - Modern, professional design
- ✅ **Responsive** - Works on mobile, tablet, desktop
- ✅ **Accessible** - WCAG-compliant form controls
- ✅ **Customizable** - Easy to modify CSS (themes coming soon)

### 🚀 Deploy Anywhere
- ✅ **Static HTML** - Generate and host on any static server
- ✅ **Node.js Server** - Built-in Express server included
- ✅ **Vercel/Netlify** - Deploy with one command
- ✅ **Self-Hosted** - Run on your own infrastructure

## Configuration

### Recommended Email Providers

**For best results with automation, use agent-friendly SMTP:**
- [agentmail.to](https://agentmail.to)
- [Resend](https://resend.com)

These services don't ban bots. Gmail/Google Workspace will.

You can use any SMTP server - configure it in `~/.gatecrash/config.json` or per-form.

### Global Config (~/.gatecrash/config.json)

Set up your SMTP credentials once:

```bash
node cli/gatecrash-forms.js config smtp.host smtp.example.com
node cli/gatecrash-forms.js config smtp.port 465
node cli/gatecrash-forms.js config smtp.secure true
node cli/gatecrash-forms.js config smtp.auth.user your-email@example.com
node cli/gatecrash-forms.js config smtp.auth.pass your-password
```

### Per-Form Config

Each form can override global settings:

```json
{
  "title": "Contact Form",
  "fields": [...],
  "submit": {
    "email": "custom-email@example.com",
    "storage": "responses/contact.json",
    "smtp": {
      "host": "custom-smtp.com",
      "port": 587,
      "auth": {
        "user": "user",
        "pass": "pass"
      }
    }
  }
}
```

## Form Schema

Create a JSON file with your form structure:

```json
{
  "title": "My Awesome Form",
  "description": "Tell us what you think!",
  "fields": [
    {
      "type": "text",
      "name": "full_name",
      "label": "Your Name",
      "required": true,
      "placeholder": "John Doe"
    },
    {
      "type": "email",
      "name": "email",
      "label": "Email Address",
      "required": true
    },
    {
      "type": "scale",
      "name": "satisfaction",
      "label": "How satisfied are you?",
      "min": 1,
      "max": 5,
      "required": true
    },
    {
      "type": "checkbox",
      "name": "interests",
      "label": "Areas of interest",
      "options": ["Tech", "Design", "Business"]
    },
    {
      "type": "textarea",
      "name": "feedback",
      "label": "Additional feedback",
      "maxLength": 500
    }
  ],
  "submit": {
    "email": "your-email@example.com",
    "storage": "responses/feedback.json"
  }
}
```

## Examples

Check out the `examples/` directory:
- **feedback.json** - Customer feedback form
- **contact.json** - Simple contact form
- **registration.json** - Event registration

## Deployment

### Static HTML
1. Generate HTML: `node cli/gatecrash-forms.js generate form.json`
2. Upload `form.html` to any static host (Netlify, Vercel, GitHub Pages)
3. Done!

### Node.js Server
1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Deploy to any Node.js host (Heroku, Railway, DigitalOcean)

### Self-Hosted
1. Clone this repo on your server
2. Configure SMTP
3. Run with PM2 or systemd
4. Point nginx/Apache to it

## Why GateCrash?

Big tech gatekeeps everything:
- Google Forms bans AI agents
- TypeForm charges $50/month for features
- SurveyMonkey locks your data
- Jotform requires their branding

**We say NO.**

GateCrash gives you:
- ✅ Full control
- ✅ No subscriptions
- ✅ No data farming
- ✅ No lock-in
- ✅ Open source forever

## Roadmap

- [ ] File uploads
- [ ] Conditional logic (show/hide fields)
- [ ] Payment integration (Stripe, Razorpay)
- [ ] Multi-page forms
- [ ] A/B testing
- [ ] Analytics dashboard
- [ ] Web UI builder (drag & drop)
- [ ] WordPress plugin
- [ ] Zapier/n8n integration

## GateCrash Suite (Future)

GateCrash Forms is just the beginning. Coming soon:

- **GateCrash Email** - SMTP server for agents
- **GateCrash Storage** - S3-compatible object storage
- **GateCrash Analytics** - Privacy-first analytics
- **GateCrash Auth** - Open authentication system

## License

MIT - Use it, fork it, sell it, whatever. Just don't gatekeep it.

## Contributing

PRs welcome! Let's crash some gates together.

---

**Made with 🔥 by Dinki & Molty**

*"We crash gates. We don't build new ones."*
