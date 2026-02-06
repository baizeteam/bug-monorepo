# Bug 平台 - 本地部署脚本
# 用法: .\scripts\deploy.ps1 -ServerIp "175.178.132.217" -ApiUrl "http://175.178.132.217:3000"
# 需要先手动 SSH 一次以接受主机密钥，或使用 scp 时会提示

param(
    [string]$ServerIp = "175.178.132.217",
    [string]$ApiUrl = "http://175.178.132.217",   # 前端请求的 API 地址（经 Nginx 代理后无端口）
    [string]$User = "root"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot + "\.."

Write-Host "========== 1. 构建 ==========" -ForegroundColor Cyan
Set-Location $ProjectRoot

# 构建 shared
pnpm --filter @bug/shared build
# 构建后端
pnpm --filter @bug/be-main build
# 构建前端（带 API 地址；admin 部署在 /admin/ 路径）
$env:VITE_API_BASE_URL = $ApiUrl
$env:VITE_BASE = "/admin"
pnpm --filter @bug/fe-admin build
Remove-Item Env:VITE_BASE -ErrorAction SilentlyContinue
pnpm --filter @bug/fe-h5 build

Write-Host "`n========== 2. 准备上传 ==========" -ForegroundColor Cyan
$TempDir = "$env:TEMP\bug-platform-deploy"
Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# 复制前端产物
Copy-Item -Recurse "$ProjectRoot\packages\fe-admin\dist\*" "$TempDir\admin\"
Copy-Item -Recurse "$ProjectRoot\packages\fe-h5\dist\*" "$TempDir\h5\"
# 复制后端
Copy-Item -Recurse "$ProjectRoot\packages\be-main\dist\*" "$TempDir\api\"

# 创建 .env
$envContent = @"
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root123
DB_DATABASE=bug_platform
JWT_SECRET=bug-platform-prod-$(Get-Random -Count 1)
JWT_EXPIRES_IN=7d
PORT=3000
"@
$envContent | Out-File -FilePath "$TempDir\api\.env" -Encoding utf8

Write-Host "`n========== 3. 上传到服务器 ==========" -ForegroundColor Cyan
Write-Host "执行 scp，请按提示输入密码（共 5 次）..." -ForegroundColor Yellow
# 先确保远程目录存在
ssh "${User}@${ServerIp}" "mkdir -p /var/www/bug-platform"
# 上传部署产物
scp -r "$TempDir\admin" "$TempDir\h5" "$TempDir\api" "${User}@${ServerIp}:/var/www/bug-platform/"
# 上传服务器脚本和 nginx 配置
scp "$ProjectRoot\scripts\server-setup.sh" "${User}@${ServerIp}:/var/www/bug-platform/"
scp "$ProjectRoot\scripts\nginx-bug-platform.conf" "${User}@${ServerIp}:/var/www/bug-platform/"

Write-Host "`n========== 4. 后续步骤 (SSH 登录后执行) ==========" -ForegroundColor Cyan
Write-Host @"
请 SSH 登录:  ssh ${User}@${ServerIp}

1) 首次部署需先运行:  cd /var/www/bug-platform && bash server-setup.sh
   （查找 nginx、安装 Docker、启动 MySQL、创建目录）

2) 启动后端:
   cd /var/www/bug-platform/api
   pm2 delete bug-api 2>/dev/null; pm2 start dist/main.js --name bug-api
   pm2 save

3) 配置 Nginx:
   将 scripts/nginx-bug-platform.conf 复制到服务器
   /etc/nginx/sites-available/bug-platform.conf
   执行: ln -sf /etc/nginx/sites-available/bug-platform.conf /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx

访问: http://${ServerIp}/ (H5)  http://${ServerIp}/admin/ (管理后台)
"@ -ForegroundColor Green

Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
Write-Host "`n部署文件已上传完成" -ForegroundColor Green
