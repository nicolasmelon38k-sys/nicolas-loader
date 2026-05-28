#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "Verificando ferramentas..."

if ! command -v speedtest >/dev/null 2>&1; then
  echo "Instalando speedtest-go..."
  pkg update -y
  pkg install -y speedtest-go
fi

echo
echo "Iniciando teste de velocidade..."
echo "Hora: $(date)"
echo

speedtest
