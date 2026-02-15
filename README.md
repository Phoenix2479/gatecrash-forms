# 🚀 GateCrash Forms

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![GitHub Stars](https://img.shields.io/github/stars/Phoenix2479/gatecrash-forms?style=social)](https://github.com/Phoenix2479/gatecrash-forms)

**CLI-first form builder that respects your freedom**

We crash gates. We don't build new ones.

> 🎯 **Status:** MVP Complete | 52KB total | Built in 2.5 hours | Ready for production

## Philosophy: BYOK (Bring Your Own Keys)

GateCrash Forms is NOT a service. It's a **toolmaker**.

You control:
- ✅ Your SMTP server (email notifications)
- ✅ Your storage (form responses)
- ✅ Your deployment (host anywhere)
- ✅ Your data (no external servers)

No GateCrash accounts. No GateCrash servers. No gatekeeping.

## Quick Start

### Install Dependencies

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

### Field Types
- ✅ Text, email, phone, URL
- ✅ Textarea (multi-line)
- ✅ Select dropdown
- ✅ Radio buttons
- ✅ Checkboxes (multi-select)
- ✅ Scale/rating (1-5, 1-10, custom)
- ✅ Date picker

### Security Built-In
- ✅ XSS protection (HTML escaping)
- ✅ Honeypot spam protection
- ✅ CSRF tokens
- ✅ Client-side rate limiting
- ✅ Server-side validation

### Styling
- ✅ Beautiful gradient purple theme
- ✅ Responsive design
- ✅ Accessible forms
- ✅ Clean, modern UI

## Configuration

### Global Config (~/.gatecrash/config.json)

Set up your SMTP credentials once:

```bash
node cli/gatecrash-forms.js config smtp.host smtp.zoho.in
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
