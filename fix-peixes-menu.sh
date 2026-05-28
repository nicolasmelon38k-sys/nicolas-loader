#!/data/data/com.termux/files/usr/bin/bash

sed -i "s/'tycoon'/'tycoon', 'peixes'/" web.js

# remove push inútil do final se existir
sed -i '/appsFront\.push/d' web.js

echo "✅ Peixes adicionado corretamente no menu"
node -c web.js && echo "✅ web.js OK"
