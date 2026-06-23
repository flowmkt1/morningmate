@echo off
chcp 65001 >nul
title morningmate 데모 공개 배포 (GitHub Pages)
cd /d "%~dp0"
set "OWNER=flowmkt1"
set "REPO=morningmate"

echo ============================================
echo   morningmate 데모 공개 배포 (GitHub Pages)
echo   링크 하나면 누구나 볼 수 있게 됩니다.
echo ============================================
echo.

where gh >nul 2>nul
if errorlevel 1 (
  echo [오류] GitHub CLI^(gh^)가 필요합니다. 설치 후 다시 실행해 주세요.
  echo   https://cli.github.com/
  pause & exit /b
)

git rev-parse --is-inside-work-tree >nul 2>nul || git init
git add -A
git -c user.email=flow_mkt1@flow.team -c user.name=flowmkt1 commit -m "update" >nul 2>nul
git branch -M main

echo ▶ GitHub 저장소 확인...
gh repo view %OWNER%/%REPO% >nul 2>nul
if errorlevel 1 (
  echo   새 공개 저장소를 만들고 올립니다: %OWNER%/%REPO%
  gh repo create %OWNER%/%REPO% --public --source=. --remote=origin --push
) else (
  echo   기존 저장소에 올립니다: %OWNER%/%REPO%
  git remote get-url origin >nul 2>nul || git remote add origin https://github.com/%OWNER%/%REPO%.git
  git push -u origin main
)
if errorlevel 1 ( echo. & echo [오류] 업로드 실패. 위 메시지를 확인해 주세요. & pause & exit /b )

echo.
echo ▶ GitHub Pages 켜기...
echo {"source":{"branch":"main","path":"/"}} | gh api -X POST /repos/%OWNER%/%REPO%/pages --input - >nul 2>nul

echo.
echo ============================================
echo   완료! 1~2분 뒤 아래 주소에서 열립니다:
echo.
echo     https://%OWNER%.github.io/%REPO%/
echo.
echo   (이 링크만 공유하면 누구나 볼 수 있어요)
echo ============================================
echo.
echo 다음에 데모를 수정한 뒤에는, 이 BAT를 다시 실행하면 갱신됩니다.
echo.
start "" "https://%OWNER%.github.io/%REPO%/"
pause
