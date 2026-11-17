#!/usr/bin/env bash
# Prints the SRI hashes (sha384) of the files in dist/, to put in the integrity attribute.
# Usage: ./sri.sh
set -euo pipefail
cd "$(dirname "$0")"
for f in dist/kit.css dist/kit.js dist/kit-icons.js; do
    printf '%s  sha384-%s\n' "$f" "$(openssl dgst -sha384 -binary "$f" | openssl base64 -A)"
done
