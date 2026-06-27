# Contributing to Hermes Skills Gallery

Thank you for your interest in contributing! 🎉 The Hermes Skills Gallery thrives on community contributions. Whether you're submitting a new skill, fixing a bug, or improving documentation — you're in the right place.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Setup](#development-setup)
- [How to Submit a Skill](#how-to-submit-a-skill)
- [Skill Guidelines](#skill-guidelines)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community](#community)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards. Please report unacceptable behavior to [dev@uthuman.com](mailto:dev@uthuman.com).

---

## Ways to Contribute

| Type | Examples |
|------|----------|
| 🆕 **Submit a Skill** | Create a new AI agent skill for the gallery |
| 🐛 **Bug Fixes** | Fix issues in existing skills or the CLI tool |
| 📝 **Documentation** | Improve README, docs, JSDoc/Python docstrings |
| ✨ **Features** | Add new gallery features, CLI commands, or integrations |
| 🧪 **Tests** | Write unit and integration tests |
| 🎨 **Design** | Improve terminal UI output, ASCII art, formatting |
| 🌍 **Localization** | Translate skill descriptions or CLI messages |
| 💬 **Community** | Answer questions, review PRs, triage issues |

---

## Development Setup

### Prerequisites
- Python 3.8+
- Git
- A GitHub account

### Clone and Install
```bash
# Fork & clone
git clone https://github.com/YOUR_USERNAME/Hermes-Skills-Gallery.git
cd Hermes-Skills-Gallery

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install in editable mode with dev dependencies
pip install -e ".[dev]"

# Verify installation
hsk --version
```

### Run Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=hermes_skills_gallery

# Run specific test file
pytest tests/test_cli.py
```

---

## How to Submit a Skill

Skills are the heart of this project. Here's how to contribute one:

### Step-by-Step

1. **Choose a Category** — Find the right folder under `skills/` (e.g., `skills/development/`, `skills/devops/`)

2. **Create Your Skill Directory**
   ```bash
   mkdir -p skills/development/my-awesome-skill
   cd skills/development/my-awesome-skill
   ```

3. **Write the Skill File** — Create `skill.py` (or `skill.js`, `skill.ts`, etc.):
   ```python
   """
   Skill: My Awesome Skill
   Description: Does something amazing with data
   Category: Development
   Tags: data, transformation, awesome
   Author: @your-github-handle
   Version: 1.0.0
   Dependencies: pandas, numpy
   
   Usage in Hermes Agent:
       skill_view(name='my-awesome-skill')
   """
   
   def execute(context):
       """Main skill entry point."""
       # Your skill logic here
       pass
   ```

4. **Add Metadata** — Create `skill.json`:
   ```json
   {
     "name": "my-awesome-skill",
     "display_name": "My Awesome Skill",
     "description": "Does something amazing with data transformation",
     "category": "development",
     "tags": ["data", "transformation", "awesome"],
     "author": "@your-github-handle",
     "version": "1.0.0",
     "dependencies": ["pandas", "numpy"],
     "hermes_version": ">=1.0.0",
     "license": "MIT"
   }
   ```

5. **Add a README** (optional but recommended) — `README.md` explaining usage

6. **Test Your Skill**
   ```bash
   hsk validate skills/development/my-awesome-skill
   ```

7. **Submit a PR** — See [Pull Request Process](#pull-request-process)

---

## Skill Guidelines

### Must-Haves
- ✅ Unique `name` (check with `hsk search` first)
- ✅ Clear, descriptive description
- ✅ Appropriate category and tags
- ✅ Valid metadata in `skill.json`
- ✅ Works with Hermes Agent >= 1.0.0

### Quality Standards
- 📝 Well-documented code with docstrings
- 🧪 Tests included where possible
- 🔒 No hardcoded credentials or secrets
- 📦 Minimal and justified dependencies
- 🏷️ Proper error handling and user feedback
- 🌐 Platform-agnostic (or clearly documented limitations)

### What We Don't Accept
- ❌ Duplicate skills (check existing ones first)
- ❌ Malicious code or backdoors
- ❌ Skills that violate the [Code of Conduct](CODE_OF_CONDUCT.md)
- ❌ Skills with excessive or unnecessary dependencies
- ❌ Auto-generated or placeholder skills

---

## Code Style

### Python (primary)
- Follow [PEP 8](https://pep8.org/)
- Use type hints where practical
- Maximum line length: 100 characters
- Docstrings in Google or NumPy style
- Run `black` and `isort` before committing:
  ```bash
  black hermes_skills_gallery/ skills/
  isort hermes_skills_gallery/ skills/
  ```

### JSON / Metadata
- 2-space indentation
- Alphabetically sorted keys where practical
- No trailing commas

### JavaScript / TypeScript (for JS-based skills)
- Use ES6+ syntax
- Prefer `const` over `let`, avoid `var`
- Semicolons required
- 2-space indentation

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
| Type | Usage |
|------|-------|
| `feat` | New feature or skill |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Tooling, build, CI |

### Examples
```
feat(skills): add pdf-watermark skill to documents category
fix(cli): resolve --category flag not filtering properly
docs(readme): update installation instructions for bun
test(installer): add tests for skill dependency resolution
```

---

## Pull Request Process

1. **Fork & Branch**
   ```bash
   git checkout -b feat/my-new-skill
   ```

2. **Make Changes** — Follow the [Code Style](#code-style) and [Skill Guidelines](#skill-guidelines)

3. **Test Thoroughly**
   ```bash
   hsk validate skills/your-category/your-skill
   pytest
   ```

4. **Commit with Convention** — Use [Conventional Commits](#commit-messages)

5. **Push & Open PR**
   ```bash
   git push origin feat/my-new-skill
   ```

6. **Fill PR Template** — Describe what you changed, why, and how to test it

7. **Review Process**
   - A maintainer will review within 1-3 business days
   - Address feedback by pushing additional commits
   - Once approved, a maintainer will merge your PR

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] New skills have valid `skill.json` metadata
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention
- [ ] No breaking changes without discussion

---

## Issue Reporting

### Bug Reports
Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python version, Hermes version)
- Terminal output or error logs

### Feature Requests
Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) and include:
- Clear problem statement
- Proposed solution
- Alternatives considered
- Use cases

---

## Community

- 💬 **Discussions**: [GitHub Discussions](https://github.com/uthumany/Hermes-Skills-Gallery/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/uthumany/Hermes-Skills-Gallery/issues)
- 📧 **Email**: [dev@uthuman.com](mailto:dev@uthuman.com)
- 🤖 **Hermes Agent Docs**: [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs)

---

## Recognition

All contributors are recognized in our [Contributors](https://github.com/uthumany/Hermes-Skills-Gallery/graphs/contributors) graph. Top contributors may be invited to join the maintainer team!

---

<p align="center">Thank you for making Hermes Skills Gallery better! 🚀</p>
