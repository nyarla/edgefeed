all:
	@echo hi,

.PHONY: shell dev live test up

shell:
	@nix develop

dev:
	@bun run dev

live:
	@bun run vitest -- --dir live

test:
	@bun run vitest -- --dir src

up:
	@bun run deploy
