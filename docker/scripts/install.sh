#!/bin/sh

printf "\n[-] Installing OS dependencies...\n\n"

apt-get update
apt-get install -y --no-install-recommends build-essential python

printf "\n[-] Installing NPM dependencies...\n\n"

yarn

printf "\n[-] Building app...\n\n"

npm run build
