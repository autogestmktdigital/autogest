@echo off
echo ============================================
echo   AutoRevenda Bot - Setup de Teste Local
echo ============================================
echo.

:: Detectar Node.js
set "NODE_DIR=C:\Users\peter\nodejs"
if exist "%NODE_DIR%\node.exe" (
    set "PATH=%NODE_DIR%;%PATH%"
) else (
    where node >nul 2>&1
    if errorlevel 1 (
        echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
        pause
        exit /b 1
    )
)

echo [1/6] Verificando Node.js...
node --version

:: Copiar schema SQLite
echo.
echo [2/6] Configurando banco de dados SQLite (sem precisar de MySQL/Docker)...
copy /Y backend\prisma\schema.sqlite.prisma backend\prisma\schema.prisma >nul

:: Criar .env para teste
echo.
echo [3/6] Criando arquivo .env de teste...
(
echo DATABASE_URL="file:./dev.db"
echo JWT_SECRET="chave-secreta-teste-local-12345"
echo JWT_EXPIRES_IN="7d"
echo PORT=3001
echo NODE_ENV=development
echo UPLOAD_DIR="./uploads"
echo MAX_FILE_SIZE_MB=10
) > backend\.env

:: Instalar dependencias do backend
echo.
echo [4/6] Instalando dependencias do backend...
cd backend
call npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)

:: Gerar Prisma e criar banco
echo.
echo [5/6] Criando banco de dados e tabelas...
call npx prisma generate
call npx prisma db push --accept-data-loss
call npx tsx prisma/seed.ts

:: Voltar ao root
cd ..

echo.
echo [6/6] Instalando dependencias do painel admin...
cd admin
call npm install
cd ..

echo.
echo ============================================
echo   Setup concluido com sucesso!
echo ============================================
echo.
echo   Para iniciar o backend:
echo     cd backend ^&^& npm run dev
echo.
echo   Para iniciar o painel admin (outro terminal):
echo     cd admin ^&^& npm run dev
echo.
echo   Acessos:
echo     API:    http://localhost:3001
echo     Admin:  http://localhost:3000
echo.
echo   Login admin:
echo     Email: admin@autorevenda.com
echo     Senha: admin123
echo.
echo   Teste rapido da API:
echo     curl http://localhost:3001/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin@autorevenda.com\",\"password\":\"admin123\"}"
echo.
pause
