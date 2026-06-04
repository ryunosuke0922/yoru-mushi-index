.PHONY: install dev format format-check typecheck lint test build check

install:
	pnpm install

dev:
	pnpm dev

format:
	pnpm format

format-check:
	pnpm format:check

typecheck:
	pnpm typecheck

lint:
	pnpm lint

test:
	pnpm test

build:
	pnpm build

check: format-check typecheck lint test build
