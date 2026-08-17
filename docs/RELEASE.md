# Equatorium release path

The canonical source is published at
<https://github.com/tetracoralla/equatorium> under Apache-2.0, with openAdam as
the named copyright holder. The package remains `private: true` because the
current publication scope is a public GitHub source repository, not npm
registry publication.

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

## Publication boundaries

- Keep GitHub private vulnerability reporting enabled.
- Remove `private: true` only if npm publication is separately selected and
  validated.
- Treat npm and universal plugin-directory publication as separate release
  decisions with their own checks.

The public source repository does not imply npm or universal plugin-directory
publication.
