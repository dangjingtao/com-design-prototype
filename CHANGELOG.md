# Changelog

All notable changes to Com Design Prototype are recorded here.

## [0.3.0] - 2026-08-27

### Added

- Project repository metadata with GitHub URL confirmed during AI initialization
- Built-in Daily Report Skill based on same-day commits, ledger and task-card evidence
- Daily report output contract under `docs/reports/daily/YYYY-MM-DD.md`

### Changed

- Generated product projects use only `dev` and `prod` as long-lived branches
- `main` is explicitly excluded from generated project work and release flow
- AI Skill Interview now confirms GitHub repository URL and Daily Report Skill usage

## [0.2.0] - 2026-08-27

### Added

- Mira CLI for interactive and scripted prototype creation
- PC / Mobile prototype seed with Com Design tokens and semantic icons
- Prototype Runtime state switching
- Git-based product brief, work ledger and task-card workflow
- CI verification and GitHub Pages / Cloudflare Pages deployment workflows
- `mira setup cicd` bootstrap flow
- Explicit `AGENTS.md` review contract
- Project version-control contract with `VERSION`
- Interactive AI Skill Interview and project skill profile

### Changed

- CI/CD is treated as a first-class seed capability
- Work ledger now requires traceable review evidence before `PASS`

## [0.1.0] - 2026-08-27

### Added

- Initial Com Design Prototype seed baseline
