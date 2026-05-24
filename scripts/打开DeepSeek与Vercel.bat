@echo off
chcp 65001 >nul
start https://platform.deepseek.com/api_keys
start https://vercel.com/chenjunjia1/emotion-ai-h5-v2/settings/environment-variables
start "" "%~dp0..\docs\接入DeepSeek-3步.md"
echo 已打开：DeepSeek 密钥页、Vercel 环境变量、说明文档
pause
