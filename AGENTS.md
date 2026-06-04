# AGENTS.md — yoru-mushi-index project guide

## Product

夜虫指数は、夜間に飛翔する昆虫の観察コンディションをエリア単位で推定する Web アプリです。

具体的な観察地点、街灯、採集地、生息地は表示しません。気象、月条件、季節、広域環境から「今夜このエリアで虫が飛びやすいか」を 0-100 の指数として表示します。

## Stack

| Area            | Tech               |
| :-------------- | :----------------- |
| App             | Next.js App Router |
| Language        | TypeScript         |
| Package manager | pnpm               |
| Weather         | Open-Meteo         |
| Moon            | SunCalc            |
| Test            | Vitest             |

## Required checks

Before considering implementation complete, run:

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`make check` runs the same quality gate.

## Location safety

Do not expose:

- exact latitude / longitude
- streetlights
- forest road names
- bridges
- specific park spots
- past exact observation locations
- real-time rare species locations

Use public coarse area fields only. API responses must not include internal representative coordinates.

## Architecture rules

- Keep scoring logic in `packages/core`.
- Keep Open-Meteo response normalization in `packages/weather`.
- Keep moon calculations in `packages/astro`.
- Keep coarse area lookup and public area shaping in `packages/area`.
- Keep UI composition and route handlers in `apps/web`.

## Documentation

- Update `docs/` when behavior, API, scoring, or location policy changes.
- Add large technical decisions to `docs/decision-log/`.
- Add unresolved assumptions to `docs/open-questions.md`.

## Git

Use concise commit prefixes when possible:

```txt
add: ...
update: ...
fix: ...
docs: ...
refactor: ...
test: ...
chore: ...
```
