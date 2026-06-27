# Security Policy

## Supported Versions

Hermes Skills Gallery is actively maintained. Security updates are provided for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Hermes Skills Gallery seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

📧 **Email**: [dev@uthuman.com](mailto:dev@uthuman.com)

Please include the following in your report:

- A detailed description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact
- Any suggested fixes (if available)

### What to Expect

| Timeline | Action |
|----------|--------|
| Within 48 hours | Acknowledgment of your report |
| Within 7 days | Initial assessment and severity classification |
| Within 30 days | Patch release for confirmed vulnerabilities |
| Ongoing | Coordination on public disclosure |

### Severity Classification

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | Remote code execution, auth bypass, data exposure | 24-48 hours |
| **High** | Privilege escalation, denial of service | 3-7 days |
| **Medium** | Information disclosure, limited impact | 1-2 weeks |
| **Low** | Minor issues, theoretical concerns | Next release cycle |

## Security Best Practices for Skill Authors

When creating skills for the gallery, follow these security guidelines:

### DO
- ✅ Use environment variables for configuration
- ✅ Validate and sanitize all user inputs
- ✅ Follow the principle of least privilege
- ✅ Keep dependencies updated and audited
- ✅ Use pinned dependency versions with known hashes
- ✅ Handle errors gracefully without leaking sensitive information

### DON'T
- ❌ Hardcode API keys, tokens, or credentials
- ❌ Execute arbitrary user-supplied code without sandboxing
- ❌ Access files outside the intended scope
- ❌ Make network requests to untrusted endpoints
- ❌ Log sensitive data (passwords, tokens, PII)
- ❌ Include compiled binaries without source code

### Credential Management

If your skill requires API access:

1. **Use Hermes Agent's credential store**: `hermes.config.get('api_key')`
2. **Document required permissions**: List scopes in `skill.json`
3. **Use OAuth where possible**: Avoid long-lived API keys
4. **Never log credentials**: Use `repr()` or masking for debug output

```python
# ✅ Good: Use environment variable
api_key = os.environ.get("MY_API_KEY")

# ✅ Good: Use Hermes config
api_key = context.config.get("my_service_api_key")

# ❌ Bad: Hardcoded credential
api_key = "sk-abc123def456ghi789"
```

## Dependency Security

We use automated dependency scanning. Skill authors should:

- Pin dependency versions in `skill.json`
- Use the minimum required version range
- Regularly check for CVEs in dependencies
- Include integrity hashes for external resources

## Disclosure Policy

We follow a coordinated disclosure process:

1. Reporter submits vulnerability privately
2. We investigate and develop a fix
3. We release a patched version
4. We publish a security advisory after the patch is available
5. Credit is given to the reporter (with permission)

**We do not offer a bug bounty program at this time**, but we deeply appreciate and publicly acknowledge responsible disclosures.

---

<p align="center"><em>Security is a shared responsibility. Thank you for helping keep Hermes Skills Gallery safe!</em></p>
