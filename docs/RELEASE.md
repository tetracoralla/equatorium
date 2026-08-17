# Equatorium release path

The source is licensed under Apache-2.0 with openAdam as the named copyright
holder. The package remains `private: true` because the current publication
scope is a public GitHub source repository, not npm registry publication.

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

## Remaining owner and hosting steps

1. Choose the GitHub owner/repository slug. Then add `repository`, `bugs`, and `homepage` package metadata and configure the Git remote.
2. Create the public GitHub repository and enable private vulnerability reporting before public announcement.
3. Remove `private: true` only if npm publication is separately selected and validated.

No npm or universal plugin-directory publication is implied by a public source push.
