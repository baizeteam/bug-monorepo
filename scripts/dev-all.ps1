$ErrorActionPreference = "Stop"

Write-Host "[1/3] 启动 MySQL 容器..."
pnpm db:up

Write-Host "[2/3] 构建 shared 包..."
pnpm --filter @bug/shared build

Write-Host "[3/3] 并行启动 be-main / fe-admin / fe-h5 ..."
pnpm concurrently `
  -n be-main,fe-admin,fe-h5 `
  -c cyan,green,magenta `
  "pnpm --filter @bug/be-main start:dev" `
  "pnpm --filter @bug/fe-admin dev" `
  "pnpm --filter @bug/fe-h5 dev"
