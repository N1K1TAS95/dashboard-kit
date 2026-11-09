#!/usr/bin/env bash
# Stampa gli hash SRI (sha384) dei file di dist/, da mettere nell'attributo integrity.
# Uso: ./sri.sh
set -euo pipefail
cd "$(dirname "$0")"
for f in dist/kit.css dist/kit.js; do
    printf '%s  sha384-%s\n' "$f" "$(openssl dgst -sha384 -binary "$f" | openssl base64 -A)"
done
