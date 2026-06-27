
<p align="center">
  <img src="https://raw.githubusercontent.com/uthumany/Skills-Gallery/master/assets/banner.svg" alt="Skills Gallery" width="800" />
</p>

<p align="center">
  <strong>The Ultimate All-in-One Gallery of 1,672+ AI Agent Skills</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/skills-gallery"><img src="https://img.shields.io/npm/v/skills-gallery?color=blue&label=npm" alt="npm version"></a>
  <a href="https://github.com/uthumany/Skills-Gallery/blob/master/LICENSE"><img src="https://img.shields.io/github/license/uthumany/Skills-Gallery" alt="License: MIT"></a>
  <a href="https://github.com/uthumany/Skills-Gallery"><img src="https://img.shields.io/badge/skills-1672-brightgreen" alt="Skills Count"></a>
  <a href="https://github.com/uthumany/Skills-Gallery"><img src="https://img.shields.io/badge/categories-49-orange" alt="Categories"></a>
  <a href="https://github.com/uthumany/Skills-Gallery"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

**Skills Gallery** is the definitive collection of AI agent skills. One command installs access to **1,672+ skills** organized across **49 categories** — everything from frontend development to security auditing, from creative coding to multi-agent orchestration. Compatible with 60+ AI agent tools.

## ⚡ Quick Install — Every Package Manager

| Package Manager | Install Command |
|----------------|-----------------|
| **npm** | `npm install -g skills-gallery` |
| **yarn** | `yarn global add skills-gallery` |
| **pnpm** | `pnpm add -g skills-gallery` |
| **bun** | `bun add -g skills-gallery` |
| **npx** (no install) | `npx skills-gallery` |
| **curl** | `curl -fsSL https://raw.githubusercontent.com/uthumany/Skills-Gallery/master/scripts/install.sh \| bash` |
| **pip** | `pip install skills-gallery` |
| **uv** | `uv tool install skills-gallery` |

```bash
# One command, every skill
npx skills-gallery
```

## 🎯 Why Skills Gallery?

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

## 🔧 Compatible With 60+ AI Agent Tools

Skills Gallery integrates seamlessly with **60+ AI agent tools** across every platform — autonomous agents, CLI tools, IDEs, and web-based environments. One skill catalog, everywhere you work.

---

### 🤖 Autonomous Agentic AI Agents

| Tool | Tool | Tool |
|------|------|------|
| Google Antigravity | Manus | Hermes Agent |
| OpenManus | Open-Agent | agenticSeek |
| Open Human | OWL | OpenHands |
| Lemon AI | GWL | Oclai |
| AiPy | Pi.dev | Codex |

---

### ⌨️ CLI Autonomous Agents

| Tool | Tool | Tool |
|------|------|------|
| Gemini CLI | OpenCLI | OpenClaw |
| OpenCode | QWEN Code | Aider |
| Warp | Claude Code | Crush |
| Amp | Goose | Droid |
| OWL CLI | agenticSeek CLI | Codex CLI |

---

### 🖥️ IDE Autonomous Agents

| Tool | Tool | Tool |
|------|------|------|
| VS Code | Cline | Claude Code |
| Aider | OpenHands | OpenCode IDE |
| QWEN Code Studio | Codex IDE | Gemini Code Assist |
| DeepSeek IDE | Warp IDE | Amp IDE |
| Crush IDE | Goose IDE | Droid Studio |

---

### 🌐 Web Autonomous Agents

| Tool | Tool | Tool |
|------|------|------|
| lovable.dev | DeepSeek GUI | Pi.dev |
| OpenManus Web | Open-Agent Web | agenticSeek Web |
| Lemon AI Web | Oclai Web | Open Human Web |
| OWL Web | OpenHands Web | browser-use |
| GWL Web | Manus Web | Google Antigravity Web |

---

## 🚀 Usage

### Interactive Mode
```bash
skills-gallery                # Full interactive browser
skg                           # Short alias
```

### Command Line
```bash
skills-gallery list             # Browse all categories
skills-gallery search "docker"  # Search skills
skills-gallery category devops  # Browse a category
skills-gallery stats            # View gallery stats
skills-gallery install <name>   # Install a skill via hermes CLI
```

### Python API
```python
from skills_gallery import load_catalog
catalog = load_catalog()
print(catalog['total_skills'])  # 1672
for cat in catalog['categories']:
    print(cat['name'], cat['count'])
```

### Node.js API
```js
const gallery = require('skills-gallery');
console.log(gallery.stats());       // { total_skills, total_categories }
console.log(gallery.listCategories()); // All categories
console.log(gallery.search('react'));  // Search results
```

## 📁 Project Structure

```
Skills-Gallery/
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
├── skills_gallery/             # Python package
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

`hermes-agent` `ai-skills` `agent-skills` `ai-agents` `cli-tool` `terminal` `developer-tools` `automation` `skill-management` `uthuman-inc` `multi-agent` `ai-engineering` `devops` `security` `frontend` `backend` `ml-engineering` `creative-coding` `npm-package` `python-package`

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to add new skills
- Code style guide
- Pull request process
- Development setup

## 📄 License

MIT © [uthuman Inc](https://github.com/uthumany)

## ⭐ Star History

If you find this useful, please **star the repo** to help others discover it!

---

<p align="center">
  <strong>Built with ❤️ by uthuman Inc</strong><br>
  <a href="https://github.com/uthumany/Skills-Gallery">github.com/uthumany/Skills-Gallery</a>
</p>
