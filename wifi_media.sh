#!/data/data/com.termux/files/usr/bin/bash

set -e

TESTES=5

echo "Verificando speedtest..."

if ! command -v speedtest >/dev/null 2>&1; then
  echo "Instalando speedtest-go..."
  pkg update -y
  pkg install -y speedtest-go
fi

# tenta encontrar o binário
SPEEDTEST_CMD=$(command -v speedtest || command -v speedtest-go)

if [ -z "$SPEEDTEST_CMD" ]; then
  echo "Erro: speedtest não encontrado mesmo após instalar."
  echo "Tenta rodar manualmente: speedtest-go"
  exit 1
fi

echo
echo "Rodando $TESTES testes..."
echo

total_down=0
total_up=0
total_ping=0

for i in $(seq 1 $TESTES)
do
  echo "Teste $i..."

  result=$($SPEEDTEST_CMD --json)

  down=$(echo $result | grep -o '"download":[0-9.]*' | cut -d: -f2)
  up=$(echo $result | grep -o '"upload":[0-9.]*' | cut -d: -f2)
  ping=$(echo $result | grep -o '"latency":[0-9.]*' | cut -d: -f2)

  echo "Download: $down Mbps"
  echo "Upload:   $up Mbps"
  echo "Ping:     $ping ms"
  echo

  total_down=$(echo "$total_down + $down" | bc)
  total_up=$(echo "$total_up + $up" | bc)
  total_ping=$(echo "$total_ping + $ping" | bc)
done

media_down=$(echo "scale=2; $total_down / $TESTES" | bc)
media_up=$(echo "scale=2; $total_up / $TESTES" | bc)
media_ping=$(echo "scale=2; $total_ping / $TESTES" | bc)

echo "=============================="
echo "        RESULTADO MÉDIO       "
echo "=============================="
echo "Download médio: $media_down Mbps"
echo "Upload médio:   $media_up Mbps"
echo "Ping médio:     $media_ping ms"
echo "=============================="

