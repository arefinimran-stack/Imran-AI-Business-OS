# Contributing to IMRAN AI

Thank you for helping build IMRAN AI.

## Development workflow

1. Fork the repository or create a feature branch from the current approved development branch.
2. Work on one focused issue or feature at a time.
3. Keep changes scoped to the relevant app or module.
4. Run the relevant app's build before opening a pull request.
5. Open a pull request with purpose, screenshots where useful, files changed, test results, required environment variables, and known limitations.
6. Do not merge directly to the default branch. A maintainer must review and approve changes.

## Current product boundaries

- The founder operating system, Arefin Chamber, The Chamber, and IA² Holdings are distinct products and brands.
- The Chamber is intended to support independent lawyer and firm workspaces.
- Do not claim that AI legal research, legal citations, authentication, secure storage, or matter workflows are production-ready unless implemented and tested.
- Legal content and generated authorities require primary-source verification and advocate review.
- C3 Lifestyle and Bold Cotton remain research-stage; do not start execution work without an approved issue.

## Security and confidentiality

- Never commit API keys, passwords, tokens, service-role keys, private certificates, or .env files.
- Never use real client names, case documents, confidential communications, or personal data in development fixtures, screenshots, logs, or pull requests.
- Do not weaken Row Level Security, authentication, audit logging, or access controls to make a demo work.
- Do not run migrations or destructive operations against production without explicit maintainer approval.
- Use synthetic data for tests and demos.

## Pull request checklist

- [ ] Build passes for the affected app.
- [ ] No secrets or confidential data included.
- [ ] Data access is tenant/organisation scoped where applicable.
- [ ] Error and empty states are handled.
- [ ] Claims about integrations and capabilities match what is actually connected.
- [ ] Any legal source or citation behaviour is documented and verifiable.
