
<p align="center">
  <img src="https://raw.githubusercontent.com/uthumany/Hermes-Skills-Gallery/master/assets/banner.svg" alt="Hermes Skills Gallery" width="800" />
</p>

<p align="center">
  <strong>The Ultimate All-in-One Gallery of 1,600+ AI Agent Skills for Hermes Agent</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/hermes-skills-gallery"><img src="https://img.shields.io/npm/v/hermes-skills-gallery?color=blue&label=npm" alt="npm version"></a>
  <a href="https://github.com/uthumany/Hermes-Skills-Gallery/blob/master/LICENSE"><img src="https://img.shields.io/github/license/uthumany/Hermes-Skills-Gallery" alt="License: MIT"></a>
  <a href="https://github.com/uthumany/Hermes-Skills-Gallery"><img src="https://img.shields.io/badge/skills-1672-brightgreen" alt="Skills Count"></a>
  <a href="https://github.com/uthumany/Hermes-Skills-Gallery"><img src="https://img.shields.io/badge/categories-49-orange" alt="Categories"></a>
  <a href="https://github.com/uthumany/Hermes-Skills-Gallery"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

**Hermes Skills Gallery** is the definitive collection of AI agent skills for [Hermes Agent](https://hermes-agent.nousresearch.com) by [Nous Research](https://nousresearch.com). One command installs access to **1672+ skills** organized across **49 categories** — everything from frontend development to security auditing, from creative coding to multi-agent orchestration.

## ⚡ Quick Install — Every Package Manager

| Package Manager | Install Command |
|----------------|-----------------|
| **npm** | `npm install -g hermes-skills-gallery` |
| **yarn** | `yarn global add hermes-skills-gallery` |
| **pnpm** | `pnpm add -g hermes-skills-gallery` |
| **bun** | `bun add -g hermes-skills-gallery` |
| **npx** (no install) | `npx hermes-skills-gallery` |
| **curl** | `curl -fsSL https://raw.githubusercontent.com/uthumany/Hermes-Skills-Gallery/master/scripts/install.sh \| bash` |
| **pip** | `pip install hermes-skills-gallery` |
| **uv** | `uv tool install hermes-skills-gallery` |

```bash
# One command, every skill
npx hermes-skills-gallery
```

## 🎯 Why Hermes Skills Gallery?

- **1,600+ Skills** — The largest collection of AI agent skills on the internet
- **49 Categories** — Organized by domain: Dev, Design, AI, Security, DevOps, and more
- **Multi-Platform** — Install via npm, yarn, pnpm, bun, pip, uv, or curl
- **Zero Config** — Works instantly after install
- **Beautiful CLI** — Colorful terminal UI with interactive browsing
- **Programmatic API** — Require/import the catalog in your own tools
- **Always Growing** — Community contributions welcome

## 📂 Category Breakdown


| 🤖 AI & ML | **187** | ML & AI Engineering, Self-Evaluation & Reflection, Reasoning & Decision Making |
| 🎨 Design & UX | **137** | UI/UX Design, Creative Coding, Branding & Design |
| 💻 Development | **203** | Frontend Development, Backend Development, Software Architecture |
| ☁️ Cloud & DevOps | **165** | Cloud Platforms, DevOps & CI/CD, Monitoring & Observability |
| 🔒 Security | **58** | Security & Permissions |
| 📝 Content & Docs | **221** | Content Creation, Communication & Summarization, Knowledge Management |
| 🔗 APIs & Automation | **148** | API Integration, Tool Use & Function Calling, Workflow Automation |
| 🌐 Web & Search | **82** | Web Browsing & Research, Information Retrieval & Search, Browser Automation |
| 🧠 Agent Systems | **178** | Memory & Context, Multi-Agent Coordination, Planning & Goal Setting |
| 📊 Data & Analytics | **85** | Data Analysis & Visualization, Database Management |
| 📱 Social & Media | **69** | Social Media, Email & Marketing, Voice & Audio |
| 💼 Business & Productivity | **119** | Project Management, CRM & Sales, E-Commerce |
| 🖥️ Desktop & Gaming | **10** | Game Development |

## 🚀 Usage

### Interactive Mode
```bash
hermes-skills-gallery          # Full interactive browser
hsk                           # Short alias
```

### Command Line
```bash
hermes-skills list             # Browse all categories
hermes-skills search "docker"  # Search skills
hermes-skills category devops  # Browse a category
hermes-skills stats            # View gallery stats
hermes-skills install <name>   # Install a skill via hermes CLI
```

### Python API
```python
from hermes_skills_gallery import load_catalog
catalog = load_catalog()
print(catalog['total_skills'])  # 1672
for cat in catalog['categories']:
    print(cat['name'], cat['count'])
```

### Node.js API
```js
const gallery = require('hermes-skills-gallery');
console.log(gallery.stats());       // { total_skills, total_categories }
console.log(gallery.listCategories()); // All categories
console.log(gallery.search('react'));  // Search results
```

## 📁 Project Structure

```
Hermes-Skills-Gallery/
├── README.md                   # You are here
├── LICENSE                     # MIT License
├── CHANGELOG.md                # Release history
├── CONTRIBUTING.md             # How to contribute
├── CODE_OF_CONDUCT.md          # Community standards
├── SECURITY.md                 # Security policy
├── pyproject.toml              # Python package config
├── package.json                # npm package config
├── cli.js                      # Node.js CLI entry point
├── index.js                    # Node.js API
├── hermes_skills_gallery/      # Python package
│   ├── __init__.py
│   ├── cli.py                  # Python CLI
│   └── data/                   # Skills catalog data
├── scripts/
│   └── install.sh              # curl-based installer
├── data/
│   ├── skills-catalog.json     # Complete skills catalog
│   └── category-summary.md     # Category overview
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
└── assets/
    └── banner.svg
```

## 🏷️ GitHub Topics

`hermes-agent` `ai-skills` `agent-skills` `ai-agents` `cli-tool` `terminal` `developer-tools` `automation` `skill-management` `nous-research` `multi-agent` `ai-engineering` `devops` `security` `frontend` `backend` `ml-engineering` `creative-coding` `npm-package` `python-package`

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to add new skills
- Code style guide
- Pull request process
- Development setup

## 📄 License

MIT © [Uthuman & Co](https://github.com/uthumany)

## ⭐ Star History

If you find this useful, please **star the repo** to help others discover it!

---

<p align="center">
  <strong>Built with ❤️ for the Hermes Agent community</strong><br>
  <a href="https://github.com/uthumany/Hermes-Skills-Gallery">github.com/uthumany/Hermes-Skills-Gallery</a>
</p>
