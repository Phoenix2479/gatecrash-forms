# Security Policy

GateCrash Forms is built with security as a core principle. This document explains our security practices, how we protect your data, and how to use the tool safely.

---

## 🔒 Security Philosophy

**We crash gates. We don't build new ones.**

This means:
- ✅ **No data collection** - We don't send your data anywhere
- ✅ **BYOK (Bring Your Own Keys)** - You control all credentials
- ✅ **No external servers** - Everything runs on your infrastructure
- ✅ **Open source** - Every line of code is inspectable
- ✅ **No telemetry** - We don't track you

---

## 🛡️ What GateCrash Forms Does

### Local-Only Processing
- Form generation happens on your machine
- No data is sent to GateCrash servers (we don't have any!)
- HTML files are generated locally
- Responses are stored on your filesystem

### BYOK SMTP
- YOU configure your own SMTP server
- Credentials are stored in `~/.gatecrash/config.json` (local file)
- We never see or store your passwords
- Email is sent from YOUR server, not ours

### No External Dependencies
- No tracking scripts
- No analytics
- No CDN dependencies
- Pure HTML + vanilla JavaScript

---

## ✅ How to Verify GateCrash Forms

### 1. Source Code Verification

**GitHub Repository:**
- https://github.com/Phoenix2479/gatecrash-forms
- MIT License (free to audit)
- All code is public

**npm Package:**
- https://www.npmjs.com/package/gatecrash-forms
- Package matches GitHub source
- No obfuscation

**Verify integrity:**
```bash
# View what's in the package
npm view gatecrash-forms

# Check package contents
npm pack gatecrash-forms
tar -tzf gatecrash-forms-*.tgz

# Compare with GitHub source
git clone https://github.com/Phoenix2479/gatecrash-forms.git
diff -r gatecrash-forms/ package/
```

### 2. What Gets Installed

**Files:**
- `cli/` - Command-line interface
- `lib/` - Core libraries (generator, backend, security)
- `examples/` - Example form schemas
- `server.js` - Optional HTTP server

**No hidden files, no telemetry, no trackers.**

### 3. Network Activity

**GateCrash Forms only makes network requests when:**
- Installing from npm (downloading package)
- Sending email via YOUR SMTP server (when configured)

**We never:**
- ❌ Phone home
- ❌ Send telemetry
- ❌ Track usage
- ❌ Collect analytics

---

## 🔐 Credential Storage

### Where Credentials Are Stored

**Global config:** `~/.gatecrash/config.json`
```json
{
  "smtp": {
    "host": "smtp.example.com",
    "port": 465,
    "secure": true,
    "auth": {
      "user": "your-email@example.com",
      "pass": "your-password"
    }
  }
}
```

**Per-form config:** Embedded in form JSON
```json
{
  "submit": {
    "email": "recipient@example.com",
    "smtp": {
      "host": "smtp.example.com",
      "auth": { "user": "...", "pass": "..." }
    }
  }
}
```

### Security Best Practices

**DO:**
- ✅ Use environment variables for passwords
- ✅ Restrict file permissions on config: `chmod 600 ~/.gatecrash/config.json`
- ✅ Use app-specific passwords (Gmail, Zoho support this)
- ✅ Test with throwaway accounts first
- ✅ Use agent-friendly providers (agentmail.to, Resend)

**DON'T:**
- ❌ Commit config files to git
- ❌ Use your main email password
- ❌ Share config files publicly
- ❌ Store credentials in form HTML

---

## 🧪 Safe Installation & Testing

### Recommended Installation Flow

**1. Verify the package first:**
```bash
# Check what will be installed
npm view gatecrash-forms

# Review on GitHub
open https://github.com/Phoenix2479/gatecrash-forms
```

**2. Install in isolated environment (optional but recommended):**
```bash
# Use Docker
docker run -it node:18 bash
npm install -g gatecrash-forms

# Or use a VM
# Or use a separate user account
```

**3. Test with fake data:**
```bash
# Don't use real credentials yet
gatecrash-forms init

# Edit forms/contact.json with fake email
# Generate and test
gatecrash-forms generate forms/contact.json test.html
```

**4. Configure SMTP with test account:**
```bash
# Use a throwaway email or test SMTP server
gatecrash-forms config smtp.host smtp.mailtrap.io
gatecrash-forms config smtp.auth.user test@example.com
gatecrash-forms config smtp.auth.pass fake-password
```

**5. Deploy to production when satisfied:**
```bash
# Now use real credentials
gatecrash-forms config smtp.host smtp.example.com
gatecrash-forms config smtp.auth.user your-real-email@example.com
gatecrash-forms config smtp.auth.pass your-app-password
```

---

## 🚨 Security Warnings & Recommendations

### File Permissions

**Protect your config file:**
```bash
chmod 600 ~/.gatecrash/config.json
```

**Protect response data:**
```bash
chmod 700 responses/
chmod 600 responses/*.json
```

### SMTP Credentials

**Use app-specific passwords:**
- Gmail: https://myaccount.google.com/apppasswords
- Zoho: https://accounts.zoho.com/home#security/security (App Passwords)

**Avoid:**
- Using your main account password
- Storing passwords in plain text in form schemas
- Committing credentials to version control

### Storage Security

**Response data is stored locally:**
- JSON files in `responses/` directory
- CSV files (if configured)
- No encryption by default (your filesystem security applies)

**Recommendations:**
- Use encrypted filesystems (FileVault, BitLocker, LUKS)
- Restrict directory permissions
- Backup regularly
- Delete old responses you don't need

---

## 🐛 Reporting Security Issues

If you find a security vulnerability, please report it responsibly:

**Email:** arundinakar79@gmail.com  
**Subject:** [SECURITY] GateCrash Forms - [brief description]

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

**We will:**
- Acknowledge within 48 hours
- Investigate and fix ASAP
- Credit you (if desired) in release notes
- Notify users if it's critical

**DO NOT:**
- Open public GitHub issues for security bugs
- Post vulnerabilities on social media
- Exploit the vulnerability

---

## 🔍 Third-Party Dependencies

**Production dependencies:**
- `express` - HTTP server (optional, only if you run `serve`)
- `body-parser` - Form parsing
- `nodemailer` - SMTP email sending

**All are:**
- ✅ Well-maintained
- ✅ Widely used (millions of downloads)
- ✅ Regularly audited by npm

**Check dependency security:**
```bash
npm audit
```

---

## ✅ Security Checklist for Users

Before using GateCrash Forms in production:

- [ ] Reviewed source code on GitHub
- [ ] Verified npm package matches source
- [ ] Tested in isolated environment first
- [ ] Used test SMTP credentials initially
- [ ] Set proper file permissions (600 on config)
- [ ] Using app-specific passwords (not main account)
- [ ] Considered agent-friendly SMTP providers
- [ ] Backed up response data
- [ ] Reviewed example forms for placeholder emails
- [ ] Updated forms to use your actual email addresses

---

## 📜 Compliance & Privacy

**GDPR Compliance:**
- No data sent to external servers
- User has full control of data
- Data stored locally (your jurisdiction)
- No tracking or profiling

**Data Retention:**
- YOU control how long to keep responses
- Delete responses by removing files
- No hidden caches or backups (unless you create them)

**Third-Party Sharing:**
- We share ZERO data (we never see it!)
- Only YOU and your SMTP provider see email content
- Form respondents' data stays with you

---

## 🔄 Security Updates

**How to stay updated:**
- Watch the GitHub repo: https://github.com/Phoenix2479/gatecrash-forms
- Check npm for updates: `npm outdated -g`
- Update regularly: `npm update -g gatecrash-forms`

**Changelog:**
- See GitHub releases for security fixes
- We'll mark security updates clearly

---

## 📞 Contact

**Security Questions:** arundinakar79@gmail.com  
**GitHub Issues:** https://github.com/Phoenix2479/gatecrash-forms/issues  
**Community:** (Discord/forum coming soon)

---

**Built with security in mind.**  
**We crash gates. We don't build new ones.**

*Last updated: 2026-02-15*
