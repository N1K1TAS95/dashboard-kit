# Security

[Italiano](SECURITY.it.md)

## Reporting a vulnerability

Do not open a public issue. Use GitHub's private reporting:
**Security → Report a vulnerability** on the repository page
(https://github.com/N1K1TAS95/dashboard-kit/security/advisories/new).

Expect a reply within a few days. This is a personal project, with no guaranteed response times.

## What is covered

The kit is only browser-side CSS and JavaScript, with no dependencies and no network requests.
`kit.js` does not use `innerHTML`, `eval` or inline scripts, and is designed to work with a strict
Content-Security-Policy.

## Versions and integrity

- `v*` tags are immutable: the repository forbids moving or deleting them.
- Always pin a version in the CDN URL and use the `integrity` attribute (SRI)
  shown in the README. Hashes are recomputed with `./sri.sh`.
- Avoid `@main` or `@latest`: they are not immutable.
