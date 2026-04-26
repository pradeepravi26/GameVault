set shell := ["zsh", "-cu"]

web:
    pnpm --dir apps/web dev

api:
    pnpm --dir apps/api dev

db-up:
    docker compose -f infra/compose.yaml up -d

db-down:
    docker compose -f infra/compose.yaml down

db-seed:
    docker exec -i gamevault-mysql mysql -uroot -proot game_vault < packages/db/sql/schema.sql
    docker exec -i gamevault-mysql mysql -uroot -proot game_vault < packages/db/sql/advanced.sql
    docker exec -i gamevault-mysql mysql -uroot -proot game_vault < packages/db/sql/metadata_seed.sql

typecheck-api:
    pnpm --dir apps/api typecheck

typecheck-contracts:
    pnpm --dir packages/contracts typecheck

typecheck-db:
    pnpm --dir packages/db typecheck
