# Security Policy

Quantum ships packages, such as design token definitions and the scripts that turn them into CSS, Sass, JavaScript, Android and design tool formats. It does not run any service, but a problem in the build scripts, the dependencies or the published packages can still affect the projects that use them.

## Supported Versions

Only the latest minor version of each package receives security fixes.

| Package              | Version | Supported          |
| -------------------- | ------- | ------------------ |
| `@quantum-ds/tokens` | 1.10.x  | :white_check_mark: |
| `@quantum-ds/tokens` | < 1.10  | :x:                |

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues, discussions or pull requests.

Send your report to [oss@thalesgroup.com](mailto:oss@thalesgroup.com) instead, with a description of the issue, the affected version, and the steps to reproduce it. We will acknowledge your report, keep you informed while we investigate, and let you know whether the issue is accepted or declined.

Once a fix is available, it is released in a new version and described in the changelog of the affected package, for example [`packages/tokens/CHANGELOG.md`](packages/tokens/CHANGELOG.md).

## Good practices for contributors

:warning: **Never store credentials in source code or configuration files.**

- Block sensitive data from being pushed to GitHub with [git-secrets](https://github.com/awslabs/git-secrets) or a similar pre-commit hook.
- Use GitHub Actions secrets for anything the CI needs.
