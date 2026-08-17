# Equatorium release path

The source is prepared for a public repository, but publication is intentionally blocked until the owner chooses the license and remote destination. The package remains `private: true` so an incomplete legal or distribution decision cannot be published accidentally.

## Technical release gate

Run from a clean checkout on Node.js 22 or newer:

```bash
npm ci
npm run check
npm pack --dry-run
```

Before announcing Agent availability, install the built `plugins/equatorium` bundle into a fresh Codex environment and verify:

- the plugin is discovered as Equatorium;
- the only public tool is `sei_run`;
- one Chinese natural-language task per supported adapter routes to one bounded `sei_run` call;
- invalid or ambiguous input does not fall back to model interpretation.

## Owner decisions before publication

1. Choose the open-source license. Then add the matching `LICENSE` file and `license` package field.
2. Choose the GitHub owner/repository slug. Then add `repository`, `bugs`, and `homepage` package metadata and configure the Git remote.
3. Choose distribution scope: source-only GitHub release, Codex plugin distribution, npm package, or a combination. Remove `private: true` only if npm publication is explicitly selected.
4. Enable GitHub private vulnerability reporting before public announcement.

No remote creation, push, release, or registry publication is part of the local technical gate.
